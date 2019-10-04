import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatAll, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import {
  FileRequestActions,
  FileRequestActionTypes,
  LoadFileRequestsError,
  LoadFileRequestsSuccess,
  UpsertFileRequest,
} from '../actions/file-request.actions';
import { PersistenceService } from '../services/persistence.service';
import { FileWatcherService } from '../services/file-watcher.service';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { selectFeatureState as selectFileRequestState } from '../reducers/file-request.reducer';
import { selectFileById, selectFileRequestByFileId } from '../reducers/selectors';
import { FileCryptoService } from '../services/file-crypto.service';
import { FileRequest } from '../models/file-request.model';
import { DownloadActionTypes, DownloadFinished } from '../actions/download.actions';
import { UpdateSharedFile } from '../actions/shared-file.actions';


@Injectable()
export class FileRequestEffects {

  constructor(private actions$: Actions<FileRequestActions>,
              private store: Store<State>,
              private cryptoService: FileCryptoService,
              private persistenceService: PersistenceService,
              private fileWatcherService: FileWatcherService,
              private snackbar: MatSnackBar) {
  }

  @Effect()
  loadFileRequests$ = this.actions$.pipe(
    ofType(FileRequestActionTypes.LoadFileRequests),

    switchMap(() => this.persistenceService.getFileRequests()),

    // Tells the FileWatcherService to listen for changes in the loaded file requests
    tap((fileRequests) => this.fileWatcherService.watchFileRequests(...fileRequests)),

    // Dispatches LoadFileRequestsSuccess action with the stored file requests
    map((fileRequests) => new LoadFileRequestsSuccess({ fileRequests })),

    // Catches any errors and displays a snackbar
    catchError((err: Error | any) => {
      const error = err instanceof Error ? err : new Error(`${ err }`);
      this.snackbar.open(`Fehler beim Laden der FileRequests: ${ err.message }`);
      return of(new LoadFileRequestsError({ error }));
    }),
  );

  @Effect({ dispatch: false })
  watchFileRequests$ = this.actions$.pipe(
    ofType(
      FileRequestActionTypes.AddFileRequest,
      FileRequestActionTypes.AddFileRequests,
      FileRequestActionTypes.UpsertFileRequest,
      FileRequestActionTypes.UpsertFileRequests,
    ),
    map((action) =>
      (action.type === FileRequestActionTypes.AddFileRequest || action.type === FileRequestActionTypes.UpsertFileRequest)
        ? [ action.payload.fileRequest ]
        : action.payload.fileRequests,
    ),
    FileRequestEffects.combineFileRequestWithStore(this.store),
    map((fileRequests) => fileRequests.filter((fileRequest) => !fileRequest.deleted)),
    filter((fileRequests) => fileRequests.length > 0),
    tap((fileRequests) => this.fileWatcherService.watchFileRequests(...fileRequests)),
  );

  @Effect({ dispatch: false })
  stopWatchingFileRequests$ = this.actions$.pipe(
    ofType(
      FileRequestActionTypes.DeleteFileRequest,
      FileRequestActionTypes.DeleteFileRequests,
      FileRequestActionTypes.UpsertFileRequest,
      FileRequestActionTypes.UpsertFileRequests,
      FileRequestActionTypes.UpdateFileRequest,
      FileRequestActionTypes.UpdateFileRequests,
    ),
    map((action: FileRequestActions) => {
      switch (action.type) {
        case FileRequestActionTypes.DeleteFileRequest:
          return [ action.payload.id ];
        case FileRequestActionTypes.DeleteFileRequests:
          return action.payload.ids;
        case FileRequestActionTypes.UpsertFileRequest:
          return action.payload.fileRequest.deleted ? [ action.payload.fileRequest.id as string ] : [];
        case FileRequestActionTypes.UpsertFileRequests:
          return action.payload.fileRequests.filter((fr) => fr.deleted).map((fr) => fr.id as string);
        case FileRequestActionTypes.UpdateFileRequest:
          return action.payload.fileRequest.changes.deleted ? [ action.payload.fileRequest.id as string ] : [];
        case FileRequestActionTypes.UpdateFileRequests:
          return action.payload.fileRequests.filter((fr) => fr.changes.deleted).map((fr) => fr.id as string);
      }
    }),
    filter((requestIds) => requestIds.length > 0),
    map((requestIds) => requestIds.map((id) => ({ id }))),
    tap((fileRequestIds) => this.fileWatcherService.stopWatchingFileRequests(...fileRequestIds)),
  );

  @Effect()
  generateKeyPair$: Observable<UpsertFileRequest> = this.actions$.pipe(
    // Filters the wanted actions
    ofType(
      FileRequestActionTypes.AddFileRequest,
      FileRequestActionTypes.AddFileRequests,
      FileRequestActionTypes.UpsertFileRequest,
      FileRequestActionTypes.UpsertFileRequests,
      FileRequestActionTypes.UpdateFileRequest,
      FileRequestActionTypes.UpdateFileRequests,
    ),
    // Gets the file requests based on the action type
    map((action: FileRequestActions) => {
      switch (action.type) {
        case FileRequestActionTypes.AddFileRequest:
        case FileRequestActionTypes.UpsertFileRequest:
          return [ action.payload.fileRequest ];
        case FileRequestActionTypes.AddFileRequests:
        case FileRequestActionTypes.UpsertFileRequests:
          return action.payload.fileRequests;
        case FileRequestActionTypes.UpdateFileRequest:
          return [ { id: action.payload.fileRequest.id, ...action.payload.fileRequest.changes } ];
        case FileRequestActionTypes.UpdateFileRequests:
          return action.payload.fileRequests.map(({ id, changes }) => ({ id, ...changes }));
      }
    }),
    // Combines (partial) file requests with them from the store
    FileRequestEffects.combineFileRequestWithStore(this.store),
    // Filters file requests which already have keys, are deleted or outgoing
    map((fileRequests) => fileRequests.filter((fileRequest) => !fileRequest.deleted && !fileRequest.publicKey && fileRequest.isIncoming)),
    // Flattens the file requests to a single stream
    concatAll(),
    // Generates a keyPair and returns it with the file request
    switchMap((fileRequest) => combineLatest([ of(fileRequest), this.cryptoService.generateRSAKeyPair() ])),
    // Combines the file request and the key pair and maps it to a new action
    map(([ fileRequest, keyPair ]) => new UpsertFileRequest({ fileRequest: { ...fileRequest, ...keyPair } })),
  );

  @Effect()
  decryptFile$: Observable<UpdateSharedFile> = this.actions$.pipe(
    ofType(DownloadActionTypes.DownloadFinished),
    // Collects data from the store needed to decrypt the blob
    switchMap((downloadAction: DownloadFinished) => combineLatest([
      this.store.select(selectFileRequestByFileId, downloadAction.payload.sharedFileId),
      this.store.select(selectFileById, downloadAction.payload.sharedFileId),
      of(downloadAction.payload.file),
    ])),
    // Filters the event if the file has already been decrypted
    filter(([ _, sharedFile ]) => !sharedFile.isDecrypted),
    // Extracts the data required for decryption
    map(([ fileRequest, sharedFile, blob ]) => ({
      privateKey: fileRequest.privateKey,
      sharedFileId: sharedFile.id,
      encryptedIV: sharedFile.encryptedIV,
      encryptedSymmetricKey: sharedFile.encryptedSymmetricKey,
      blob,
    })),
    // Filters the event if something is undefined
    filter((data) => Object.values(data).indexOf(undefined) === -1),
    // Decrypts the symmetric key and iv
    switchMap((data) => combineLatest([
      of(data.sharedFileId),
      this.cryptoService.unwrapSymmetricKey(data.encryptedSymmetricKey, data.privateKey),
      this.cryptoService.decryptIV(data.encryptedIV, data.privateKey),
      of(data.blob),
    ])),
    // Decrypts the blob
    switchMap(([ id, symmetricKey, iv, blob ]) => combineLatest([ of(id), this.cryptoService.decryptBlob(blob, symmetricKey, iv) ])),
    // Creates an action that updates the shared file
    map(([ id, blob ]) => new UpdateSharedFile({ sharedFile: { id, changes: { isDecrypted: true, blob } } })),
    // catchError((error) => new DecryptionFailedAction({error})),
  );


  static combineFileRequestWithStore = (store: Store<State>) => (source: Observable<FileRequest[]>) => source.pipe(
    // Gets the current file requests from the store
    withLatestFrom(store.select(selectFileRequestState)),
    // Combines the (partial) file request from the action with the one from the store,
    map(([ fileRequests, state ]) => fileRequests.map(
      (fileRequest) => ({ ...(state.entities[fileRequest.id] || {}), ...fileRequest }),
    ) as FileRequest[]),
  );

}

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatAll, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, NEVER, Observable, of } from 'rxjs';
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
import { selectFileRequestByFileId } from '../reducers/selectors';
import { FileCryptoService } from '../services/file-crypto.service';
import { FileRequest } from '../models/file-request.model';
import {
  LoadSharedFilesError,
  LoadSharedFilesSuccess,
  SharedFileActions,
  SharedFileActionTypes,
  UpdateSharedFile,
} from '../actions/shared-file.actions';
import { selectFileById } from '../reducers/shared-file.reducer';
import { FileService } from '../services/file.service';
import { FileStatusActionTypes, UpsertFileStatus } from '../actions/file-status.actions';
import { SharedFile } from '../models/shared-file.model';
import { FileStatus, FileStatusType } from '../models/file-status.model';


@Injectable()
export class FileRequestEffects {

  constructor(private actions$: Actions<FileRequestActions | SharedFileActions>,
              private store: Store<State>,
              private snackbar: MatSnackBar,
              private cryptoService: FileCryptoService,
              private fileService: FileService,
              private persistenceService: PersistenceService,
              private fileWatcherService: FileWatcherService) {
  }

  @Effect()
  loadFileRequests$ = this.actions$.pipe(
    ofType(FileRequestActionTypes.LoadFileRequests),

    // Loads the file requests from IndexedDB
    switchMap(() => this.persistenceService.getFileRequests()),

    // Dispatches LoadFileRequestsSuccess action with the stored file requests
    map((fileRequests) => new LoadFileRequestsSuccess({ fileRequests })),

    // Catches any errors and displays a snackbar
    catchError((err: Error | any) => {
      const error = err instanceof Error ? err : new Error(`${ err }`);
      this.snackbar.open(`Fehler beim Laden der FileRequests: ${ err.message }`);
      return of(new LoadFileRequestsError({ error }));
    }),
  );

  @Effect()
  loadSharedFiles$ = this.actions$.pipe(
    ofType(SharedFileActionTypes.LoadSharedFiles),
    switchMap(() => this.persistenceService.getFiles()),
    map((sharedFiles) => new LoadSharedFilesSuccess({ sharedFiles })),
    catchError((err: Error | any) => {
      const error = err instanceof Error ? err : new Error(`${ err }`);
      this.snackbar.open(`Fehler beim Laden der Dateien: ${ err.message }`);
      return of(new LoadSharedFilesError({ error }));
    }),
  );

  @Effect({ dispatch: false })
  watchFileRequests$ = this.actions$.pipe(
    ofType(
      FileRequestActionTypes.AddFileRequest,
      FileRequestActionTypes.AddFileRequests,
      FileRequestActionTypes.UpsertFileRequest,
      FileRequestActionTypes.UpsertFileRequests,
      FileRequestActionTypes.LoadFileRequestsSuccess,
    ),
    map((action) =>
      (action.type === FileRequestActionTypes.AddFileRequest || action.type === FileRequestActionTypes.UpsertFileRequest)
        ? [ action.payload.fileRequest ]
        : action.payload.fileRequests,
    ),
    FileRequestEffects.combineFileRequestWithStore(this.store),
    map((fileRequests) => fileRequests.filter((fileRequest) => !fileRequest.isDeleted)),
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
          return action.payload.fileRequest.isDeleted ? [ action.payload.fileRequest.id as string ] : [];
        case FileRequestActionTypes.UpsertFileRequests:
          return action.payload.fileRequests.filter((fr) => fr.isDeleted).map((fr) => fr.id as string);
        case FileRequestActionTypes.UpdateFileRequest:
          return action.payload.fileRequest.changes.isDeleted ? [ action.payload.fileRequest.id as string ] : [];
        case FileRequestActionTypes.UpdateFileRequests:
          return action.payload.fileRequests.filter((fr) => fr.changes.isDeleted).map((fr) => fr.id as string);
      }
    }),
    filter((requestIds) => requestIds.length > 0),
    map((requestIds) => requestIds.map((id) => ({ id }))),
    tap((fileRequestIds) => this.fileWatcherService.stopWatchingFileRequests(...fileRequestIds)),
  );

  @Effect({ dispatch: false })
  downloadFile$ = this.actions$.pipe(
    ofType(SharedFileActionTypes.DownloadSharedFile),
    tap((action) => this.fileWatcherService.downloadFile(action.payload.sharedFile)),
  );

  @Effect({ dispatch: false })
  stopDownloadingFile$ = this.actions$.pipe(
    ofType(SharedFileActionTypes.StopDownloadingSharedFile),
    tap((action) => this.fileWatcherService.stopDownload(action.payload.sharedFile.id)),
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
    // Filters file requests which already have keys, are isDeleted or outgoing
    map((fileRequests) => fileRequests.filter((fileRequest) => !fileRequest.isDeleted && !fileRequest.publicKey && fileRequest.isIncoming)),
    // Flattens the file requests to a single stream
    concatAll(),
    // Generates a keyPair and returns it with the file request
    switchMap((fileRequest) => combineLatest([ of(fileRequest), this.cryptoService.generateRSAKeyPair() ])),
    // Combines the file request and the key pair and maps it to a new action
    map(([ fileRequest, keyPair ]) => new UpsertFileRequest({ fileRequest: { ...fileRequest, ...keyPair } })),
  );

  /*@Effect({ resubscribeOnError: true })
  decryptFile$ = this.actions$.pipe(
    ofType(FileStatusActionTypes.UpsertFileStatus),
    // Filters DownloadCompleted actions
    filter((action: UpsertFileStatus) => action.payload.fileStatus.type === FileStatusType.DownloadCompleted),
    // Gets the file
    switchMap((action: UpsertFileStatus) => this.store.select(selectFileById, action.payload.fileStatus.id)),
    // Collects data from the store needed to decrypt the blob
    switchMap((file: SharedFile) => combineLatest([
      this.store.select(selectFileRequestByFileId, file.id),
      of(file),
    ])),
    // Filters the event if the file has already been decrypted
    filter(([ _, sharedFile ]) => !sharedFile.isDecrypted),
    // Extracts the data required for decryption
    map(([ fileRequest, sharedFile ]) => ({
      privateKey: fileRequest.privateKey,
      sharedFileId: sharedFile.id,
      encryptedIV: sharedFile.encryptedIV,
      encryptedSymmetricKey: sharedFile.encryptedSymmetricKey,
      blob: sharedFile.blob,
    })),
    // Filters the event if something is undefined
    filter((data) => Object.values(data).indexOf(undefined) === -1),
    // Updates the file status to FileDecrypting
    tap((data) => this.updateFileStatus(data.sharedFileId, FileStatusType.FileDecrypting, 'Entschlüsseln...')),
    // Decrypts the symmetric key and iv
    switchMap((data) => combineLatest([
      of(data.sharedFileId),
      this.cryptoService.unwrapSymmetricKey(data.encryptedSymmetricKey, data.privateKey),
      this.cryptoService.decryptIV(data.encryptedIV, data.privateKey),
      of(data.blob),
    ])),
    // Decrypts the blob
    switchMap(([ id, symmetricKey, iv, blob ]) => combineLatest([ of(id), this.cryptoService.decryptBlob(blob, symmetricKey, iv).pipe(
      // Catches any errors and updates the file status to Error
      catchError((error: Error) => {
        this.updateFileStatus(id, FileStatusType.Error, 'Fehler: ' + error.message);
        return NEVER;
      }),
    ) ])),
    // Updates the file status to FileDecrypted and to Decompressing
    tap(([ id ]) => {
      this.updateFileStatus(id, FileStatusType.FileDecrypted, 'Entschlüsselt');
      this.updateFileStatus(id, FileStatusType.FileDecompressing, 'Entpacken...');
    }),
    // Decompresses the blob, since the data shouldbe compressed (but catch an error if it isn't)
    switchMap(([ id, blob ]) => combineLatest([ of(id), this.fileService.decompress(blob).pipe(catchError((_) => of(blob))) ])),
    // Updates the file status, indicating everything is done
    tap(([ id ]) => {
      this.updateFileStatus(id, FileStatusType.FileDecompressed, 'Entpackt');
      this.updateFileStatus(id, FileStatusType.Done, 'Fertig!');
    }),
    // Creates an action that updates the shared file
    map(([ id, blob ]) => new UpdateSharedFile({ sharedFile: { id, changes: { isDecrypted: true, blob, downloadedAt: new Date() } } })),
  ) as Observable<UpdateSharedFile>;*/


  static combineFileRequestWithStore = (store: Store<State>) => (source: Observable<FileRequest[]>) => source.pipe(
    // Gets the current file requests from the store
    withLatestFrom(store.select(selectFileRequestState)),
    // Combines the (partial) file request from the action with the one from the store,
    map(([ fileRequests, state ]) => fileRequests.map(
      (fileRequest) => ({ ...(state.entities[fileRequest.id] || {}), ...fileRequest }),
    ) as FileRequest[]),
  );

  private updateFileStatus(id: string, status: FileStatusType, message: string) {
    this.fileWatcherService.updateFileStatus(<FileStatus>{ id, type: status, message });
  }
}

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, flatMap, tap } from 'rxjs/operators';
import { merge, of } from 'rxjs';
import {
  FileRequestActions,
  FileRequestActionTypes,
  LoadFileRequestsError,
  LoadFileRequestsSuccess,
} from '../actions/file-request.actions';
import { PersistenceService } from '../services/persistence.service';
import { FileService } from '../services/file.service';
import { FirebaseService } from '../services/firebase.service';


@Injectable()
export class FileRequestEffects {

  constructor(private actions$: Actions<FileRequestActions>,
              private persistenceService: PersistenceService,
              private fileService: FileService,
              private firebaseService: FirebaseService,
              private snackbar: MatSnackBar) {
  }

  @Effect({ resubscribeOnError: true })
  loadFileRequests$ = this.actions$.pipe(
    ofType(FileRequestActionTypes.LoadFileRequests),

    flatMap(() => this.persistenceService.getFileRequests(),
      /*.pipe(
        catchError((err: Error) => {
          this.snackbar.open(`Fehler beim Laden der FileRequests: ${ err.message }`);
          return of([] as FileRequest[]);
        }),
      ),*/
    ),

    flatMap((fileRequests) => merge(
      // Dispatches LoadFileRequestsSuccess action with the stored file requests
      of(new LoadFileRequestsSuccess({ fileRequests })),
      // Watches the stored file requests for changes
      this.watchFileRequests(fileRequests),
      // Watches the stored file requests for changes in their files
      this.watchFiles(fileRequests),
    )),

    // Catches any errors and displays a snackbar
    catchError((err: Error | any) => {
      const error = err instanceof Error ? err : new Error(`${ err }`);
      this.snackbar.open(`Fehler beim Laden der FileRequests: ${ err.message }`);
      return of(new LoadFileRequestsError({ error }));
    }),
  );

  watchFileRequests = (fileRequests: { id: string }[]) =>
    this.firebaseService.watchFileRequests(fileRequests.map((fr) => fr.id)).pipe(
      tap((fileRequestAction) => this.persistenceService.storeFileRequests(fileRequestAction.payload.fileRequest)),
    );

  watchFiles = (fileRequests: { id: string }[]) =>
    this.firebaseService.watchFilesFromFileRequests(fileRequests.map((fr) => fr.id)).pipe(
      tap((fileAction) => this.persistenceService.storeFiles(fileAction.payload.sharedFile)),
    );

}

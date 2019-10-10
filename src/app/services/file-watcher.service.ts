import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { Action } from '@ngrx/store';
import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { catchError, flatMap, map } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import {
  DownloadActionTypes,
  DownloadFailed,
  DownloadFinished,
  DownloadProgressUpdate,
  DownloadStarted,
} from '../actions/download.actions';
import { MatSnackBar } from '@angular/material';
import { AddFileToFileRequest } from '../actions/file-request.actions';

@Injectable({
  providedIn: 'root',
})
export class FileWatcherService implements OnDestroy {

  private requestSubscriptions: { [key: string]: Subscription } = {};
  private fileSubscriptions: { [key: string]: Subscription } = {};
  private actionsSubject = new Subject<Action>();

  constructor(private firebaseService: FirebaseService, private snackbar: MatSnackBar) {
  }

  ngOnDestroy() {
    Object.values(this.requestSubscriptions).forEach((subscription) => subscription.unsubscribe());
    Object.values(this.fileSubscriptions).forEach((subscription) => subscription.unsubscribe());
    this.actionsSubject.complete();
  }

  get actions$() {
    return this.actionsSubject.asObservable();
  }

  watchFileRequests(...fileRequests: FileRequest[]) {
    for (const fileRequest of fileRequests) {
      if (!this.requestSubscriptions[fileRequest.id]) {
        // Watches the file requests for changes
        this.requestSubscriptions[fileRequest.id] = this.firebaseService.watchFileRequest(fileRequest.id).subscribe((fileRequestAction) => {
          // Emits the action
          this.actionsSubject.next(fileRequestAction);
        });
      }

      // Watches the files in the file requests for changes if the device has created the file request
      if (!this.fileSubscriptions[fileRequest.id] && fileRequest.isIncoming) {
        this.fileSubscriptions[fileRequest.id] = this.firebaseService.watchFilesFromFileRequest(fileRequest.id).subscribe((fileAction) => {
          // Checks if the action is uploaded
          const sharedFile: SharedFile = { ...fileAction.payload.sharedFile, fileRequest: fileRequest.id };
          if (sharedFile.uploadedAt) {
            // Downloads the file
            this.downloadFile(sharedFile).subscribe((downloadAction) => {
              switch (downloadAction.type) {
                // Checks if the file was downloaded successfully
                case DownloadActionTypes.DownloadFinished:
                  // Deletes the file from the server
                  this.firebaseService.deleteFile(sharedFile).subscribe({
                    // Ignores errors or a successful deletion, since a cloud function cleans up old files anyway
                    error: () => {
                    },
                  });
                  break;
                // Checks if the download failed and displays a snackbar
                case DownloadActionTypes.DownloadFailed:
                  this.snackbar.open(`Fehler beim Laden von '${ sharedFile.fileName }' ${ downloadAction.payload.error.message }`);
                  break;
              }
              // Emits the action about the download status of the file
              this.actionsSubject.next(downloadAction);
            });
          }
          // Emits the file action
          this.actionsSubject.next(fileAction);
          // Emits an action to add a file to the file request
          this.actionsSubject.next(new AddFileToFileRequest({ fileRequestId: fileRequest.id, sharedFileId: sharedFile.id }));
        });
      }
    }
  }

  stopWatchingFileRequests(...fileRequests: { id: string }[]) {
    for (const fileRequest of fileRequests) {
      if (this.fileSubscriptions[fileRequest.id]) {
        this.requestSubscriptions[fileRequest.id].unsubscribe();
        delete this.requestSubscriptions[fileRequest.id];
      }
      if (this.fileSubscriptions[fileRequest.id]) {
        this.fileSubscriptions[fileRequest.id].unsubscribe();
        delete this.fileSubscriptions[fileRequest.id];
      }
    }
  }

  downloadFile(sharedFile: SharedFile): Observable<DownloadStarted | DownloadProgressUpdate | DownloadFinished | DownloadFailed> {
    return this.firebaseService.downloadFile(sharedFile).pipe(
      flatMap((event) => {
        switch (event.type) {
          case HttpEventType.Sent:
            return of(new DownloadStarted({ sharedFileId: sharedFile.id }));
          case HttpEventType.DownloadProgress:
            return of(new DownloadProgressUpdate({
              sharedFileId: sharedFile.id,
              loadedBytes: event.loaded,
              totalBytes: event.total,
            }));
          case HttpEventType.Response:
            return event.ok
              ? this.firebaseService.getFileMetadata(sharedFile).pipe(
                map((metadata) => new DownloadFinished({
                  sharedFileId: sharedFile.id,
                  file: new File([ event.body ], sharedFile.fileName, {
                    type: metadata.contentType || event.body.type,
                    lastModified: new Date(metadata.updated).getTime(),
                  }),
                })),
              )
              : of(new DownloadFailed({ sharedFileId: sharedFile.id, error: new Error(event.statusText) }));
          default:
            return from([]);
        }
      }),
      catchError((error) => of(new DownloadFailed({ sharedFileId: sharedFile.id, error }))),
    );
  }

}

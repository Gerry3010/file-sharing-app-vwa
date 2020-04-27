import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Subject, Subscription } from 'rxjs';
import { Action } from '@ngrx/store';
import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { HttpEventType } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { AddFileToFileRequest } from '../actions/file-request.actions';
import { UpsertFileStatus } from '../actions/file-status.actions';
import { FileStatus, FileStatusType } from '../models/file-status.model';
import { UpdateSharedFile } from '../actions/shared-file.actions';

@Injectable({
  providedIn: 'root',
})
export class FileWatcherService implements OnDestroy {

  private requestSubscriptions: { [sharedFileId: string]: Subscription } = {};
  private fileSubscriptions: { [sharedFileId: string]: Subscription } = {};
  private downloadSubscriptions: { [sharedFileId: string]: Subscription } = {};
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
          if (sharedFile.uploadedAt && (!sharedFile.isDecrypted || sharedFile.downloadedAt)) {
            console.log(sharedFile);
            // Downloads the file
            this.downloadFile(sharedFile);
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

  downloadFile(sharedFile: SharedFile) {
    this.fileSubscriptions[sharedFile.id] = this.firebaseService.downloadFile(sharedFile).subscribe((event) => {
      let fileStatus = <FileStatus>{ id: sharedFile.id };
      switch (event.type) {
        case HttpEventType.Sent:
          fileStatus = { ...fileStatus, type: FileStatusType.DownloadStarted, message: 'Herunterladen...' };
          break;
        case HttpEventType.DownloadProgress: {
          const loaded = event.loaded;
          const total = event.total;
          const bytes = { loaded, total };
          fileStatus = { ...fileStatus, type: FileStatusType.DownloadUpdate, message: 'Herunterladen...', bytes };
          break;
        }
        case HttpEventType.Response: {
          if (event.ok) { // Checks if the file was downloaded successfully
            const totalBytes = event.body ? event.body.size : 0;
            const bytes = { loaded: totalBytes, total: totalBytes };

            fileStatus = { ...fileStatus, type: FileStatusType.DownloadCompleted, message: 'Download abgeschlossen', bytes };

            // Updates the shared file; important that this happens before the file status action is emitted
            this.actionsSubject.next(new UpdateSharedFile({ sharedFile: { id: sharedFile.id, changes: { blob: event.body } } }));

            // Deletes the file from the server
            this.firebaseService.deleteFile(sharedFile).subscribe({
              // Ignores errors or a successful deletion, since a cloud function cleans up old files anyway
              error: () => {
              },
            });
            // TODO: Delete the file from Firestore
            this.firebaseService.removeSharedFile(sharedFile).subscribe({
              // Ignores errors or a successful deletion, since a cloud function cleans up old files anyway
              error: () => {
              },
            });
          } else {
            // Emits download failed
            // displays a snackbar // this.snackbar.open(`Fehler beim Laden von '${ sharedFile.fileName }' ${ event.statusText }`);
            fileStatus = { ...fileStatus, message: 'Download fehlgeschlagen', type: FileStatusType.Error };
          }
          break;
        }
      }
      // Emits the action about the download status of the file
      if (fileStatus) {
        this.updateFileStatus(fileStatus);
      }
    }, (error) => {
      this.updateFileStatus({ id: sharedFile.id, type: FileStatusType.Error, message: error.toString() });
    });
  }

  stopDownload(sharedFileId: string) {
    if (this.downloadSubscriptions[sharedFileId]) {
      this.downloadSubscriptions[sharedFileId].unsubscribe();
    }
  }

  updateFileStatus(fileStatus: FileStatus) {
    this.actionsSubject.next(new UpsertFileStatus({ fileStatus }));
  }

  async* downloadAndDecryptFile(sharedFile: SharedFile, privateKey: CryptoKey) {
    const encryptedBlob = await this.firebaseService.downloadFile(sharedFile).toPromise();
    yield 'TODO: eg. Decrypting...';
    return;
  }

  /*downloadFile(sharedFile: SharedFile): Observable<DownloadStarted | DownloadProgressUpdate | DownloadFinished | DownloadFailed> {
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
  }*/

}

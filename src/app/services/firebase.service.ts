import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { from, merge, Observable, throwError } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { AddSharedFile, UpsertSharedFile } from '../actions/shared-file.actions';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { AddFileRequest, UpsertFileRequest } from '../actions/file-request.actions';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  fileRequestCollection: AngularFirestoreCollection<FileRequest>;

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage, private http: HttpClient) {
    this.fileRequestCollection = firestore.collection<FileRequest>('fileRequests');
  }

  /**
   * Listens for changes in the file requests for the given ids and emits them directly
   * @param ids  the ids of the file requests
   */
  public watchFileRequests(ids: string[]): Observable<AddFileRequest | UpsertFileRequest> {
    return merge(
      ...ids.map((id) => this.fileRequestCollection.doc<FileRequest>(id).snapshotChanges().pipe(
        map((action) => {
          const fileRequest: FileRequest = { ...action.payload.data(), id, deleted: action.type === 'removed' };
          switch (action.type) {
            case 'value':
            case 'added': {
              return new AddFileRequest({ fileRequest });
            }
            case 'modified': {
              return new UpsertFileRequest({ fileRequest });
            }
            case 'removed': {
              return new UpsertFileRequest({ fileRequest });
            }
          }
        }),
        // filter((fr) => fr !== undefined),
        // map((fr) => ({ ...fr, id })),
      )),
    );
  }

  /**
   * Listens for changes in the files for the given file request ids and emits them as actions
   * @param ids  the ids of the file requests
   */
  public watchFilesFromFileRequests(ids: string[]): Observable<AddSharedFile | UpsertSharedFile> {
    return merge(
      ...ids.map((id) => this.fileRequestCollection.doc(id).collection<SharedFile>('files').stateChanges()),
    ).pipe(
      flatMap((actions) => actions.map((action) => {
        const sharedFile = {
          fileRequest: action.payload.doc.ref.parent.parent.id,
          ...action.payload.doc.data(),
          id: action.payload.doc.id,
        };
        switch (action.type) {
          case 'added': {
            return new AddSharedFile({ sharedFile });
          }
          case 'modified': {
            return new UpsertSharedFile({ sharedFile });
          }
          /* case 'removed':
            // Do nothing since the file is saved locally
            return new DeleteSharedFile({ id: sharedFile.id }); */
        }
      })),
    );
  }

  public createFileRequest(title: string, message: string) {
    const currentDate = new Date();
    return from(this.fileRequestCollection.add(<FileRequest>{ title, message, createdAt: currentDate, updatedAt: currentDate } as any));
  }

  public updateFileRequest(fileRequest: FileRequest) {
    const { title, message } = fileRequest;
    return from(this.fileRequestCollection.doc(fileRequest.id).update(<FileRequest>{ title, message, updatedAt: new Date() }));
  }

  public addSharedFile(sharedFile: SharedFile) {
    if (!sharedFile.fileRequest) {
      return throwError(new Error('Das FileRequest ist nicht mehr vorhanden!'));
    }
    const { fileName, fromDevice } = sharedFile;
    return from(this.getFilesCollection(sharedFile.fileRequest).add(<SharedFile>{ fileName, fromDevice, createdAt: new Date() }));
  }

  public removeSharedFile(sharedFile: SharedFile) {
    if (!sharedFile.fileRequest) {
      return throwError(new Error('Das FileRequest ist nicht mehr vorhanden!'));
    }
    return from(this.getFilesCollection(sharedFile.fileRequest).doc(sharedFile.id).delete());
  }


  private getFilesCollection = (fileRequestId: string) => this.fileRequestCollection.doc(fileRequestId).collection('files');


  public uploadFile(sharedFile: SharedFile) {
    return this.getFileRef(sharedFile).put(sharedFile.blob, { contentType: sharedFile.blob.type });
  }

  public downloadFile(sharedFile: SharedFile) {
    return this.getFileRef(sharedFile).getDownloadURL().pipe(
      flatMap((downloadUrl) => this.http.get(downloadUrl, { responseType: 'blob', reportProgress: true, observe: 'events' })),
      // map(blob => new File([ blob ], sharedFile.fileName, { type: blob.type })), // TO DO: Check if correct
    );
  }

  public deleteFile(sharedFile: SharedFile) {
    return this.getFileRef(sharedFile).delete();
  }


  private getFileRef = (sharedFile: SharedFile) => {
    if (sharedFile.fileRequest) {
      return this.storage.ref(`fileRequests/${ sharedFile.fileRequest }/files/${ sharedFile.id }`);
    } else {
      throw new Error('Die Datei ist nicht mehr mit einem FileRequest verknüpft!');
    }
  };

}

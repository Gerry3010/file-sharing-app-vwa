import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { Observable, merge, from } from 'rxjs';
import { filter, flatMap, map } from 'rxjs/operators';
import { AddSharedFile, DeleteSharedFile, SharedFileActions, UpsertSharedFile } from '../actions/shared-file.actions';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';

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
  public watchFileRequests(ids: string[]): Observable<FileRequest> {
    return merge(
      ...ids.map((id) => this.fileRequestCollection.doc<FileRequest>(id).valueChanges().pipe(
        filter((fr) => fr !== undefined),
        map((fr) => ({ ...fr, id })),
      )),
    );
  }

  /**
   * Listens for changes in the files for the given file request ids and emits them as actions
   * @param ids  the ids of the file requests
   */
  public watchFilesFromFileRequests(ids: string[]): Observable<SharedFileActions[]> {
    return merge(
      ...ids.map((id) => this.fileRequestCollection.doc(id).collection<SharedFile>('files').stateChanges()),
    ).pipe(
      map((actions) => actions.map((action) => {
        const sharedFile = { ...action.payload.doc.data(), id: action.payload.doc.id };
        switch (action.type) {
          case 'added': {
            return new AddSharedFile({ sharedFile });
          }
          case 'modified': {
            return new UpsertSharedFile({ sharedFile });
          }
          case 'removed':
            return new DeleteSharedFile({ id: sharedFile.id });
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
    const { fileName, fromDevice } = sharedFile;
    return from(this.getFilesCollection(sharedFile.fileRequest).add(<SharedFile>{ fileName, fromDevice, createdAt: new Date() }));
  }

  public removeSharedFile(sharedFile: SharedFile) {
    return from(this.getFilesCollection(sharedFile.fileRequest).doc(sharedFile.id).delete());
  }


  private getFilesCollection = (fileRequestId: string) => this.fileRequestCollection.doc(fileRequestId).collection('files');


  public uploadFile(sharedFile: SharedFile) {
    return this.getFileRef(sharedFile).put(sharedFile.blob);
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


  private getFileRef = (sharedFile: SharedFile) => this.storage.ref(`fileRequests/${ sharedFile.fileRequest }/files/${ sharedFile.id }`);

}

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { from, Observable, throwError } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { UpsertSharedFile } from '../actions/shared-file.actions';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { UpsertFileRequest } from '../actions/file-request.actions';
import * as firebase from 'firebase/app';
import FullMetadata = firebase.storage.FullMetadata;
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  fileRequestCollection: AngularFirestoreCollection<FileRequest>;

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage, private http: HttpClient) {
    this.fileRequestCollection = firestore.collection<FileRequest>('fileRequests');
  }

  static timestampToDate(timestamp?: unknown): Date | undefined {
    return (timestamp && timestamp instanceof Timestamp && timestamp.toDate)
      ? timestamp.toDate()
      : (timestamp instanceof Date)
        ? timestamp
        : undefined;
  }

  /**
   * Listens for changes in the file requests for the given ids and emits them directly
   * @param id  the id of the file request
   */
  public watchFileRequest(id: string): Observable<UpsertFileRequest> {
    return this.fileRequestCollection.doc<FileRequest>(id).snapshotChanges().pipe(
      map((action) => {
        let fileRequest: FileRequest = { ...action.payload.data(), id, isDeleted: !action.payload.exists };
        fileRequest = {
          ...fileRequest,
          createdAt: FirebaseService.timestampToDate(fileRequest.createdAt),
          updatedAt: FirebaseService.timestampToDate(fileRequest.updatedAt),
        };
        return new UpsertFileRequest({ fileRequest });
        /*switch (action.type) {
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
        }*/
      }),
      // filter((fr) => fr !== undefined),
      // map((fr) => ({ ...fr, id })),
    );
  }

  /**
   * Listens for changes in the files for the given file request ids and emits them as actions
   * @param id  the id of the file request
   */
  public watchFilesFromFileRequest(id: string): Observable<UpsertSharedFile> {
    return this.fileRequestCollection.doc(id).collection<SharedFile>('files').stateChanges().pipe(
      flatMap((actions) => actions
        .filter((action) => action.type !== 'removed')
        .map((action) => {
          let sharedFile = <SharedFile>{
            fileRequest: action.payload.doc.ref.parent.parent.id,
            ...action.payload.doc.data(),
            id: action.payload.doc.id,
            isDecrypted: false,
          };
          sharedFile = {
            ...sharedFile,
            createdAt: FirebaseService.timestampToDate(sharedFile.createdAt),
            lastModified: FirebaseService.timestampToDate(sharedFile.lastModified),
            uploadedAt: FirebaseService.timestampToDate(sharedFile.uploadedAt),
            downloadedAt: FirebaseService.timestampToDate(sharedFile.downloadedAt),
          };
          return new UpsertSharedFile({ sharedFile });
          /*switch (action.type) {
            case 'added': {
              return new AddSharedFile({ sharedFile });
            }
            case 'modified': {
              return new UpsertSharedFile({ sharedFile });
            }*/
          /* case 'removed':
            // Do nothing since the file is saved locally
            return new DeleteSharedFile({ id: sharedFile.id });
        }*/
        })),
    );
  }

  public createFileRequest(title: string, message?: string) {
    const currentDate = new Date();
    const fileRequest = <FileRequest>{ title, message: message || null, createdAt: currentDate, updatedAt: currentDate };
    return from(this.fileRequestCollection.add(fileRequest as any))
      .pipe(
        map((ref) => (<FileRequest>{
          ...fileRequest,
          id: ref.id,
          isDeleted: false,
          files: [],
          isIncoming: true,
        })),
      );
  }

  public updateFileRequest(fileRequest: FileRequest) {
    const { title, message } = fileRequest;
    return from(this.fileRequestCollection.doc(fileRequest.id).update(<FileRequest>{ title, message, updatedAt: new Date() }));
  }

  public deleteFileRequest(fileRequest: { id: string }) {
    return from(this.fileRequestCollection.doc(fileRequest.id).delete());
  }

  public addSharedFile(sharedFile: Partial<SharedFile>) {
    if (!sharedFile.fileRequest) {
      return throwError(new Error('Das FileRequest ist nicht mehr vorhanden!'));
    }
    const { fileName, fromDevice, encryptedIV, encryptedSymmetricKey, lastModified } = sharedFile;
    return from(this.getFilesCollection(sharedFile.fileRequest).add(<SharedFile>{
      fileName,
      fromDevice,
      createdAt: new Date(),
      lastModified: lastModified || null,
      encryptedIV: encryptedIV || null,
      encryptedSymmetricKey: encryptedSymmetricKey || null,
    }));
  }

  public updatedSharedFile(sharedFile: SharedFile) {
    if (!sharedFile.fileRequest) {
      return throwError(new Error('Das FileRequest ist nicht mehr vorhanden!'));
    }
    const { id, fileName, uploadedAt, fromDevice, encryptedIV, encryptedSymmetricKey, lastModified } = sharedFile;
    return from(this.getFilesCollection(sharedFile.fileRequest).doc<SharedFile>(id).update({
      fileName,
      fromDevice,
      uploadedAt: uploadedAt || null,
      lastModified: lastModified || null,
      encryptedIV: encryptedIV || null,
      encryptedSymmetricKey: encryptedSymmetricKey || null,
    }));
  }

  public removeSharedFile(sharedFile: SharedFile) {
    if (!sharedFile.fileRequest) {
      return throwError(new Error('Das FileRequest ist nicht mehr vorhanden!'));
    }
    return from(this.getFilesCollection(sharedFile.fileRequest).doc(sharedFile.id).delete());
  }


  private getFilesCollection = (fileRequestId: string) => this.fileRequestCollection.doc(fileRequestId).collection('files');


  public uploadFile(sharedFile: SharedFile): AngularFireUploadTask {
    return this.getFileRef(sharedFile).put(sharedFile.blob, { contentType: sharedFile.blob.type });
  }

  public downloadFile(sharedFile: SharedFile) {
    return this.getFileRef(sharedFile).getDownloadURL().pipe(
      flatMap((downloadUrl) => this.http.get(downloadUrl, { responseType: 'blob', reportProgress: true, observe: 'events' })),
      // map(blob => new File([ blob ], sharedFile.fileName, { type: blob.type })), // TO DO: Check if correct
    );
  }

  public getFileMetadata(sharedFile: SharedFile) {
    return this.getFileRef(sharedFile).getMetadata() as Observable<FullMetadata>;
  }

  public deleteFile(sharedFile: { id: string, fileRequest?: string }) {
    return this.getFileRef(sharedFile).delete();
  }


  private getFileRef = (sharedFile: { id: string, fileRequest?: string }) => {
    if (sharedFile.fileRequest) {
      return this.storage.ref(`fileRequests/${ sharedFile.fileRequest }/files/${ sharedFile.id }`);
    } else {
      throw new Error('Die Datei ist nicht mehr mit einem FileRequest verknüpft!');
    }
  };

}

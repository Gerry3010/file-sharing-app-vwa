import { Injectable } from '@angular/core';
import { FileCryptoService } from './file-crypto.service';
import { FirebaseService } from './firebase.service';
import { FileWatcherService } from './file-watcher.service';
import { SharedFile } from '../models/shared-file.model';
import { FileRequest } from '../models/file-request.model';
import { AngularFireUploadTask } from '@angular/fire/storage/task';
import { FileService } from './file.service';
import { FileStatus, FileStatusType } from '../models/file-status.model';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface FileUploadData {
  id?: string;
  uploadTask?: AngularFireUploadTask;
  sharedFile?: SharedFile;
  error?: any;
}

interface FileUploadServiceUploadTask {
  fileRequest: FileRequest;
  file: File;
  deviceName: string;
  subject: BehaviorSubject<FileUploadData>;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {

  private uploads: { [id: string]: FileUploadServiceUploadTask } = {};

  constructor(private crypto: FileCryptoService, private firebase: FirebaseService, private watcher: FileWatcherService,
              private fileService: FileService) {
  }

  // TODO: Refactor, so this can return an observable(s) with
  //  1. The id of the file
  //  2. The upload task
  //  3. The full shared file

  queueUpload(fileRequest: FileRequest, file: File, deviceName: string): Observable<FileUploadData> {
    const id = Math.random().toString(36).substring(7);
    const subject = new BehaviorSubject({});
    this.uploads[id] = { deviceName, file, fileRequest, subject };
    const uploadPromise = this.uploadAndEncryptFile(id);
    return merge(
      subject.asObservable(),
      from(uploadPromise).pipe(
        catchError((error) => of({ error } as FileUploadData)),
      ),
    );
  }

  async uploadAndEncryptFile(id: string): Promise<undefined> {
    const { subject: dataSubject, fileRequest, file, deviceName } = this.uploads[id];

    if (fileRequest.isIncoming) {
      return Promise.reject(new Error('Dateien können nur an ausgehende FileRequests gesendet werden.'));
    }
    if (!fileRequest.publicKey) {
      return Promise.reject(new Error('Kein Schlüssel zum Verschlüsseln vorhanden.'));
    }

    // Add the shared file information to Cloud Firestore
    const sharedFileRef = await this.firebase.addSharedFile({
      fileName: file.name,
      fromDevice: deviceName,
      fileRequest: fileRequest.id,
    }).toPromise();
    // Dispatch the id to the id subject
    dataSubject.next({ id: sharedFileRef.id });
    // Update the file status to FileCompressing
    this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.FileCompressing, message: 'Komprimieren...' });
    // Compress the blob
    const compressedBlob = await this.fileService.compress(file).toPromise();
    // Update the file status to FileCompressed
    this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.FileCompressed, message: 'Komprimiert' });
    // Generate a symmetric key
    const symmetricKey = await this.crypto.generateAESKey().toPromise();
    // Update the file status to FileEncrypting
    this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.FileEncrypting, message: 'Verschlüsseln...' });
    // Encrypt the compressed blob
    const { blob, iv } = await this.crypto.encryptBlob(compressedBlob, symmetricKey).toPromise();
    // Encrypt the symmetric key and IV for uploading
    const encryptedSymmetricKey = await this.crypto.wrapSymmetricKey(symmetricKey, fileRequest.publicKey).toPromise();
    const encryptedIV = await this.crypto.encryptIV(iv, fileRequest.publicKey).toPromise();
    // Update the file status to FileEncrypting
    this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.FileEncrypted, message: 'Verschlüsselt' });

    // Create a shared file object
    const sharedFile = {
      id: sharedFileRef.id,
      fileName: file.name,
      fileRequest: fileRequest.id,
      encryptedSymmetricKey,
      encryptedIV,
      createdAt: new Date(),
      lastModified: new Date(file.lastModified),
      isDecrypted: true,
      blob: file, // The uncompressed and unencrypted file
      fromDevice: deviceName,
    } as SharedFile;

    // Update the shared file information
    await this.firebase.updatedSharedFile(sharedFile).toPromise();
    // Upload the file to Cloud Storage
    const uploadTask = this.firebase.uploadFile({ ...sharedFile, blob });
    // Save the upload task
    // this.uploadTasks[sharedFileRef.id] = uploadTask;
    // Update the file status
    this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.UploadStarted, message: 'Hochladen...' });
    uploadTask.snapshotChanges().subscribe((snapshot) => {
      if (snapshot) {
        const bytes = { loaded: snapshot.bytesTransferred, total: snapshot.totalBytes };
        this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.UploadUpdate, message: 'Hochladen...', bytes });
      }
    });
    // Dispatch the upload task
    dataSubject.next({ id: sharedFileRef.id, uploadTask });
    // Wait for completed file upload
    try {
      const snapshot = await uploadTask;
      const bytes = { loaded: snapshot.bytesTransferred, total: snapshot.totalBytes };
      this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.UploadCompleted, message: 'Hochgeladen', bytes });
      // Dispatch the upload task
      dataSubject.next({ id: sharedFileRef.id, uploadTask, sharedFile });
      // Update the updatedAt property on firebase
      await this.firebase.updatedSharedFile({ ...sharedFile, uploadedAt: new Date() }).toPromise();
    } catch (error) {
      this.watcher.updateFileStatus({ id: sharedFileRef.id, type: FileStatusType.Error, message: 'Fehler: ' + error.toString() });
      dataSubject.next({ id: sharedFileRef.id, uploadTask, error });
    }
    dataSubject.complete();
  }
}

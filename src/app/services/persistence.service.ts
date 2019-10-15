import { Inject, Injectable, Optional } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb/with-async-ittr';
import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { from, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { FileStatus } from '../models/file-status.model';

export interface DatabaseState extends DBSchema {
  fileRequests: {
    key: string,
    value: FileRequest
  };
  files: {
    key: string,
    value: SharedFile
    indexes: {
      fileRequest: string
      createdAt: Date
    }
  };
}

const DB_NAME = 'FileRequestDB';
const FILE_REQUESTS_STORE = 'fileRequests';
const FILES_STORE = 'files';

const STATUSES_KEY = 'fileStatuses';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService {

  private readonly dbPromise: Promise<IDBPDatabase<DatabaseState>>;

  constructor(@Inject('dbName') @Optional() dbName?) {
    dbName = dbName || DB_NAME;
    this.dbPromise = openDB<DatabaseState>(dbName, 1, {
      upgrade(database) {
        database.createObjectStore(FILE_REQUESTS_STORE, { keyPath: 'id' });
        const fileStore = database.createObjectStore(FILES_STORE, { keyPath: 'id' });
        fileStore.createIndex('fileRequest', 'fileRequest', { unique: false });
        fileStore.createIndex('createdAt', 'createdDate', { unique: false });
      },
    });
  }

  public storeFileRequests(...fileRequests: FileRequest[]): Observable<string[]> {
    return from(this.dbPromise).pipe(
      flatMap(async (db) => {
        const tx = db.transaction(FILE_REQUESTS_STORE, 'readwrite');

        const ids: string[] = [];

        for (const fileRequest of fileRequests) {
          ids.push(await tx.store.put(fileRequest));
        }

        await tx.done;

        return ids;
      }),
    );
  }

  public getFileRequests(): Observable<FileRequest[]> {
    return from(this.dbPromise).pipe(
      flatMap((db) => db.getAll(FILE_REQUESTS_STORE)),
    );
  }

  public deleteFileRequests(...fileRequests: { id: string }[]): Observable<void> {
    return from(this.dbPromise).pipe(
      flatMap(async (db) => {
        const tx = db.transaction(FILE_REQUESTS_STORE, 'readwrite');
        for (const fileRequest of fileRequests) {
          await tx.store.delete(fileRequest.id);
        }
        await tx.done;
      }),
    );
  }


  storeFiles(...sharedFiles: SharedFile[]): Observable<string[]> {
    return from(this.dbPromise).pipe(
      flatMap(async (db) => {
        const tx = db.transaction(FILES_STORE, 'readwrite');

        const ids: string[] = [];

        for (const sharedFile of sharedFiles) {
          ids.push(await tx.store.put(sharedFile));
        }

        await tx.done;

        return ids;
        // db.put(FILES_STORE, sharedFiles);
      }),
    );
  }

  getFiles(fileRequests?: FileRequest[]): Observable<SharedFile[]> {
    return from(this.dbPromise).pipe(
      flatMap(async (db) => {
        const tx = db.transaction(FILES_STORE, 'readonly');
        const sharedFiles: SharedFile[] = [];

        // If there are file requests given, get just the files that belong to them, otherwise get all files
        if (fileRequests) {
          const index = tx.objectStore(FILES_STORE).index('fileRequest');

          for (const fileRequest of fileRequests) {
            for await (const cursor of index.iterate(fileRequest.id)) {
              sharedFiles.push(cursor.value);
            }
          }
          /*for (const fileRequest of fileRequests) {
            filePromises.push(db.getAllFromIndex(FILES_STORE, 'fileRequest', fileRequest.id));
          }*/
        } else {
          const allFiles = await tx.store.getAll();
          sharedFiles.push(...allFiles);
        }

        await tx.done;

        return sharedFiles;
      }),
    );
  }

  deleteFiles(...sharedFiles: { id: string }[]): Observable<void> {
    return from(this.dbPromise).pipe(
      flatMap(async (db) => {
        const tx = db.transaction(FILES_STORE, 'readwrite');
        for (const sharedFile of sharedFiles) {
          await tx.store.delete(sharedFile.id);
        }
        await tx.done;
      }),
    );
  }


  storeFileStatuses(fileStatuses: FileStatus[]) {
    localStorage.setItem(STATUSES_KEY, JSON.stringify(fileStatuses));
  }

  getFileStatuses() {
    return JSON.parse(localStorage.getItem(STATUSES_KEY) || '[]') as FileStatus[];
  }

}

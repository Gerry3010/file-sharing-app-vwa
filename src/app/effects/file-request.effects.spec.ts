import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { combineLatest, from, Observable, of } from 'rxjs';

import { FileRequestEffects } from './file-request.effects';
import { PersistenceService } from '../services/persistence.service';
import { FileRequest } from '../models/file-request.model';
import {
  AddFileRequest,
  DeleteFileRequest,
  FileRequestActionTypes,
  LoadFileRequests,
  UpsertFileRequest,
} from '../actions/file-request.actions';
import { MatSnackBarModule } from '@angular/material';
import { FileWatcherService } from '../services/file-watcher.service';
import mockState from '../reducers/mock-state';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FileCryptoService } from '../services/file-crypto.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { UpsertSharedFile } from '../actions/shared-file.actions';
import { reducers, State } from '../reducers';
import { Store, StoreModule } from '@ngrx/store';
import { UpsertFileStatus } from '../actions/file-status.actions';
import { FileStatusType } from '../models/file-status.model';

describe('FileRequestEffects', () => {
  let actions$: Observable<any>;
  let effects: FileRequestEffects;
  let persistenceService: PersistenceService;
  let fileWatcherService: FileWatcherService;
  let fileCryptoService: FileCryptoService;
  let store: Store<State>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireStorageModule,
        MatSnackBarModule,
        StoreModule.forRoot(reducers, { initialState: mockState }),
      ],
      providers: [
        PersistenceService,
        FileWatcherService,
        FileCryptoService,
        FileRequestEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.get(FileRequestEffects);
    persistenceService = TestBed.get(PersistenceService);
    fileWatcherService = TestBed.get(FileWatcherService);
    fileCryptoService = TestBed.get(FileCryptoService);
    store = TestBed.get(Store);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should load file request piXuZkPCPgrFE3YpIts7', (done) => {
    actions$ = of(new LoadFileRequests());

    const persistenceSpy = spyOn(persistenceService, 'getFileRequests').and.returnValue(
      of([ { id: 'piXuZkPCPgrFE3YpIts7' } as FileRequest ]),
    );

    const subscription = effects.loadFileRequests$.subscribe((action) => {
      expect(persistenceSpy).toHaveBeenCalled();
      expect(action.type).toEqual(FileRequestActionTypes.LoadFileRequestsSuccess);
      setTimeout(() => subscription.unsubscribe());
      done();
    }, done.fail);
  });

  it('should watch file requests', (done) => {
    actions$ = from([
      new AddFileRequest({ fileRequest: getMockFileRequest() }),
      new UpsertFileRequest({ fileRequest: getMockFileRequest() }),
      new UpsertFileRequest({ fileRequest: getMockFileRequest({ isDeleted: true }) }),
    ]);

    const watcherSpy = spyOn(fileWatcherService, 'watchFileRequests');

    effects.watchFileRequests$.subscribe({
      error: done.fail,
      complete: () => {
        expect(watcherSpy).toHaveBeenCalledTimes(2);
        expect(watcherSpy.calls.argsFor(0).length).toBeGreaterThanOrEqual(1);
        expect(watcherSpy.calls.argsFor(1).length).toBeGreaterThanOrEqual(1);
        done();
      },
    });
  });

  it('should stop watching file requests', (done) => {
    actions$ = from([
      new DeleteFileRequest({ id: 'test' }),
      new UpsertFileRequest({ fileRequest: getMockFileRequest({ isDeleted: true }) }),
    ]);

    const watcherSpy = spyOn(fileWatcherService, 'stopWatchingFileRequests');

    effects.stopWatchingFileRequests$.subscribe({
      error: done.fail,
      complete: () => {
        expect(watcherSpy).toHaveBeenCalledTimes(2);
        done();
      },
    });
  });

  it('should generate a key pair for the file requests', (done) => {
    actions$ = from([
      new AddFileRequest({ fileRequest: getMockFileRequest({ isIncoming: true }) }),
      new UpsertFileRequest({ fileRequest: getMockFileRequest({ isIncoming: true }) }),
      new UpsertFileRequest({ fileRequest: getMockFileRequest({ isIncoming: false }) }),
    ]);

    const cryptoSpy = spyOn(fileCryptoService, 'generateRSAKeyPair').and.callThrough();

    effects.generateKeyPair$.subscribe({
      next: (action: UpsertFileRequest) => {
        expect(action.payload.fileRequest.publicKey).toBeTruthy();
        expect(action.payload.fileRequest.privateKey).toBeTruthy();
      },
      error: done.fail,
      complete: () => {
        expect(cryptoSpy).toHaveBeenCalledTimes(2);
        done();
      },
    });
  });

  it('should decrypt a file', (done) => {
    const mockFile = new File([ 'Dies ist ein Beispiel-BLOB, der wichtige Informationen enthält.' ], 'encrypted.txt', {
      type: 'text/plain',
      lastModified: new Date().getTime(),
    });
    actions$ = combineLatest([
      fileCryptoService.generateRSAKeyPair(),
      fileCryptoService.generateAESKey(),
    ]).pipe(
      switchMap(([ keyPair, aesKey ]) => combineLatest([
        of(keyPair),
        fileCryptoService.encryptBlob(mockFile, aesKey),
        fileCryptoService.wrapSymmetricKey(aesKey, keyPair.publicKey),
      ])),
      switchMap(([ keyPair, { blob, iv }, wrappedKey ]) => combineLatest([
        of(keyPair),
        of(blob),
        of(wrappedKey),
        fileCryptoService.encryptIV(iv, keyPair.publicKey),
      ])),
      tap(([ keyPair, encryptedBlob, wrappedKey, encryptedIV ]) => {
        const mockFileRequest = getMockFileRequest({
          files: [ 'FILE_TO_DECRYPT' ],
          isIncoming: true,
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey,
        });
        store.dispatch(new UpsertFileRequest({
          fileRequest: mockFileRequest,
        }));
        store.dispatch(new UpsertSharedFile({
          sharedFile: {
            id: 'FILE_TO_DECRYPT',
            fileName: 'encrypted.txt',
            fileRequest: mockFileRequest.id,
            fromDevice: 'Gerrys MacBook',
            createdAt: new Date(),
            uploadedAt: new Date(),
            isDecrypted: false,
            encryptedSymmetricKey: wrappedKey,
            encryptedIV: encryptedIV,
            blob: encryptedBlob,
          },
        }));
      }),
      map(([ _, encryptedBlob, __, ___ ]) => new UpsertFileStatus({
        fileStatus: {
          id: 'FILE_TO_DECRYPT',
          type: FileStatusType.DownloadCompleted,
          message: 'Download abgeschlossen',
          bytes: { loaded: encryptedBlob.size, total: encryptedBlob.size },
        },
      })),
    );
    effects.decryptFile$.subscribe((updateAction) => {
      expect(updateAction.payload.sharedFile.id).toEqual('FILE_TO_DECRYPT');
      expect(updateAction.payload.sharedFile.changes.isDecrypted).toBeTruthy();
      expect(updateAction.payload.sharedFile.changes.blob.size).toEqual(mockFile.size);
      done();
    }, done.fail);
  });

  const getMockFileRequest = (additionalProps: Partial<FileRequest> = {}) => {
    const id = (Math.random() * 1000).toFixed(0);
    return (<FileRequest>{
      id,
      title: 'Test ' + id,
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      ...additionalProps,
    });
  };

});

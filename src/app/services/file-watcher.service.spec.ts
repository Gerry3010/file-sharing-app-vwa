import { TestBed } from '@angular/core/testing';

import { FileWatcherService } from './file-watcher.service';
import { DownloadActions, DownloadActionTypes, DownloadFailed } from '../actions/download.actions';
import { FileService } from './file.service';
import { FirebaseService } from './firebase.service';
import { FileRequestEffects } from '../effects/file-request.effects';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { MatSnackBarModule } from '@angular/material';
import { of } from 'rxjs';
import { FileRequestActions, FileRequestActionTypes, UpsertFileRequest } from '../actions/file-request.actions';
import { SharedFileActions, SharedFileActionTypes, UpsertSharedFile } from '../actions/shared-file.actions';
import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';

describe('DownloadManagerService', () => {
  let service: FileWatcherService;
  let firebaseService: FirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireStorageModule,
        MatSnackBarModule,
      ],
      providers: [
        FileService,
        FirebaseService,
        FileRequestEffects,
      ],
    });
    service = TestBed.get(FileWatcherService);
    firebaseService = TestBed.get(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should watch file requests', (done) => {
    const fileRequest: FileRequest = {
      id: 'test-file-request',
      title: 'Test',
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
      isIncoming: true,
      files: [],
    };
    const sharedFile: SharedFile = {
      id: 'test-file',
      fileRequest: 'test-file-request',
      fileName: 'TestFile.txt',
      fromDevice: 'Firebase Web',
      createdAt: new Date(),
      uploadedAt: new Date(),
    };
    spyOn(firebaseService, 'watchFileRequest').and.returnValue(of(new UpsertFileRequest({ fileRequest })));
    spyOn(firebaseService, 'watchFilesFromFileRequest').and.returnValue(of(new UpsertSharedFile({ sharedFile })));
    const deleteSpy = spyOn(firebaseService, 'deleteFile').and.returnValue(of(undefined));

    service.actions$.subscribe((action: FileRequestActions | SharedFileActions | DownloadActions) => {
      switch (action.type) {
        case FileRequestActionTypes.UpsertFileRequest:
          expect(action.payload.fileRequest.id).toEqual(fileRequest.id);
          break;
        case SharedFileActionTypes.UpsertSharedFile:
          expect(action.payload.sharedFile.id).toEqual(sharedFile.id);
          break;
        case FileRequestActionTypes.AddFileToFileRequest:
          expect(action.payload.fileRequestId).toEqual(fileRequest.id);
          expect(action.payload.sharedFileId).toEqual(sharedFile.id);
          break;
        case DownloadActionTypes.DownloadFinished:
          service.stopWatchingFileRequests(...[ fileRequest ]);
          expect(deleteSpy).toHaveBeenCalledTimes(1);
          done();
          break;
        case DownloadActionTypes.DownloadFailed:
          service.stopWatchingFileRequests(...[ fileRequest ]);
          done.fail(action.payload.error);
          break;
      }
    }, done.fail);

    service.watchFileRequests(fileRequest);
  });

  it('should download a file', (done) => {
    service.downloadFile({
      id: 'test-file-id.txt',
      createdAt: new Date(),
      fromDevice: 'FirebaseDashboard',
      fileRequest: 'piXuZkPCPgrFE3YpIts7',
    }).subscribe((action) => {
      expect(action.type).not.toEqual(DownloadActionTypes.DownloadFailed);
      if (action.type === DownloadActionTypes.DownloadFinished) {
        expect(action.payload.file.size).toBeGreaterThan(0);
        done();
      }
    }, done.fail);
  });

  it('should fail downloading a file', (done) => {
    service.downloadFile({
      id: 'file-not-found',
      createdAt: new Date(),
      fromDevice: 'FirebaseDashboard',
      fileRequest: 'piXuZkPCPgrFE3YpIts7',
    }).subscribe((action: DownloadFailed) => {
      expect(action.type).toEqual(DownloadActionTypes.DownloadFailed);
      expect(action.payload.error).toBeTruthy();
      done();
    }, done.fail);
  });
});

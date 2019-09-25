import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FirebaseService } from './firebase.service';
import { environment } from 'src/environments/environment';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { HttpClientModule, HttpEventType } from '@angular/common/http';
import { SharedFile } from '../models/shared-file.model';
import { SharedFileActionTypes } from '../actions/shared-file.actions';
import { concat, Subscription } from 'rxjs';
import { FileRequestActionTypes } from '../actions/file-request.actions';


describe('FirebaseService', () => {
  let service: FirebaseService;
  const subscriptions: Subscription[] = [];
  const createdFiles: SharedFile[] = [];

  const mockFile = <SharedFile>{
    createdAt: new Date(),
    fromDevice: 'Test Device',
    fileName: 'test.txt',
    id: 'test-id',
    fileRequest: 'piXuZkPCPgrFE3YpIts7',
    blob: new File([ (new TextEncoder().encode('TEST')) ], 'file'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireStorageModule,
      ],
    });
    service = TestBed.get(FirebaseService);
  });

  beforeEach((done) => {
    subscriptions.push(
      service.addSharedFile(mockFile).subscribe((ref) => {
        createdFiles.push(<SharedFile>{ ...mockFile, id: ref.id });
        done();
      }),
    );
  });

  beforeEach(() => service.uploadFile(mockFile));

  afterEach((done) => {
    subscriptions.push(
      concat(...createdFiles.map((file) => service.removeSharedFile(file))).subscribe(done),
    );
  });

  afterEach(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should watch FileRequest piXuZkPCPgrFE3YpIts7 for changes', (done) => {
    subscriptions.push(
      service.watchFileRequests([ 'piXuZkPCPgrFE3YpIts7' ]).subscribe((fileRequest) => {
        expect(fileRequest.type).toBe(FileRequestActionTypes.UpsertFileRequest);
        expect(fileRequest.payload.fileRequest.id).toBe('piXuZkPCPgrFE3YpIts7');
        done();
      }),
    );
  });

  it('should watch the files from FileRequest piXuZkPCPgrFE3YpIts7', (done) => {
    subscriptions.push(
      service.watchFilesFromFileRequests([ 'piXuZkPCPgrFE3YpIts7' ]).subscribe((action) => {
        expect(action.type).toBe(SharedFileActionTypes.UpsertSharedFile);
        expect(action.payload.sharedFile.id).toBeTruthy();
        expect(action.payload.sharedFile.fileRequest).toEqual('piXuZkPCPgrFE3YpIts7');
        done();
      }, done.fail),
    );
  });

  it('should add a file to FileRequest piXuZkPCPgrFE3YpIts7', (done) => {
    subscriptions.push(
      service.addSharedFile(mockFile).subscribe((ref) => {
        createdFiles.push({ ...mockFile, id: ref.id });
        expect(ref.id).toBeTruthy();
        done();
      }),
    );
  });

  it('should remove the created file', (done) => {
    subscriptions.push(
      service.removeSharedFile(createdFiles[createdFiles.length - 1]).subscribe((val) => {
        expect(val).not.toBeTruthy();
        done();
      }, done.fail),
    );
  });

  it('should upload a file to Firebase Cloud Storage', (done) => {
    subscriptions.push(
      service.uploadFile(mockFile).snapshotChanges().subscribe((snapshot) => {
        expect(snapshot).toBeTruthy();
        expect(snapshot.ref.name).toBe(mockFile.id);
        expect(snapshot.ref.parent.parent.name).toBe(mockFile.fileRequest);
      }, done.fail, done),
    );
  }, 15000);

  it('should download the mock file from FCS', (done) => {
    subscriptions.push(
      service.downloadFile(mockFile).subscribe((event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          expect(event.loaded).toBeGreaterThanOrEqual(0);
        }
        if (event.type === HttpEventType.Response) {
          expect(event.ok).toBeTruthy();
          expect(event.body.size).toEqual(mockFile.blob.size);
          done();
        }
      }, done.fail),
    );
  }, 15000);

  it('should delete the mock file from FCS', (done) => {
    subscriptions.push(
      service.deleteFile(mockFile).subscribe(((value) => {
        expect(value).not.toBeTruthy();
        done();
      }), done.fail),
    );
  }, 10000);

});

import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FirebaseService } from './firebase.service';
import { environment } from 'src/environments/environment';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { HttpClientModule } from '@angular/common/http';
import { SharedFile } from '../models/shared-file.model';
import { AddSharedFile, SharedFileActionTypes } from '../actions/shared-file.actions';
import { Subscription } from 'rxjs';


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
    service.addSharedFile(mockFile).subscribe((ref) => {
      createdFiles.push(<SharedFile>{ ...mockFile, id: ref.id });
      done();
    });
  });

  afterEach(done => {
    createdFiles.forEach(file => {
      subscriptions.push(service.removeSharedFile(file).subscribe(done));
    });
  });

  afterEach(() => subscriptions.forEach(subscription => subscription.unsubscribe()));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should watch FileRequest piXuZkPCPgrFE3YpIts7 for changes', (done) => {
    subscriptions.push(
      service.watchFileRequests([ 'piXuZkPCPgrFE3YpIts7' ]).subscribe(fileRequest => {
        expect(fileRequest.id).toBe('piXuZkPCPgrFE3YpIts7');
        done();
      }),
    );
  });

  it('should watch the files from FileRequest piXuZkPCPgrFE3YpIts7', (done) => {
    subscriptions.push(
      service.watchFilesFromFileRequests([ 'piXuZkPCPgrFE3YpIts7' ]).subscribe(files => {
        expect(files.length).toBeGreaterThan(0);
        expect(files[0].type === SharedFileActionTypes.AddSharedFile);
        expect((files[0] as AddSharedFile).payload.sharedFile.id).toBeTruthy();
        done();
      }),
    );
  });

  it('should add a file to FileRequest piXuZkPCPgrFE3YpIts7', (done) => {
    subscriptions.push(
      service.addSharedFile(mockFile).subscribe(ref => {
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

});

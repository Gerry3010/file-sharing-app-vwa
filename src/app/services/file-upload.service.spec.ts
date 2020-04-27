import { TestBed } from '@angular/core/testing';

import { FileUploadService } from './file-upload.service';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FirebaseService } from './firebase.service';
import { FileWatcherService } from './file-watcher.service';
import { FileService } from './file.service';
import { FileCryptoService } from './file-crypto.service';
import { MatSnackBarModule } from '@angular/material';
import { FileRequest } from '../models/file-request.model';

describe('FileUploadService', () => {
  let service: FileUploadService;
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
        FirebaseService,
        FileWatcherService,
        FileService,
        FileCryptoService,
      ],
    });
    service = TestBed.get(FileUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload and encrypt a file', (done) => {
    /*const privateKey;
    const publicKey;
    const fileRequest = <FileRequest>{
      privateKey, publicKey, // TODO
    };
    service.uploadAndEncryptFile();*/
    done();
  });
});

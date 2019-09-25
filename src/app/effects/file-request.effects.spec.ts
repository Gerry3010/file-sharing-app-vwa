import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { FileRequestEffects } from './file-request.effects';
import { PersistenceService } from '../services/persistence.service';
import { FileRequest } from '../models/file-request.model';
import { FileService } from '../services/file.service';
import { FirebaseService } from '../services/firebase.service';
import { FileRequestActionTypes, LoadFileRequests } from '../actions/file-request.actions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { MatSnackBarModule } from '@angular/material';

describe('FileRequestEffects', () => {
  // TODO: Remove next line when at least one actions-observable is assigned to the variable
  // tslint:disable-next-line:prefer-const
  let actions$: Observable<any>;
  let effects: FileRequestEffects;
  let persistenceService: PersistenceService;

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
        PersistenceService,
        FileService,
        FirebaseService,
        FileRequestEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.get<FileRequestEffects>(FileRequestEffects);
    persistenceService = TestBed.get<PersistenceService>(PersistenceService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should watch file request piXuZkPCPgrFE3YpIts7', (done) => {
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

});

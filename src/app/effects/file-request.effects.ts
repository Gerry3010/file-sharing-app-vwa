import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { concatMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { FileRequestActionTypes, FileRequestActions } from '../actions/file-request.actions';



@Injectable()
export class FileRequestEffects {


  @Effect()
  loadFileRequests$ = this.actions$.pipe(
    ofType(FileRequestActionTypes.LoadFileRequests),
    /** An EMPTY observable only emits completion. Replace with your own observable API request */
    concatMap(() => EMPTY)
  );


  constructor(private actions$: Actions<FileRequestActions>) {}

}

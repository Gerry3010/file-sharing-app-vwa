import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { defer, Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import * as fromFileRequest from '../actions/file-request.actions';
import { map, switchMap, tap, switchMapTo } from 'rxjs/operators';

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions) {
  }

  @Effect()
  init$: Observable<Action> = defer(() => of(new fromFileRequest.LoadFileRequestsSuccess({ fileRequests: [] })));

}

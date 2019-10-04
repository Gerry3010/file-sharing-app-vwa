import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { merge, Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { LoadFileRequests } from '../actions/file-request.actions';
import { switchMap } from 'rxjs/operators';
import { FileWatcherService } from '../services/file-watcher.service';

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions, private fileWatcherService: FileWatcherService) {
  }

  @Effect({ resubscribeOnError: true })
  init$: Observable<Action> = this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    switchMap(() => merge(
      this.fileWatcherService.actions$,
      of(new LoadFileRequests()),
    )),
  );

}

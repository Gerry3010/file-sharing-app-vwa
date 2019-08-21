import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { AppEffects } from './app.effects';
import { Action } from '@ngrx/store';

describe('AppEffects', () => {
  // TODO: Remove next line when at least one actions-observable is assigned to the variable
  // tslint:disable-next-line:prefer-const
  let actions$: Observable<Action>;
  let effects: AppEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.get(AppEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

});

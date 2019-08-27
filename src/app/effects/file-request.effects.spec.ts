import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { FileRequestEffects } from './file-request.effects';

describe('FileRequestEffects', () => {
  // TODO: Remove next line when at least one actions-observable is assigned to the variable
  // tslint:disable-next-line:prefer-const
  let actions$: Observable<any>;
  let effects: FileRequestEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileRequestEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<FileRequestEffects>(FileRequestEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});

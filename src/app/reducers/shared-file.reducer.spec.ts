import { initialState, reducer, selectFileById } from './shared-file.reducer';
import { async, TestBed } from '@angular/core/testing';
import { select, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { State } from './index';
import initialMockState from './mock-state';

describe('SharedFile Reducer', () => {
  let store: MockStore<State>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockStore({ initialState: initialMockState }),
      ],
    });

    store = TestBed.get<Store<State>>(Store);
  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('Selectors', () => {
    it('should select the SharedFile with id "FILE1"', async(() => {
      store.pipe(select(selectFileById, 'FILE1')).subscribe((file) => {
        expect(file.id).toBe('FILE1');
      });
    }));
  });
});

import {
  initialState,
  reducer,
  selectAllFileRequests,
  selectIncomingFileRequests,
  selectOutgoingFileRequests,
} from './file-request.reducer';
import { async, TestBed } from '@angular/core/testing';
import { select, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { State } from './index';
import initialMockState from './mock-state';

describe('FileRequest Reducer', () => {
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
    it('should select incoming FileRequests', async(() => {
      store.pipe(select(selectIncomingFileRequests)).subscribe((fileRequests) => {
        expect(fileRequests.length).toEqual(1);
        expect(fileRequests[0].id).toBeTruthy();
        expect(fileRequests[0].isIncoming).toBeTruthy();
      });
    }));
    it('should select outgoing FileRequests', async(() => {
      store.pipe(select(selectOutgoingFileRequests)).subscribe((fileRequests) => {
        expect(fileRequests.length).toEqual(2);
        expect(fileRequests[0].isIncoming).not.toBeTruthy();
        expect(fileRequests[1].isIncoming).not.toBeTruthy();
      });
    }));
    it('should select all FileRequests', async(() => {
      store.pipe(select(selectAllFileRequests)).subscribe((fileRequests) => {
        expect(fileRequests.length).toEqual(3);
      });
    }));
  });
});

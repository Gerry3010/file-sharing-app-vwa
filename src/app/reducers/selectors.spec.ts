import * as fromSelectors from './selectors';

import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { State } from './index';
import { async, TestBed } from '@angular/core/testing';
import initialMockState from './mock-state';
import { select, Store } from '@ngrx/store';


describe('Selectors', () => {
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

  it('should select all SharedFiles from FileRequests ["FR1", "FR2"]', async(() => {
    store.pipe(select(fromSelectors.selectFilesByFileRequestIds, [ 'FR1', 'FR2' ])).subscribe((files) => {
      expect(files.length).toBeGreaterThanOrEqual(1);
    });
  }));

  it('should select all SharedFiles from FileRequest "FR1"', async(() => {
    store.pipe(select(fromSelectors.selectFilesByFileRequestId, 'FR1')).subscribe((files) => {
      expect(files[0].id).toBe('FILE1');
    });
  }));

  it('should select the FileRequest from SharedFile "FILE1"', async(() => {
    store.pipe(select(fromSelectors.selectFileRequestByFileId, 'FILE1')).subscribe((fileRequest) => {
      expect(fileRequest.id).toBe('FR1');
    });
  }));

  it('should select the Download with SharedFile "FILE6"', async(() => {
    store.pipe(select(fromSelectors.selectDownloadWithSharedFile, 'FILE6')).subscribe((fileDownload) => {
      expect(fileDownload.sharedFile.id).toEqual('FILE6');
    });
  }));

});

import { MetaReducer } from '@ngrx/store';
import { State } from './index';
import { PersistenceService } from '../services/persistence.service';
import { sharedFilesFeatureKey } from './shared-file.reducer';
import { fileRequestsFeatureKey } from './file-request.reducer';
import { downloadFeatureKey } from './download.reducer';


export const persistenceMetaReducer: (ps: PersistenceService) => MetaReducer<State> =
  function (persistenceService: PersistenceService) {
    return function (reducer) {
      return function newReducer(state, action) {
        const nextState = reducer(state, action);

        const fileRequests = Object.values(nextState[fileRequestsFeatureKey].entities);
        persistenceService.storeFileRequests(...fileRequests);

        const files = Object.values(nextState[sharedFilesFeatureKey].entities);
        persistenceService.storeFiles(...files);

        const downloads = nextState[downloadFeatureKey].downloads;
        persistenceService.storeDownloads(Object.values(downloads));

        return nextState;
      };
    };
  };

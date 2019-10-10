import { MetaReducer } from '@ngrx/store';
import { isEqual } from 'lodash';
import { State } from './index';
import { PersistenceService } from '../services/persistence.service';
import { sharedFilesFeatureKey } from './shared-file.reducer';
import { fileRequestsFeatureKey } from './file-request.reducer';
import { downloadFeatureKey } from './download.reducer';
import { FileRequestActions, FileRequestActionTypes } from '../actions/file-request.actions';
import { SharedFileActions, SharedFileActionTypes } from '../actions/shared-file.actions';
import { DownloadActions } from '../actions/download.actions';
import { Observable } from 'rxjs';


export function persistenceMetaReducer(persistenceService: PersistenceService): MetaReducer<State> {
  return (reducer) => (state: State, action: FileRequestActions | SharedFileActions | DownloadActions) => {
    const nextState = reducer(state, action);

    const prevFileRequests = state ? Object.values(state[fileRequestsFeatureKey].entities) : [];
    const prevFiles = state ? Object.values(state[fileRequestsFeatureKey].entities) : [];
    const prevDownloads = state ? Object.values(state[downloadFeatureKey].downloads) : [];

    const fileRequests = Object.values(nextState[fileRequestsFeatureKey].entities);
    const files = Object.values(nextState[sharedFilesFeatureKey].entities);
    const downloads = Object.values(nextState[downloadFeatureKey].downloads);

    const observables: Observable<any>[] = [];

    if (action.type === FileRequestActionTypes.DeleteFileRequests || action.type === FileRequestActionTypes.DeleteFileRequest) {
      const ids = action.type === FileRequestActionTypes.DeleteFileRequest ? [ action.payload.id ] : action.payload.ids;
      observables.push(persistenceService.deleteFileRequests(...ids.map((id) => ({ id }))));
    } else if (!isEqual(prevFileRequests, fileRequests)) {
      observables.push(persistenceService.storeFileRequests(...fileRequests));
    }

    if (action.type === SharedFileActionTypes.DeleteSharedFiles || action.type === SharedFileActionTypes.DeleteSharedFile) {
      const ids = action.type === SharedFileActionTypes.DeleteSharedFile ? [ action.payload.id ] : action.payload.ids;
      observables.push(persistenceService.deleteFiles(...ids.map((id) => ({ id }))));
    } else if (!isEqual(prevFiles, files)) {
      observables.push(persistenceService.storeFiles(...files));
    }

    if (!isEqual(prevDownloads, downloads)) {
      persistenceService.storeDownloads(downloads);
    }

    for (const observable of observables) {
      observable.subscribe({ error: console.error });
    }

    return nextState;
  };
}

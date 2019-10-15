import { MetaReducer } from '@ngrx/store';
import { isEqual } from 'lodash';
import { State } from './index';
import { PersistenceService } from '../services/persistence.service';
import { sharedFilesFeatureKey } from './shared-file.reducer';
import { fileRequestsFeatureKey } from './file-request.reducer';
import { fileStatusesFeatureKey } from './file-status.reducer';
import { FileRequestActions, FileRequestActionTypes } from '../actions/file-request.actions';
import { SharedFileActions, SharedFileActionTypes } from '../actions/shared-file.actions';
import { FileStatusActions } from '../actions/file-status.actions';
import { Observable } from 'rxjs';


export function persistenceMetaReducer(persistenceService: PersistenceService): MetaReducer<State> {
  return (reducer) => (state: State, action: FileRequestActions | SharedFileActions | FileStatusActions) => {
    const nextState = reducer(state, action);

    const prevFileRequests = state ? Object.values(state[fileRequestsFeatureKey].entities) : [];
    const prevFiles = state ? Object.values(state[fileRequestsFeatureKey].entities) : [];
    const prevFileStatuses = state ? Object.values(state[fileStatusesFeatureKey].entities) : [];

    const fileRequests = Object.values(nextState[fileRequestsFeatureKey].entities);
    const files = Object.values(nextState[sharedFilesFeatureKey].entities);
    const fileStatuses = Object.values(nextState[fileStatusesFeatureKey].entities);

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

    if (!isEqual(prevFileStatuses, fileStatuses)) {
      persistenceService.storeFileStatuses(fileStatuses);
    }

    for (const observable of observables) {
      observable.subscribe({ error: console.error });
    }

    return nextState;
  };
}

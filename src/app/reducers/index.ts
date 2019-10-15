import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromFileRequest from './file-request.reducer';
import * as fromSharedFile from './shared-file.reducer';
import * as fromFileStatus from './file-status.reducer';

export interface State {
  [fromFileRequest.fileRequestsFeatureKey]: fromFileRequest.State;
  [fromSharedFile.sharedFilesFeatureKey]: fromSharedFile.State;
  [fromFileStatus.fileStatusesFeatureKey]: fromFileStatus.State;
}

export const reducers: ActionReducerMap<State> = {
  [fromFileRequest.fileRequestsFeatureKey]: fromFileRequest.reducer,
  [fromSharedFile.sharedFilesFeatureKey]: fromSharedFile.reducer,
  [fromFileStatus.fileStatusesFeatureKey]: fromFileStatus.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

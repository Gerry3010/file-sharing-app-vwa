import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromFileRequest from './file-request.reducer';
import * as fromSharedFile from './shared-file.reducer';

export interface State {
  [fromFileRequest.fileRequestsFeatureKey]: fromFileRequest.State;
  [fromSharedFile.sharedFilesFeatureKey]: fromSharedFile.State;
}

export const reducers: ActionReducerMap<State> = {
  [fromFileRequest.fileRequestsFeatureKey]: fromFileRequest.reducer,
  [fromSharedFile.sharedFilesFeatureKey]: fromSharedFile.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

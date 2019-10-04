import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromFileRequest from './file-request.reducer';
import * as fromSharedFile from './shared-file.reducer';
import * as fromDownload from './download.reducer';

export interface State {
  [fromFileRequest.fileRequestsFeatureKey]: fromFileRequest.State;
  [fromSharedFile.sharedFilesFeatureKey]: fromSharedFile.State;
  [fromDownload.downloadFeatureKey]: fromDownload.State;
}

export const reducers: ActionReducerMap<State> = {
  [fromFileRequest.fileRequestsFeatureKey]: fromFileRequest.reducer,
  [fromSharedFile.sharedFilesFeatureKey]: fromSharedFile.reducer,
  [fromDownload.downloadFeatureKey]: fromDownload.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

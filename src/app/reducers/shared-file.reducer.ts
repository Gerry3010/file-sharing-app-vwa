import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { SharedFile } from '../models/shared-file.model';
import { SharedFileActions, SharedFileActionTypes } from '../actions/shared-file.actions';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromIndex from './index';
import { FileStatusActions, FileStatusActionTypes } from '../actions/file-status.actions';
import { FileStatusType } from '../models/file-status.model';


export const sharedFilesFeatureKey = 'sharedFiles';

export interface State extends EntityState<SharedFile> {
  loading: boolean;
}

export const adapter: EntityAdapter<SharedFile> = createEntityAdapter<SharedFile>();

export const initialState: State = adapter.getInitialState({
  loading: false,
});

export function reducer(
  state = initialState,
  action: SharedFileActions | FileStatusActions,
): State {
  switch (action.type) {
    case SharedFileActionTypes.AddSharedFile: {
      return adapter.addOne(action.payload.sharedFile, state);
    }

    case SharedFileActionTypes.UpsertSharedFile: {
      return adapter.upsertOne(action.payload.sharedFile, state);
    }

    case SharedFileActionTypes.AddSharedFiles: {
      return adapter.addMany(action.payload.sharedFiles, state);
    }

    case SharedFileActionTypes.UpsertSharedFiles: {
      return adapter.upsertMany(action.payload.sharedFiles, state);
    }

    case SharedFileActionTypes.UpdateSharedFile: {
      return adapter.updateOne(action.payload.sharedFile, state);
    }

    case SharedFileActionTypes.UpdateSharedFiles: {
      return adapter.updateMany(action.payload.sharedFiles, state);
    }

    case SharedFileActionTypes.DeleteSharedFile: {
      return adapter.removeOne(action.payload.id, state);
    }

    case SharedFileActionTypes.DeleteSharedFiles: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case SharedFileActionTypes.LoadSharedFiles: {
      return { ...state, loading: true };
    }

    case SharedFileActionTypes.LoadSharedFilesSuccess: {
      return { ...adapter.addAll(action.payload.sharedFiles, state), loading: false };
    }

    case SharedFileActionTypes.LoadSharedFilesError: {
      return { ...state, loading: false };
    }

    case SharedFileActionTypes.ClearSharedFiles: {
      return adapter.removeAll(state);
    }

    case FileStatusActionTypes.UpsertFileStatus: {
      return action.payload.fileStatus.type === FileStatusType.DownloadCompleted ? adapter.updateOne({
        id: action.payload.fileStatus.id,
        changes: { downloadedAt: new Date() },
      }, state) : state;
    }

    default: {
      return state;
    }
  }
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectFeatureState = createFeatureSelector<State>(sharedFilesFeatureKey);

export const selectFileById = createSelector<fromIndex.State, string, State, SharedFile | undefined>(
  selectFeatureState,
  (sharedFiles, sharedFileId) => sharedFiles.entities[sharedFileId],
);

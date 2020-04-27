import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { FileStatus } from '../models/file-status.model';
import { FileStatusActions, FileStatusActionTypes } from '../actions/file-status.actions';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromIndex from './index';

export const fileStatusesFeatureKey = 'fileStatuses';

export interface State extends EntityState<FileStatus> {
  // additional entities state properties
}

export const adapter: EntityAdapter<FileStatus> = createEntityAdapter<FileStatus>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: FileStatusActions,
): State {
  switch (action.type) {
    case FileStatusActionTypes.UpsertFileStatus: {
      return adapter.upsertOne(action.payload.fileStatus, state);
    }

    case FileStatusActionTypes.DeleteFileStatus: {
      return adapter.removeOne(action.payload.id, state);
    }

    default: {
      return state;
    }
  }
}

export const selectFeatureState = createFeatureSelector<State>(fileStatusesFeatureKey);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectFileStatusByFileId = createSelector<fromIndex.State, string, State, FileStatus | undefined>(
  selectFeatureState,
  (state, fileId) => state.entities[fileId],
);

export const selectFileStatusesByFileIds = createSelector<fromIndex.State, string[], State, FileStatus[]>(
  selectFeatureState,
  (state, fileIds) => fileIds.map((fileId) => state.entities[fileId]).filter((status) => !!status),
);

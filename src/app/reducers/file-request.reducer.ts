import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { FileRequest } from '../models/file-request.model';
import { FileRequestActions, FileRequestActionTypes } from '../actions/file-request.actions';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromIndex from './index';


export const fileRequestsFeatureKey = 'fileRequests';

export interface State extends EntityState<FileRequest> {
  // additional entities state properties
  loaded: boolean;
}

export const adapter: EntityAdapter<FileRequest> = createEntityAdapter<FileRequest>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  loaded: false,
});

export function reducer(
  state = initialState,
  action: FileRequestActions,
): State {
  switch (action.type) {
    case FileRequestActionTypes.AddFileRequest: {
      return adapter.addOne(action.payload.fileRequest, state);
    }

    case FileRequestActionTypes.UpsertFileRequest: {
      return adapter.upsertOne(action.payload.fileRequest, state);
    }

    case FileRequestActionTypes.AddFileRequests: {
      return adapter.addMany(action.payload.fileRequests, state);
    }

    case FileRequestActionTypes.UpsertFileRequests: {
      return adapter.upsertMany(action.payload.fileRequests, state);
    }

    case FileRequestActionTypes.UpdateFileRequest: {
      return adapter.updateOne(action.payload.fileRequest, state);
    }

    case FileRequestActionTypes.UpdateFileRequests: {
      return adapter.updateMany(action.payload.fileRequests, state);
    }

    case FileRequestActionTypes.DeleteFileRequest: {
      return adapter.removeOne(action.payload.id, state);
    }

    case FileRequestActionTypes.DeleteFileRequests: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case FileRequestActionTypes.LoadFileRequestsSuccess: {
      return { ...adapter.addAll(action.payload.fileRequests, state), loaded: true };
    }

    case FileRequestActionTypes.LoadFileRequestsError: {
      return { ...state, loaded: true };
    }

    case FileRequestActionTypes.AddFileToFileRequest: {
      return adapter.upsertOne({
        ...state.entities[action.payload.fileRequestId],
        files: [ ...(state.entities[action.payload.fileRequestId].files || []), action.payload.sharedFileId ],
      }, state);
    }

    case FileRequestActionTypes.RemoveFileFromFileRequest: {
      const fileIds = (state.entities[action.payload.fileRequestId] && state.entities[action.payload.fileRequestId].files) || [];
      return adapter.updateOne({
        id: action.payload.fileRequestId,
        changes: {
          files: fileIds.filter((fileId) => fileId !== action.payload.sharedFileId),
        },
      }, state);
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

export const selectFeatureState = createFeatureSelector<State>(fileRequestsFeatureKey);

export const selectIncomingFileRequests = createSelector<fromIndex.State, State, FileRequest[]>(
  selectFeatureState,
  (state) => Object.values(state.entities).filter((fileRequest) => !!fileRequest.isIncoming),
);

export const selectOutgoingFileRequests = createSelector<fromIndex.State, State, FileRequest[]>(
  selectFeatureState,
  (state) => Object.values(state.entities).filter((fileRequest) => !fileRequest.isIncoming),
);

export const selectAllFileRequests = createSelector<fromIndex.State, State, FileRequest[]>(
  selectFeatureState,
  (state) => Object.values(state.entities),
);

export const selectFileRequestById = createSelector<fromIndex.State, string, State, FileRequest>(
  selectFeatureState,
  (state, id) => state.entities[id],
);

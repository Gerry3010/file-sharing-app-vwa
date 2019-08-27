import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { FileRequest } from '../models/file-request.model';
import { FileRequestActions, FileRequestActionTypes } from '../actions/file-request.actions';
import { createFeatureSelector } from '@ngrx/store';


export const fileRequestsFeatureKey = 'fileRequests';

export interface State extends EntityState<FileRequest> {
  // additional entities state properties
  loading: boolean;
}

export const adapter: EntityAdapter<FileRequest> = createEntityAdapter<FileRequest>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  loading: true,
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
      return { ...adapter.addAll(action.payload.fileRequests, state), loading: false };
    }

    case FileRequestActionTypes.LoadFileRequestsError: {
      return { ...state, loading: false };
    }

    case FileRequestActionTypes.ClearFileRequests: {
      return adapter.removeAll(state);
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

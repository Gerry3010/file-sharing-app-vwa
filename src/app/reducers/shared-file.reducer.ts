import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { SharedFile } from '../models/shared-file.model';
import { SharedFileActions, SharedFileActionTypes } from '../actions/shared-file.actions';

export const sharedFilesFeatureKey = 'sharedFiles';

export interface State extends EntityState<SharedFile> {
  // additional entities state properties
}

export const adapter: EntityAdapter<SharedFile> = createEntityAdapter<SharedFile>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: SharedFileActions
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
      return adapter.addAll(action.payload.sharedFiles, state);
    }

    case SharedFileActionTypes.ClearSharedFiles: {
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

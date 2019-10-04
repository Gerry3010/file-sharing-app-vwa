import { FileDownload } from '../models/file-download.model';
import { DownloadActions, DownloadActionTypes } from '../actions/download.actions';
import { createFeatureSelector } from '@ngrx/store';


export const downloadFeatureKey = 'download';

export interface State {
  downloads: { [key: string]: FileDownload };
}

export const initialState: State = {
  downloads: {},
};

export function reducer(state = initialState, action: DownloadActions): State {
  switch (action.type) {
    case DownloadActionTypes.DownloadStarted:
      return {
        ...state,
        downloads: {
          ...state.downloads,
          [action.payload.sharedFileId]: {
            loadedBytes: 0,
            sharedFileId: action.payload.sharedFileId,
            completed: false,
            totalBytes: undefined,
          },
        },
      };
    case DownloadActionTypes.DownloadProgressUpdate:
      return {
        ...state,
        downloads: {
          ...state.downloads,
          [action.payload.sharedFileId]: {
            ...state.downloads[action.payload.sharedFileId],
            loadedBytes: action.payload.loadedBytes,
            totalBytes: action.payload.totalBytes,
          },
        },
      };
    case DownloadActionTypes.DownloadFinished:
      return { ...state,
        downloads: {
          ...state.downloads,
          [action.payload.sharedFileId]: { ...state.downloads[action.payload.sharedFileId], completed: true },
        },
      };
    case DownloadActionTypes.DownloadFailed:
      return { ...state,
        downloads: {
          ...state.downloads,
          [action.payload.sharedFileId]: { ...state.downloads[action.payload.sharedFileId], error: action.payload.error, completed: true },
        },
      };
    case DownloadActionTypes.RemoveDownload:
      return {
        ...state,
        downloads: Object.fromEntries(Object.entries(state.downloads).filter(([ key ]) => key !== action.payload.downloadId)),
      };
    default:
      return state;
  }
}

export const selectFeatureState = createFeatureSelector<State>(downloadFeatureKey);

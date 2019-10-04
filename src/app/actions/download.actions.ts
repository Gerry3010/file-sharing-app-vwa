import { Action } from '@ngrx/store';
import { SharedFile } from '../models/shared-file.model';

export enum DownloadActionTypes {
  LoadDownloads = '[Download] Load Downloads',
  StartDownload = '[Download] Start Download',
  StopDownload = '[Download] Stop Download',
  RemoveDownload = '[Download] Remove Download',

  DownloadStarted = '[Download] Download Started',
  DownloadProgressUpdate = '[Download] Download Progress Update',
  DownloadFinished = '[Download] Download Finished',
  DownloadFailed = '[Download] Download Failed',
}

export class LoadDownloads implements Action {
  readonly type = DownloadActionTypes.LoadDownloads;
}

export class StartDownload implements Action {
  readonly type = DownloadActionTypes.StartDownload;

  constructor(public payload: { sharedFile: SharedFile }) {
  }
}

export class StopDownload implements Action {
  readonly type = DownloadActionTypes.StopDownload;

  constructor(public payload: { sharedFileId: string }) {
  }
}

export class RemoveDownload implements Action {
  readonly type = DownloadActionTypes.RemoveDownload;

  constructor(public payload: { downloadId: string }) {
  }
}

export class DownloadStarted implements Action {
  readonly type = DownloadActionTypes.DownloadStarted;

  constructor(public payload: { sharedFileId: string }) {
  }
}

export class DownloadProgressUpdate implements Action {
  readonly type = DownloadActionTypes.DownloadProgressUpdate;

  constructor(public payload: { sharedFileId: string, loadedBytes: number, totalBytes: number }) {
  }
}

export class DownloadFinished implements Action {
  readonly type = DownloadActionTypes.DownloadFinished;

  constructor(public payload: { sharedFileId: string, file: File }) {
  }
}

export class DownloadFailed implements Action {
  readonly type = DownloadActionTypes.DownloadFailed;

  constructor(public payload: { sharedFileId: string, error: Error }) {
  }
}


export type DownloadActions =
  LoadDownloads
  | StartDownload
  | StopDownload
  | RemoveDownload
  | DownloadStarted
  | DownloadProgressUpdate
  | DownloadFinished
  | DownloadFailed;

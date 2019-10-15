import { Action } from '@ngrx/store';
import { FileStatus } from '../models/file-status.model';

export enum FileStatusActionTypes {
  UpsertFileStatus = '[FileStatus] Upsert FileStatus',
  DeleteFileStatus = '[FileStatus] Delete FileStatus',
}

export class UpsertFileStatus implements Action {
  readonly type = FileStatusActionTypes.UpsertFileStatus;

  constructor(public payload: { fileStatus: FileStatus }) {
  }
}

export class DeleteFileStatus implements Action {
  readonly type = FileStatusActionTypes.DeleteFileStatus;

  constructor(public payload: { id: string }) {
  }
}


export type FileStatusActions = UpsertFileStatus | DeleteFileStatus;

import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { SharedFile } from '../models/shared-file.model';

export enum SharedFileActionTypes {
  LoadSharedFiles = '[SharedFile] Load SharedFiles',
  AddSharedFile = '[SharedFile] Add SharedFile',
  UpsertSharedFile = '[SharedFile] Upsert SharedFile',
  AddSharedFiles = '[SharedFile] Add SharedFiles',
  UpsertSharedFiles = '[SharedFile] Upsert SharedFiles',
  UpdateSharedFile = '[SharedFile] Update SharedFile',
  UpdateSharedFiles = '[SharedFile] Update SharedFiles',
  DeleteSharedFile = '[SharedFile] Delete SharedFile',
  DeleteSharedFiles = '[SharedFile] Delete SharedFiles',
  ClearSharedFiles = '[SharedFile] Clear SharedFiles'
}

export class LoadSharedFiles implements Action {
  readonly type = SharedFileActionTypes.LoadSharedFiles;

  constructor(public payload: { sharedFiles: SharedFile[] }) {}
}

export class AddSharedFile implements Action {
  readonly type = SharedFileActionTypes.AddSharedFile;

  constructor(public payload: { sharedFile: SharedFile }) {}
}

export class UpsertSharedFile implements Action {
  readonly type = SharedFileActionTypes.UpsertSharedFile;

  constructor(public payload: { sharedFile: SharedFile }) {}
}

export class AddSharedFiles implements Action {
  readonly type = SharedFileActionTypes.AddSharedFiles;

  constructor(public payload: { sharedFiles: SharedFile[] }) {}
}

export class UpsertSharedFiles implements Action {
  readonly type = SharedFileActionTypes.UpsertSharedFiles;

  constructor(public payload: { sharedFiles: SharedFile[] }) {}
}

export class UpdateSharedFile implements Action {
  readonly type = SharedFileActionTypes.UpdateSharedFile;

  constructor(public payload: { sharedFile: Update<SharedFile> }) {}
}

export class UpdateSharedFiles implements Action {
  readonly type = SharedFileActionTypes.UpdateSharedFiles;

  constructor(public payload: { sharedFiles: Update<SharedFile>[] }) {}
}

export class DeleteSharedFile implements Action {
  readonly type = SharedFileActionTypes.DeleteSharedFile;

  constructor(public payload: { id: string }) {}
}

export class DeleteSharedFiles implements Action {
  readonly type = SharedFileActionTypes.DeleteSharedFiles;

  constructor(public payload: { ids: string[] }) {}
}

export class ClearSharedFiles implements Action {
  readonly type = SharedFileActionTypes.ClearSharedFiles;
}

export type SharedFileActions =
 LoadSharedFiles
 | AddSharedFile
 | UpsertSharedFile
 | AddSharedFiles
 | UpsertSharedFiles
 | UpdateSharedFile
 | UpdateSharedFiles
 | DeleteSharedFile
 | DeleteSharedFiles
 | ClearSharedFiles;

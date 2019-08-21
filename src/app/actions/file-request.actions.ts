import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { FileRequest } from '../models/file-request.model';

export enum FileRequestActionTypes {
  LoadFileRequests = '[FileRequest] Load FileRequests',
  LoadFileRequestsSuccess = '[FileRequest] Load FileRequests Success',
  LoadFileRequestsError = '[FileRequest] Load FileRequests Error',
  AddFileRequest = '[FileRequest] Add FileRequest',
  UpsertFileRequest = '[FileRequest] Upsert FileRequest',
  AddFileRequests = '[FileRequest] Add FileRequests',
  UpsertFileRequests = '[FileRequest] Upsert FileRequests',
  UpdateFileRequest = '[FileRequest] Update FileRequest',
  UpdateFileRequests = '[FileRequest] Update FileRequests',
  DeleteFileRequest = '[FileRequest] Delete FileRequest',
  DeleteFileRequests = '[FileRequest] Delete FileRequests',
  ClearFileRequests = '[FileRequest] Clear FileRequests'
}

export class LoadFileRequests implements Action {
  readonly type = FileRequestActionTypes.LoadFileRequests;

  constructor() {
  }
}

export class LoadFileRequestsSuccess implements Action {
  readonly type = FileRequestActionTypes.LoadFileRequestsSuccess;

  constructor(public payload: { fileRequests: FileRequest[] }) {
  }
}

export class LoadFileRequestsError implements Action {
  readonly type = FileRequestActionTypes.LoadFileRequestsError;

  constructor(public payload: { error: Error }) {
  }
}

export class AddFileRequest implements Action {
  readonly type = FileRequestActionTypes.AddFileRequest;

  constructor(public payload: { fileRequest: FileRequest }) {
  }
}

export class UpsertFileRequest implements Action {
  readonly type = FileRequestActionTypes.UpsertFileRequest;

  constructor(public payload: { fileRequest: FileRequest }) {
  }
}

export class AddFileRequests implements Action {
  readonly type = FileRequestActionTypes.AddFileRequests;

  constructor(public payload: { fileRequests: FileRequest[] }) {
  }
}

export class UpsertFileRequests implements Action {
  readonly type = FileRequestActionTypes.UpsertFileRequests;

  constructor(public payload: { fileRequests: FileRequest[] }) {
  }
}

export class UpdateFileRequest implements Action {
  readonly type = FileRequestActionTypes.UpdateFileRequest;

  constructor(public payload: { fileRequest: Update<FileRequest> }) {
  }
}

export class UpdateFileRequests implements Action {
  readonly type = FileRequestActionTypes.UpdateFileRequests;

  constructor(public payload: { fileRequests: Update<FileRequest>[] }) {
  }
}

export class DeleteFileRequest implements Action {
  readonly type = FileRequestActionTypes.DeleteFileRequest;

  constructor(public payload: { id: string }) {
  }
}

export class DeleteFileRequests implements Action {
  readonly type = FileRequestActionTypes.DeleteFileRequests;

  constructor(public payload: { ids: string[] }) {
  }
}

export class ClearFileRequests implements Action {
  readonly type = FileRequestActionTypes.ClearFileRequests;
}

export type FileRequestActions =
  LoadFileRequests
  | LoadFileRequestsSuccess
  | LoadFileRequestsError
  | AddFileRequest
  | UpsertFileRequest
  | AddFileRequests
  | UpsertFileRequests
  | UpdateFileRequest
  | UpdateFileRequests
  | DeleteFileRequest
  | DeleteFileRequests
  | ClearFileRequests;

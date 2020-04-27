import { createSelector } from '@ngrx/store';

import * as fromIndex from './index';
import * as fromFileRequest from './file-request.reducer';
import * as fromSharedFile from './shared-file.reducer';
import * as fromStatuses from './file-status.reducer';

import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { FileStatus } from '../models/file-status.model';


const selectFilesByFileRequestIds = createSelector<fromIndex.State, string[], fromFileRequest.State, fromSharedFile.State, SharedFile[]>(
  fromFileRequest.selectFeatureState,
  fromSharedFile.selectFeatureState,
  (fileRequests, sharedFiles, fileRequestIds) =>
    Object.values(fileRequests.entities)
      .filter((fr) => fileRequestIds.includes(fr.id))
      .flatMap((fr) => fr.files.map((fileId) => sharedFiles.entities[fileId])),
);

const selectFilesByFileRequestId = createSelector<fromIndex.State, string, fromFileRequest.State, fromSharedFile.State, SharedFile[]>(
  fromFileRequest.selectFeatureState,
  fromSharedFile.selectFeatureState,
  (fileRequestState, sharedFileState, fileRequestId) => fileRequestState.entities[fileRequestId]
    ? (fileRequestState.entities[fileRequestId].files || []).map((fileId) => sharedFileState.entities[fileId])
    : [],
);


const selectFileRequestByFileId = createSelector<fromIndex.State, string, fromSharedFile.State, fromFileRequest.State, FileRequest>(
  fromSharedFile.selectFeatureState,
  fromFileRequest.selectFeatureState,
  (sharedFiles, fileRequests, fileId) =>
    (sharedFiles.entities[fileId] && sharedFiles.entities[fileId].fileRequest)
      ? fileRequests.entities[sharedFiles.entities[fileId].fileRequest]
      : undefined,
);


const selectFileStatusesByFileRequestId = createSelector<fromIndex.State, string, fromFileRequest.State, fromStatuses.State, FileStatus[]>(
  fromFileRequest.selectFeatureState,
  fromStatuses.selectFeatureState,
  (fileRequestState, statusState, fileRequestId) =>
    (fileRequestState.entities[fileRequestId] && fileRequestState.entities[fileRequestId].files)
      ? fileRequestState.entities[fileRequestId].files.map((fileId) => statusState.entities[fileId]).filter((status) => !!status)
      : [],
);


export { selectFilesByFileRequestIds, selectFilesByFileRequestId, selectFileRequestByFileId, selectFileStatusesByFileRequestId };

import { createSelector } from '@ngrx/store';

import * as fromIndex from './index';
import * as fromFileRequest from './file-request.reducer';
import * as fromSharedFile from './shared-file.reducer';
import * as fromDownload from './download.reducer';

import { FileRequest } from '../models/file-request.model';
import { SharedFile } from '../models/shared-file.model';
import { FileDownloadWithFile } from '../models/file-download.model';


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
  (fileRequests, sharedFiles, fileRequestId) => fileRequests.entities[fileRequestId].files.map((fileId) => sharedFiles.entities[fileId]),
);


const selectFileRequestByFileId = createSelector<fromIndex.State, string, fromSharedFile.State, fromFileRequest.State, FileRequest>(
  fromSharedFile.selectFeatureState,
  fromFileRequest.selectFeatureState,
  (sharedFiles, fileRequests, fileId) =>
    (sharedFiles.entities[fileId] && sharedFiles.entities[fileId].fileRequest)
      ? fileRequests.entities[sharedFiles.entities[fileId].fileRequest]
      : undefined,
);


const selectDownloadWithSharedFile =
  createSelector<fromIndex.State, string, fromSharedFile.State, fromDownload.State, FileDownloadWithFile>(
    fromSharedFile.selectFeatureState,
    fromDownload.selectFeatureState,
    (sharedFileState, downloadState, sharedFileId) => ({
      ...downloadState.downloads[sharedFileId],
      sharedFile: sharedFileState.entities[sharedFileId],
    }),
  );


export { selectFilesByFileRequestIds, selectFilesByFileRequestId, selectFileRequestByFileId, selectDownloadWithSharedFile };

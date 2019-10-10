import { FileRequest } from '../models/file-request.model';
import { sharedFilesFeatureKey } from './shared-file.reducer';
import { SharedFile } from '../models/shared-file.model';
import { State } from './index';
import { fileRequestsFeatureKey } from './file-request.reducer';
import { downloadFeatureKey } from './download.reducer';

export default <State>{
  [fileRequestsFeatureKey]: {
    ids: [ 'FR1', 'FR2' ],
    entities: {
      'FR1': <FileRequest>{
        files: [ 'FILE1', 'FILE2', 'FILE3', 'FILE4' ],
        createdAt: new Date(),
        id: 'FR1',
        message: 'Test FileRequest',
        title: 'FileRequest #1',
        updatedAt: new Date(),
      },
      'FR2': <FileRequest>{
        files: [ 'FILE5', 'FILE6' ],
        createdAt: new Date(),
        id: 'FR2',
        message: 'Test FileRequest 2',
        title: 'FileRequest #2',
        updatedAt: new Date(),
      },
      'FR3': <FileRequest>{
        files: [],
        createdAt: new Date(),
        id: 'FR3',
        message: 'Incoming Test FileRequest 3',
        title: 'FileRequest #3',
        updatedAt: new Date(),
        isIncoming: true,
      },
    },
    loading: false,
  },
  [sharedFilesFeatureKey]: {
    ids: [ 'FILE1', 'FILE2', 'FILE3', 'FILE4', 'FILE5', 'FILE6' ],
    entities: {
      'FILE1': <SharedFile>{
        id: 'FILE1',
        blob: <Blob>{ size: 0, type: 'text/plain' },
        fileName: 'empty-file-1.txt',
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        createdAt: new Date(),
        uploadedAt: new Date(),
      },
      'FILE2': <SharedFile>{
        id: 'FILE2',
        blob: <Blob>{ size: 0, type: 'text/plain' },
        fileName: 'empty-file-2.txt',
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        createdAt: new Date(),
        uploadedAt: new Date(),
      },
      'FILE3': <SharedFile>{
        id: 'FILE3',
        blob: <Blob>{ size: 0, type: 'text/plain' },
        fileName: 'empty-file-3.txt',
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        createdAt: new Date(),
        uploadedAt: new Date(),
      },
      'FILE4': <SharedFile>{
        id: 'FILE4',
        blob: <Blob>{ size: 0, type: 'text/plain' },
        fileName: 'empty-file-4.txt',
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        createdAt: new Date(),
        uploadedAt: new Date(),
      },
      'FILE5': <SharedFile>{
        id: 'FILE5',
        blob: <Blob>{ size: 0, type: 'text/plain' },
        fileName: 'empty-file-5.txt',
        fileRequest: 'FR2',
        fromDevice: 'Gerrys MacBook',
        createdAt: new Date(),
        uploadedAt: new Date(),
      },
      'FILE6': <SharedFile>{
        id: 'FILE6',
        blob: <Blob>{ size: 0, type: 'text/plain' },
        fileName: 'empty-file-6.txt',
        fileRequest: 'FR2',
        fromDevice: 'Gerrys MacBook',
        createdAt: new Date(),
        uploadedAt: new Date(),
      },
    },
    loading: false,
  },
  [downloadFeatureKey]: {
    downloads: {
      'FILE6': {
        sharedFileId: 'FILE6',
        loadedBytes: 0,
        totalBytes: 0,
        completed: true,
      },
    },
  },
};

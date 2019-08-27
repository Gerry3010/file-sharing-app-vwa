import { FileRequest } from '../models/file-request.model';
import { sharedFilesFeatureKey } from './shared-file.reducer';
import { SharedFile } from '../models/shared-file.model';
import { State } from './index';
import { fileRequestsFeatureKey } from './file-request.reducer';

export default <State>{
  [fileRequestsFeatureKey]: {
    ids: [ 'FR1', 'FR2' ],
    entities: {
      'FR1': <FileRequest>{
        files: [ 'FILE1', 'FILE2', 'FILE3', 'FILE4' ],
        createdAt: new Date(),
        id: 'FR1',
        message: 'Test FileRequest',
        privateKey: '',
        publicKey: '',
        title: 'FileRequest #1',
        updatedAt: new Date(),
      },
      'FR2': <FileRequest>{
        files: [ 'FILE5', 'FILE6' ],
        createdAt: new Date(),
        id: 'FR2',
        message: 'Test FileRequest 2',
        privateKey: '',
        publicKey: '',
        title: 'FileRequest #2',
        updatedAt: new Date(),
      },
    },
    loading: false,
  },
  [sharedFilesFeatureKey]: {
    ids: [ 'FILE1' ],
    entities: {
      'FILE1': <SharedFile>{
        id: 'FILE1',
        file: new File([ 'EMPTY' ], 'empty-file-1.txt', { type: 'text/plain' }),
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        uploadedAt: new Date(),
      },
      'FILE2': <SharedFile>{
        id: 'FILE2',
        file: new File([ 'EMPTY' ], 'empty-file-2.txt', { type: 'text/plain' }),
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        uploadedAt: new Date(),
      },
      'FILE3': <SharedFile>{
        id: 'FILE3',
        file: new File([ 'EMPTY' ], 'empty-file-3.txt', { type: 'text/plain' }),
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        uploadedAt: new Date(),
      },
      'FILE4': <SharedFile>{
        id: 'FILE4',
        file: new File([ 'EMPTY' ], 'empty-file-4.txt', { type: 'text/plain' }),
        fileRequest: 'FR1',
        fromDevice: 'Gerrys MacBook',
        uploadedAt: new Date(),
      },
      'FILE5': <SharedFile>{
        id: 'FILE5',
        file: new File([ 'EMPTY' ], 'empty-file-5.txt', { type: 'text/plain' }),
        fileRequest: 'FR2',
        fromDevice: 'Gerrys MacBook',
        uploadedAt: new Date(),
      },
      'FILE6': <SharedFile>{
        id: 'FILE6',
        file: new File([ 'EMPTY' ], 'empty-file-6.txt', { type: 'text/plain' }),
        fileRequest: 'FR2',
        fromDevice: 'Gerrys MacBook',
        uploadedAt: new Date(),
      },
    },
  },
};

import { SharedFile } from './shared-file.model';

export interface FileDownload {
  loadedBytes?: number;
  totalBytes?: number;
  completed: boolean;
  sharedFileId: string;
  error?: Error;
}

export interface FileDownloadWithFile {
  loadedBytes?: number;
  totalBytes?: number;
  completed: boolean;
  sharedFile: SharedFile;
  error?: Error;
}

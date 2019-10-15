export enum FileStatusType {
  FileCompressing,
  FileCompressed,
  FileEncrypting,
  FileEncrypted,
  UploadStarted,
  UploadUpdate,
  UploadCompleted,
  DownloadStarted,
  DownloadUpdate,
  DownloadCompleted,
  FileDecrypting,
  FileDecrypted,
  FileDecompressing,
  FileDecompressed,
  Done,
  Error,
}

export interface FileStatus {
  id: string;  // == SharedFile.id

  type: FileStatusType;
  message: string;
  bytes?: { loaded: number, total: number };
}

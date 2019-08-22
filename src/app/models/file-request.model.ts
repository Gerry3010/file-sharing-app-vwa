export interface FileRequest {
  id: string;

  title: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;

  privateKey?: string;  // Kann undefined sein, wenn Dateien gesendet werden
  publicKey: string;

  files: string[];  // IDs der SharedFile Entities

}

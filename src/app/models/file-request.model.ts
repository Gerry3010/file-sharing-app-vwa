export interface FileRequest {
  id: string;

  title: string;
  message?: string;

  privateKey?: string;  // Kann undefined sein, wenn Dateien gesendet werden
  publicKey: string;

  // files: File[]

}

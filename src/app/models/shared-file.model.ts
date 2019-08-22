export interface SharedFile {
  id: string;

  uploadedAt: Date;

  fromDevice: string;  // Der Name des Geräts des Senders

  fileRequest: string;  // Die ID des zugehörigen FileRequests

  file: File;

}

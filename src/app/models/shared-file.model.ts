export interface SharedFile {
  id: string;

  createdAt: Date;  // Zeitpunkt, an dem der Upload begonnen wurde
  uploadedAt?: Date;  // Zeitpunkt, an dem der Upload abgeschlossen wurde
  downloadedAt?: Date;  // Zeitpunkt, an dem der Download abgeschlossen wurde

  fromDevice: string;  // Der Name des Geräts des Senders

  fileRequest?: string;  // Die ID des zugehörigen FileRequests

  fileName?: string;

  encryptedSymmetricKey?: string;
  encryptedIV?: string;

  isDecrypted?: boolean;

  blob?: Blob;

}

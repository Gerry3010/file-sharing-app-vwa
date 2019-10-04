export interface FileRequest {
  id: string;

  title: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;  // Der Zeitpunkt, an dem die letzte Datei hochgeladen wurde oder ein Wert aktualisiert wurde

  privateKey?: CryptoKey;  // Kann undefined sein, wenn Dateien gesendet werden
  publicKey?: CryptoKey;  // Ist direkt nach dem Laden von Firebase undefined

  files: string[];  // IDs der SharedFile Entities

  deleted: boolean;

  isIncoming?: boolean; // Zeigt an, ob dieses Gerät der Ersteller des FileRequests ist
}

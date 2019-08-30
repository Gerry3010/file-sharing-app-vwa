export interface FileRequest {
  id: string;

  title: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;  // Der Zeitpunkt, an dem die letzte Datei hochgeladen wurde oder ein Wert aktualisiert wurde

  privateKey?: string;  // Kann undefined sein, wenn Dateien gesendet werden
  publicKey?: string;  // Ist direkt nach dem Laden von Firebase undefined

  files: string[];  // IDs der SharedFile Entities

}

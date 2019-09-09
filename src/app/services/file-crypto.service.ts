import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FileCryptoService {

  constructor() {
  }

  // Util functions

  public static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const binaryString = bytes.reduce((data, byte) => data + String.fromCharCode(byte), '');
    return btoa(binaryString);
  }

  public static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }


  // Generate Keys

  public generateRSAKeyPair(): Observable<CryptoKeyPair> {
    return from(
      crypto.subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([ 1, 0, 1 ]),
        hash: 'SHA-256',
      }, true, [ 'encrypt', 'decrypt', 'wrapKey', 'unwrapKey' ]),
    );
  }

  public generateAESKey(): Observable<CryptoKey> {
    return from(
      crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [ 'encrypt', 'decrypt' ]),
    );
  }

  // Export Asymmetric Keys

  public exportAsymmetricKey(key: CryptoKey): Observable<string> {
    const keyType = key.type.toUpperCase();
    return from(
      crypto.subtle.exportKey(keyType === 'PUBLIC' ? 'spki' : 'pkcs8', key),
    ).pipe(
      map(FileCryptoService.arrayBufferToBase64),  // Converts the ArrayBuffer to a string
      /*
      map((b64Key: string) => `-----BEGIN ${ keyType } KEY-----\n${ b64Key }\n-----END ${ keyType } KEY-----`), // Formats the key properly
      */
    );
  }

  // Import Asymmetric Keys

  public importRSAPublicKey(key: string): Observable<CryptoKey> {
    return from(
      crypto.subtle.importKey(
        'spki', FileCryptoService.base64ToArrayBuffer(key), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, [ 'encrypt', 'wrapKey' ],
      ),
    );
  }

  public importRSAPrivateKey(key: string): Observable<CryptoKey> {
    return from(
      crypto.subtle.importKey(
        'pkcs8', FileCryptoService.base64ToArrayBuffer(key), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, [ 'decrypt', 'unwrapKey' ],
      ),
    );
  }

  // Wrap/Unwrap Symmetric Keys: Export/Import and Encrypt/Decrypt

  public wrapSymmetricKey(symmetricKey: CryptoKey, publicKey: CryptoKey): Observable<string> {
    return from(
      crypto.subtle.wrapKey('raw', symmetricKey, publicKey, { name: 'RSA-OAEP' }),
    ).pipe(
      map(FileCryptoService.arrayBufferToBase64),
    );
  }

  public unwrapSymmetricKey(encryptedSymmetricKey: string, privateKey: CryptoKey): Observable<CryptoKey> {
    return from(
      crypto.subtle.unwrapKey(
        'raw',
        FileCryptoService.base64ToArrayBuffer(encryptedSymmetricKey),
        privateKey,
        { name: 'RSA-OAEP' },
        { name: 'AES-GCM' },
        true,
        [ 'encrypt', 'decrypt' ]),
    );
  }

  // Encrypt/Decrypt IVs

  public encryptIV(iv: Uint8Array, publicKey: CryptoKey): Observable<string> {
    return from(crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, iv)).pipe(
      map(FileCryptoService.arrayBufferToBase64),
    );
  }

  public decryptIV(iv: string, privateKey: CryptoKey): Observable<ArrayBuffer> {
    return from(crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, FileCryptoService.base64ToArrayBuffer(iv)));
  }

  // Encrypt/Decrypt Blobs

  public encryptBlob(blob: Blob, symmetricKey: CryptoKey): Observable<{ blob: Blob, iv: Uint8Array }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    return from(new Response(blob).arrayBuffer()).pipe(
      flatMap((arrayBuffer) => crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv,
      }, symmetricKey, arrayBuffer)),
      map((encryptedArrayBuffer) => new Blob([ new Uint8Array(encryptedArrayBuffer) ])),
      map((encryptedBlob) => ({ blob: encryptedBlob, iv })),
    );
  }

  public decryptBlob(blob: Blob, symmetricKey: CryptoKey, iv: ArrayBuffer): Observable<Blob> {
    return from(new Response(blob).arrayBuffer()).pipe(
      flatMap((arrayBuffer) => crypto.subtle.decrypt({ name: 'AES-GCM', iv }, symmetricKey, arrayBuffer)),
      map((decryptedArrayBuffer) => new Blob([ new Uint8Array(decryptedArrayBuffer) ])),
    );
  }
}

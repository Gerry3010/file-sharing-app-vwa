import { TestBed } from '@angular/core/testing';

import { FileCryptoService } from './file-crypto.service';
import { forkJoin } from 'rxjs';
import { flatMap } from 'rxjs/operators';

interface TestCryptoKey {
  string: string;
  cryptoKey?: CryptoKey;
  arrayBuffer?: ArrayBuffer;
  wrappedArrayBuffer?: ArrayBuffer;
}

interface TestIV {
  array: Uint8Array;
  encrypted?: string;
}

describe('FileCryptoService', () => {
  let service: FileCryptoService;

  const mockKeys: { publicKey: TestCryptoKey, privateKey: TestCryptoKey, symmetricKey: TestCryptoKey, iv: TestIV } = {
    publicKey: {
      string: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn6u8eHtiec+edFZqFtIwno1u7tSK7ifHMkUEKLyrE1zIlmUpVCFWm55+eLi0RuHNOC+wfdDH+/zHmqIL3JRdaEDmnYStFA9mYwWpjjaQVyQVoUCGtopOMZibR0okJIu9A0tC4LFQFWBAw+9DZtNXGmxfc9RVTNWLUoKQ9tKa/6JmN6h9k0ucUjNACosDvdi3UOOKeHlEWKfsSxQmpggw0UOqtNoyvEHJ14IcnNtbQn2c6019h/C4lltm9gQ5zqJ/LLlGyeamRWoKdGDVEoCWbX94NDDg3hA8pf+w75ZOIU1tA69s6Qp0wowU0NxkRF3OnQLSdSzoDjaORnjsw2/4LwIDAQAB',
    },
    privateKey: {
      string: 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfq7x4e2J5z550VmoW0jCejW7u1IruJ8cyRQQovKsTXMiWZSlUIVabnn54uLRG4c04L7B90Mf7/MeaogvclF1oQOadhK0UD2ZjBamONpBXJBWhQIa2ik4xmJtHSiQki70DS0LgsVAVYEDD70Nm01cabF9z1FVM1YtSgpD20pr/omY3qH2TS5xSM0AKiwO92LdQ44p4eURYp+xLFCamCDDRQ6q02jK8QcnXghyc21tCfZzrTX2H8LiWW2b2BDnOon8suUbJ5qZFagp0YNUSgJZtf3g0MODeEDyl/7Dvlk4hTW0Dr2zpCnTCjBTQ3GREXc6dAtJ1LOgONo5GeOzDb/gvAgMBAAECggEAKdjAlHMB5Brd1G+xbjm4NFWs9TsPDkuukSY1aNfJnlF64K+ynTH/mNl5G/qMhOc4+bjF8LN/NjORvJ0rrqvTrzcTOcVD9zXyB5G8VmFGgxAZ+yEGLWEiDS2JxK1Ru6JD71ESPgE6k9+eGbvjVledRHeSrLDBilmNIhrGE2ou5UAoYwb01mWgnZc7yVUC0h+B0X2RiqF0geIV+ZJCUsbvKmEMaHiirIpVW6wRKDExKO3AhZNQftJNvOxmb3/usu8zDjIjnaJkyjvCQoJih3yVwi9aLrcaqgAwxNITzLonZKblhrSayyNq9JtOzKlcLgxhgebCgrEFNr8JP0OIkpZ1QQKBgQDbpulDYhn/ZNmWJOsepR641o+OECZrTWsVukLSrZ5iZOzRoafsWoR3GqslPUt7sx0+0+DQhe4jUi3I85TAcf6ZUtBlWZW8eDpUqb9Xn3A3SPyv/noVT5JH+wFouOGUDm1Nx91Xzg67CHKzIl9fP5Rq5cKUV8DpV0bNuyKFsiAj7QKBgQC6F9nwL5tj4mH9WpVXGWhCMGkqMPQRZJEFXvk2zTsn8zEv+blSlgJzrTLTTO0YhfkWYYg/hGmnhV5VsbyljkYWxt+sJMABV1908+/Ayj0gUtFLKO/E+25p6+8/xAgC8d9fxrLwgPT1Gy7pnHs38Pww090XdfYw6p8mCiIt+0SBCwKBgQDN9fiMIpTWEa6lRwDgv1vLXgVF5Ibh3romqXy3J+13vcMB3l8jFM1ZETyhspPw7cbifrIzVSIzJH+iCiTVPw7IngqivhnVm7a2ZGTyuKH0dQ/bxvaavP4hWI+9rn524gBECsDV8HWHkyhaKETdfzSf98k4aACPzDKr/mkkjB3vEQKBgFkp3nF3zgNgz8Sdp1pxQQQdv/XIONkwj0+8frokQYjVvCaZh5MrbwdP4D9f52ZNoth3aNnOLvVmMJnsrE/CyJBXP4pynVDHNWSLEMAV5o3bQI67kY6XTgMQWbT6zz/h9j4krU4Q682Y9bRXFq7qF1up15BLI+eyMwj95/ySHPObAoGASAmB+YfL+iPRLUHXpAexuf97/3oejtmOHBFEiSSsgqONrFOZB/xiclwXCfPjpcaroB44ufdRr08vh6gaXESuMQEix6GY8UFXqLsgMtR9s0t4HVnBR5JTe/X31/Y/cojtHht19/V1EZsLMJKicXeIW1X1xpk1Dc3Qp6MXjl4/mm8=',
    },
    symmetricKey: {
      string: '2DG+iHhRtl8duTpRVUTHyyb6citJXO5dv8e77eTm4Cs=',
    },
    iv: { array: crypto.getRandomValues(new Uint8Array(12)) },
  };

  const mockBlob = new Blob([ FileCryptoService.base64ToArrayBuffer(btoa('TestFile')) ]);


  beforeAll(() => Promise.all([
      crypto.subtle.importKey(
        'spki',
        FileCryptoService.base64ToArrayBuffer(mockKeys.publicKey.string),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        [ 'encrypt', 'wrapKey' ],
      )
        .then((key) => {
          mockKeys.publicKey.cryptoKey = key;
          return crypto.subtle.exportKey('spki', key);
        })
        .then((arrayBuffer) => mockKeys.publicKey.arrayBuffer = arrayBuffer),
      crypto.subtle.importKey(
        'pkcs8',
        FileCryptoService.base64ToArrayBuffer(mockKeys.privateKey.string),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        [ 'decrypt', 'unwrapKey' ],
      )
        .then((key) => {
          mockKeys.privateKey.cryptoKey = key;
          return crypto.subtle.exportKey('pkcs8', key);
        })
        .then((arrayBuffer) => mockKeys.privateKey.arrayBuffer = arrayBuffer),
      crypto.subtle.importKey(
        'raw',
        FileCryptoService.base64ToArrayBuffer(mockKeys.symmetricKey.string),
        { name: 'AES-GCM', length: 256 },
        true,
        [ 'encrypt', 'decrypt' ],
      )
        .then((key) => {
          mockKeys.symmetricKey.cryptoKey = key;
          return crypto.subtle.exportKey('raw', key);
        })
        .then((arrayBuffer) => mockKeys.symmetricKey.arrayBuffer = arrayBuffer),
    ])
      .then(() => crypto.subtle.wrapKey('raw', mockKeys.symmetricKey.cryptoKey, mockKeys.publicKey.cryptoKey, { name: 'RSA-OAEP' }))
      .then((arrayBuffer) => mockKeys.symmetricKey.wrappedArrayBuffer = arrayBuffer)
      .then(() => crypto.subtle.encrypt({ name: 'RSA-OAEP' }, mockKeys.publicKey.cryptoKey, mockKeys.iv.array))
      .then((encryptedIV) => mockKeys.iv.encrypted = FileCryptoService.arrayBufferToBase64(encryptedIV)),
  );

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(FileCryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a key pair', (done) => {
    service.generateRSAKeyPair().subscribe((keyPair) => {
      expect(keyPair.publicKey.algorithm.name).toEqual('RSA-OAEP');
      expect(keyPair.privateKey.algorithm.name).toEqual('RSA-OAEP');
      expect(keyPair.publicKey.type).toEqual('public');
      expect(keyPair.privateKey.type).toEqual('private');
      done();
    }, done.fail);
  });

  it('should generate an AES key', (done) => {
    service.generateAESKey().subscribe((key) => {
      expect(key.algorithm.name).toEqual('AES-GCM');
      expect(key.type).toEqual('secret');
      done();
    }, done.fail);
  });

  it('should export an asymmetric key pair', (done) => {
    forkJoin({
      publicKey: service.exportAsymmetricKey(mockKeys.publicKey.cryptoKey),
      privateKey: service.exportAsymmetricKey(mockKeys.privateKey.cryptoKey),
    }).subscribe(({ publicKey, privateKey }) => {
      expect(publicKey).toEqual(mockKeys.publicKey.string);
      expect(privateKey).toEqual(mockKeys.privateKey.string);
      done();
    }, done.fail);
  });

  it('should import an RSA public key', (done) => {
    service.importRSAPublicKey(mockKeys.publicKey.string).pipe(
      flatMap((cryptoKey) => crypto.subtle.exportKey('spki', cryptoKey)),
    ).subscribe((arrayBuffer) => {
      expect(arrayBuffer).toEqual(mockKeys.publicKey.arrayBuffer);
      done();
    }, done.fail);
  });

  it('should import an RSA private key', (done) => {
    service.importRSAPrivateKey(mockKeys.privateKey.string).pipe(
      flatMap((cryptoKey) => crypto.subtle.exportKey('pkcs8', cryptoKey)),
    ).subscribe((arrayBuffer) => {
      expect(arrayBuffer).toEqual(mockKeys.privateKey.arrayBuffer);
      done();
    }, done.fail);
  });

  it('should wrap a symmetric key', (done) => {
    service.wrapSymmetricKey(mockKeys.symmetricKey.cryptoKey, mockKeys.publicKey.cryptoKey).subscribe((wrappedKey) => {
      expect(wrappedKey.length).toEqual(FileCryptoService.arrayBufferToBase64(mockKeys.symmetricKey.wrappedArrayBuffer).length);
      done();
    }, done.fail);
  });

  it('should unwrap a symmetric key', (done) => {
    const wrappedKey = FileCryptoService.arrayBufferToBase64(mockKeys.symmetricKey.wrappedArrayBuffer);
    service.unwrapSymmetricKey(wrappedKey, mockKeys.privateKey.cryptoKey).pipe(
      flatMap((unwrappedKey) => crypto.subtle.exportKey('raw', unwrappedKey)),
    ).subscribe((unwrappedKey) => {
      expect(unwrappedKey).toEqual(mockKeys.symmetricKey.arrayBuffer);
      done();
    }, done.fail);
  });

  it('should encrypt an initialisation vector', (done) => {
    service.encryptIV(mockKeys.iv.array, mockKeys.publicKey.cryptoKey).subscribe((encryptedIV) => {
      expect(encryptedIV.length).toBeGreaterThan(0);
      done();
    }, done.fail);
  });

  it('should decrypt an initialisation vector', (done) => {
    service.decryptIV(mockKeys.iv.encrypted, mockKeys.privateKey.cryptoKey).subscribe((decryptedIV) => {
      expect(decryptedIV.byteLength).toEqual(mockKeys.iv.array.byteLength);
      done();
    }, done.fail);
  });

  it('should encrypt and decrypt a blob', (done) => {
    service.encryptBlob(mockBlob, mockKeys.symmetricKey.cryptoKey).pipe(
      flatMap(({ blob, iv }) => service.decryptBlob(blob, mockKeys.symmetricKey.cryptoKey, iv)),
      flatMap((decryptedBlob) => forkJoin([ new Response(decryptedBlob).arrayBuffer(), new Response(mockBlob).arrayBuffer() ])),
    ).subscribe(([ decryptedBlobArray, mockBlobArray ]) => {
      expect(decryptedBlobArray).toEqual(mockBlobArray);
      done();
    }, done.fail);
  });

});

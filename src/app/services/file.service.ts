import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import * as pako from 'pako';
import { flatMap, map } from 'rxjs/operators';
import { fileExtensions } from './file-extensions';
import { SharedFile } from '../models/shared-file.model';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor() {
  }


  private static async chunkFiles(inputBlob: Blob, deflatorOrInflator: pako.Deflate | pako.Inflate, chunkSize = 2 ** 24) {
    let pos = 0;

    do {
      const chunk = await new Response(inputBlob.slice(pos, pos + chunkSize)).arrayBuffer();

      const end = pos + chunkSize >= inputBlob.size;
      deflatorOrInflator.push(chunk, end);

      pos += chunkSize;
    } while (pos < inputBlob.size);

    if (deflatorOrInflator.err) {
      throw new Error(deflatorOrInflator.msg);
    }

    return deflatorOrInflator.result as Uint8Array | number[];
  }

  private mapBlobs = (sharedFiles: SharedFile[]) => sharedFiles.map((sharedFile) => {
    const blob: any = sharedFile.blob;

    if (!sharedFile.blob) {
      return undefined;
    }

    blob.lastModified = blob.lastModified || sharedFile.createdAt.getTime();
    blob.name = sharedFile.fileName;
    return blob as File;
  });


  public compress(blob: Blob): Observable<Blob> {
    const chunkSize = 2 ** 24;

    return from(
      FileService.chunkFiles(blob, new pako.Deflate({ gzip: true }), chunkSize),
    ).pipe(
      map((deflated) => new Blob([ new Uint8Array(deflated) ], { type: blob.type })),
    );
  }

  public decompress(blob: Blob): Observable<Blob> {
    const chunkSize = 2 ** 24;

    return from(
      FileService.chunkFiles(blob, new pako.Inflate({}), chunkSize),
    ).pipe(
      map((deflated) => new Blob([ new Uint8Array(deflated) ], { type: blob.type })),
    );
  }

  public getFileIconURL(fileName: string): string {
    const extensionRegex = /(?:\.([^.]+))?$/;

    const extension = extensionRegex.exec(fileName)[1];
    console.log(extension);

    const extensionExists = extension && fileExtensions.includes(extension.toUpperCase());

    return `assets/file-icons/${ extensionExists ? extension.toUpperCase() : 'Unknown' }.svg`;
  }

  public canShareFiles(...sharedFiles: SharedFile[]): boolean {
    const navigator_ = navigator as any;
    return navigator_.canShare && navigator_.canShare({ files: this.mapBlobs(sharedFiles) });
  }

  public shareFiles(...sharedFiles: SharedFile[]): Observable<unknown> {
    const navigator_ = navigator as any;
    if (this.canShareFiles(...sharedFiles)) {
      return throwError(new Error('Das Teilen von Dateien wird nicht unterstützt!'));
    }

    const maxSenders = 2;

    const senders = sharedFiles
      .map((sharedFile) => sharedFile.fromDevice)
      .filter((sender) => !!sender)
      .filter((sender, pos, array) => array.indexOf(sender) === pos)
      .filter((_, pos) => pos <= maxSenders);

    const shareData = {
      files: this.mapBlobs(sharedFiles),
      title: sharedFiles.length > 1 ? `${ sharedFiles.length } Dateien` : sharedFiles[0].fileName,
      text: `${ sharedFiles.length } Dateien von ${ senders.join(', ') }${ senders.length > maxSenders ? ' und weiteren' : '' }`,
    };

    return from(navigator_.share({ shareData }));
  }

  public async downloadFiles(...sharedFiles: SharedFile[]) {
    if (sharedFiles.length > 1) {
      const zip = new JSZip();
      sharedFiles.forEach((sharedFile) => {
        zip.file(sharedFile.fileName, sharedFile.blob, { date: new Date(sharedFile.blob.lastModified) });
      });
      const archive = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(archive, 'Archiv.zip');
    } else if (sharedFiles.length === 1) {
      FileSaver.saveAs(sharedFiles[0].blob, sharedFiles[0].fileName);
    }
  }

}

import { TestBed } from '@angular/core/testing';

import { FileService } from './file.service';
import { flatMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';

describe('FileService', () => {
  let service: FileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(FileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compress a text blob', (done) => {
    const testBlob = new Blob([ new TextEncoder().encode('TestFile').buffer ], { type: 'text/plain' });
    service.compress(testBlob).pipe(
      flatMap(service.decompress),
    ).subscribe((blob) => {
      expect(blob.size).toEqual(testBlob.size);
      expect(blob.type).toEqual(testBlob.type);
      done();
    }, done.fail);
  });

  it('should compress and decompress an image blob', (done) => {
    let testBlob: Blob;
    from(
      fetch('/assets/file-icons/SVG.svg'),
    ).pipe(
      flatMap((res) => res.blob()),
      tap((blob) => testBlob = blob),
      flatMap(service.compress),
      flatMap(service.decompress),
    ).subscribe((blob) => {
      expect(blob.size).toEqual(testBlob.size);
      expect(blob.type).toEqual(testBlob.type);
      done();
    }, done.fail);
  });

  it('should get an icon URL for a PNG image', () => {
    expect(service.getFileIconURL('test.image.png')).toEqual('assets/file-icons/PNG.svg');
  });

  it('should get an icon URL for an unknown file type', () => {
    expect(service.getFileIconURL('test.unknown.xxx')).toEqual('assets/file-icons/Unknown.svg');
  });

});

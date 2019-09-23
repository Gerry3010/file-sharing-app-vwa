import { TestBed } from '@angular/core/testing';

import { PersistenceService } from './persistence.service';
import { SharedFile } from '../models/shared-file.model';
import { FileRequest } from '../models/file-request.model';
import { combineLatest } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

describe('PersistenceService', () => {
  let service: PersistenceService;

  let createdRequests: FileRequest[] = [];
  let createdFiles: SharedFile[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new PersistenceService();
  });

  beforeEach((done) => {
    const mockRequest = { id: 'mock', files: [ 'testFile' ], createdAt: new Date(), updatedAt: new Date(), deleted: false, title: 'test' };
    const mockRequest2 = { id: 'm2', files: [], createdAt: new Date(), updatedAt: new Date(), deleted: false, title: 'Test2' };
    const mockRequest3 = { id: 'm3', files: [ 'testFile3' ], createdAt: new Date(), updatedAt: new Date(), deleted: false, title: 'Test2' };

    const mockFile1 = {
      id: 'mockFile',
      fileRequest: 'mock',
      createdAt: new Date(),
      blob: new File([ 'test' ], 'test.txt', { type: 'text/plain' }),
      fileName: 'test.txt',
      fromDevice: 'Gerrys Macbook',
    };
    const mockFile2 = {
      id: 'mockFile2',
      fileRequest: undefined,
      createdAt: new Date(),
      blob: new File([ 'test2' ], 'test2.txt', { type: 'text/plain' }),
      fileName: 'test2.txt',
      fromDevice: 'Gerrys Macbook',
    };
    const mockFile3 = {
      id: 'mockFile3',
      fileRequest: 'm3',
      createdAt: new Date(),
      blob: new File([ 'test3' ], 'test3.txt', { type: 'text/plain' }),
      fileName: 'test3.txt',
      fromDevice: 'Gerrys OnePlus',
    };

    combineLatest([
      service.storeFileRequests(mockRequest, mockRequest2, mockRequest3),
      service.storeFiles(mockFile1, mockFile2, mockFile3),
    ]).subscribe(() => {
      createdRequests = [ mockRequest, mockRequest2, mockRequest3 ];
      createdFiles = [ mockFile1, mockFile2, mockFile3 ];
      done();
    }, done.fail);
  }, 7500);

  afterEach((done) => {
    combineLatest([
      service.deleteFileRequests(...createdRequests),
      service.deleteFiles(...createdFiles),
    ]).subscribe(() => {
      done();
    }, done.fail);
  }, 15000);

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store a file request', (done) => {
    const testFileRequest = { id: 'test', files: [], createdAt: new Date(), updatedAt: new Date(), deleted: false, title: 'Test!' };
    service.storeFileRequests(testFileRequest).subscribe((ids) => {
      expect(ids[0]).toEqual(testFileRequest.id);
      createdRequests.push(testFileRequest);
      done();
    }, done.fail);
  });

  it('should get all file requests', (done) => {
    service.getFileRequests().subscribe((fileRequests: FileRequest[]) => {
      expect(fileRequests.length).toEqual(createdRequests.length);
      expect(fileRequests[0].id).toBeTruthy();
      done();
    }, done.fail);
  });

  it('should delete a file request', (done) => {
    const fileRequestToDelete = createdRequests[0];
    service.deleteFileRequests(fileRequestToDelete).subscribe((val) => {
      expect(val).toBe(undefined);
      createdRequests.splice(0, 1);
      done();
    }, done.fail);
  });

  it('should update a file request', (done) => {
    const updatedFileRequest: FileRequest = { ...createdRequests[0], id: 'mock', message: 'Mock File Request' };
    service.storeFileRequests(updatedFileRequest).pipe(
      flatMap(() => service.getFileRequests()),
      map((fileRequests) => fileRequests.find((fr) => fr.id === updatedFileRequest.id)),
    ).subscribe((fileRequest) => {
      expect(fileRequest.id).toEqual(updatedFileRequest.id);
      expect(fileRequest.message).toEqual(updatedFileRequest.message);
      done();
    }, done.fail);
  });

  it('should store a file', (done) => {
    const testFile = {
      fileRequest: 'mock3',
      fromDevice: 'Gerrys Macbook',
      blob: new File([ 'test' ], 'test.txt', { type: 'text/plain' }),
      id: 'testFile2',
      fileName: 'test.txt',
      createdAt: new Date(),
    };
    service.storeFiles(testFile).subscribe((ids) => {
      expect(ids[0]).toEqual(testFile.id);
      createdFiles.push(testFile);
      done();
    }, done.fail);
  });

  it('should get all files', (done) => {
    service.getFiles().subscribe((sharedFiles) => {
      expect(sharedFiles.length).toEqual(createdFiles.length);
      expect(sharedFiles[0].id).toBeTruthy();
      done();
    }, done.fail);
  });

  it('should get all files belonging to the mock file request', (done) => {
    service.getFiles([ createdRequests[0] ]).subscribe((sharedFiles) => {
      expect(sharedFiles.length).toBeLessThan(createdFiles.length);
      expect(sharedFiles[0].id).toBeTruthy();
      expect(sharedFiles[0].fileRequest).toEqual('mock');
      done();
    }, done.fail);
  });

  it('should delete a file', (done) => {
    service.deleteFiles(createdFiles[0]).subscribe((val) => {
      expect(val).toBe(undefined);
      createdFiles.splice(0, 1);
      done();
    }, done.fail);
  });

});

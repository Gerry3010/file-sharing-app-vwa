import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { delayWhen, filter, flatMap, map, switchMap } from 'rxjs/operators';
import * as fromFileRequest from '../../reducers/file-request.reducer';
import { forkJoin, from, Observable, of, Subscription } from 'rxjs';
import { FileRequest } from '../../models/file-request.model';
import { FileCryptoService } from '../../services/file-crypto.service';
import { DeleteFileRequest } from '../../actions/file-request.actions';
import { FileStatus, FileStatusType } from '../../models/file-status.model';
import { FirebaseService } from '../../services/firebase.service';
import { NgxDropzoneChangeEvent } from 'ngx-dropzone';
import { FileService } from '../../services/file.service';
import { SharedFile } from '../../models/shared-file.model';
import { FileUploadData, FileUploadService } from '../../services/file-upload.service';
import { PersistenceService } from '../../services/persistence.service';

@Component({
  selector: 'app-file-request-detail',
  templateUrl: './file-request-detail.component.html',
  styleUrls: [ './file-request-detail.component.scss' ],
})
export class FileRequestDetailComponent implements OnInit, OnDestroy {

  fileRequest?: FileRequest;
  statuses: { [sharedFileId: string]: FileStatus } = {};
  loaded = false;
  exportedPublicKey?: string;
  filesToUpload: File[] = [];
  uploads: { file: Blob, data: FileUploadData }[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private store: Store<any>, private route: ActivatedRoute, private cryptoService: FileCryptoService, private router: Router,
              private firebaseService: FirebaseService, private fileService: FileService, private uploadService: FileUploadService,
              private persistenceService: PersistenceService) {
  }

  ngOnInit() {
    const fileRequestId$ = this.route.paramMap.pipe(map((params) => params.get('id')));
    // noinspection JSDeprecatedSymbols
    this.subscriptions.push(
      fileRequestId$.pipe(
        delayWhen(() => this.store.select(fromFileRequest.selectFeatureState).pipe(filter((state: fromFileRequest.State) => state.loaded))),
        flatMap((fileRequestId) => this.store.select(fromFileRequest.selectFileRequestById, fileRequestId)),
        // filter((fileRequest) => !!fileRequest),
        switchMap((fileRequest) => forkJoin({
          fileRequest: of(fileRequest),
          exportedPublicKey: (fileRequest && fileRequest.publicKey)
            ? this.cryptoService.exportAsymmetricKey(fileRequest.publicKey)
            : of(undefined),
        })),
      ).subscribe(({ fileRequest, exportedPublicKey }) => {
        this.loaded = true;
        this.fileRequest = fileRequest;
        this.exportedPublicKey = exportedPublicKey;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  get qrCodeValue(): string {
    return JSON.stringify({
      id: this.fileRequest.id,
      publicKey: this.exportedPublicKey,
      creator: this.persistenceService.getDeviceName(),
    });
  }

  deleteFileRequest() {
    // TODO: Delete local and/or firebase version, depending on fileRequest.isIncoming
    // TODO: Show Dialog
    const fileRequest = this.fileRequest;
    if (fileRequest) {
      this.store.dispatch(new DeleteFileRequest({ id: fileRequest.id }));
      let observable: Observable<unknown>;
      if (fileRequest.isIncoming) {
        observable = this.firebaseService.deleteFileRequest(fileRequest).pipe(
          switchMap(() => this.router.navigate([ '' ])),
        );
      } else {
        observable = from(this.router.navigate([ '' ]));
      }
      observable.subscribe({
        error: (error) => {
          console.log(error);
          // TODO: Show Snackbar
        },
      });
    }
  }

  onDropZoneChange(event: NgxDropzoneChangeEvent) {
    this.filesToUpload = [ ...this.filesToUpload, ...event.addedFiles ];
    for (const file of event.addedFiles) {
      this.setUploadData(file, {});
      this.uploadService.queueUpload(this.fileRequest, file, this.persistenceService.getDeviceName()).subscribe((uploadData) => {
        this.setUploadData(file, uploadData);
      });
    }
  }

  onRemove(file: File) {
    this.filesToUpload = this.filesToUpload.filter((f) => f !== file);
  }

  getUploadData(file: File): FileUploadData | undefined {
    const uploadData = this.uploads.find((upload) => upload.file === file);
    return uploadData ? uploadData.data : undefined;
  }

  setUploadData(file: File, data: FileUploadData): number {
    let index = this.uploads.findIndex((upload) => upload.file === file);
    index = index === -1 ? this.uploads.length : index;
    this.uploads[index] = { file, data };
    return index;
  }

  getProgressBarMode(file?: File): 'determinate' | 'indeterminate' | 'buffer' | 'query' {
    const status = this.getStatus(file);
    if (!status) {
      return 'query';
    }
    switch (status.type) {
      case FileStatusType.UploadStarted:
        return 'buffer';
      case FileStatusType.UploadUpdate:
      case FileStatusType.UploadCompleted:
        return 'determinate';
      default:
        return 'indeterminate';
    }
  }

  getProgressBarPercent(file?: File): number | undefined {
    const status = this.getStatus(file);
    if (!status) {
      return 0;
    }
    return status.type === FileStatusType.UploadUpdate
      ? (status.bytes.loaded / status.bytes.total) * 100
      : status.type === FileStatusType.UploadCompleted
        ? 100
        : 0;
  }

  getStatus(file?: File): FileStatus | undefined {
    const uploadData = this.getUploadData(file);
    return (!file || !uploadData || !this.statuses[uploadData.id])
      ? undefined
      : this.statuses[uploadData.id];
  }

  getError(file?: File): string | undefined {
    const uploadData = this.getUploadData(file);
    return (uploadData && uploadData.error) ? uploadData.error.toString() : undefined;
  }

}

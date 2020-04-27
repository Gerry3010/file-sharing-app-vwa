import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import { SharedFile } from '../../models/shared-file.model';
import { combineLatest, Subscription } from 'rxjs';
import { FileStatus, FileStatusType } from '../../models/file-status.model';
import * as fromSharedFile from '../../reducers/shared-file.reducer';
import * as fromFileStatus from '../../reducers/file-status.reducer';
import { FileService } from '../../services/file.service';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { DeleteFileStatus, UpsertFileStatus } from '../../actions/file-status.actions';
import { DeleteSharedFiles } from '../../actions/shared-file.actions';
import { RemoveFileFromFileRequest } from '../../actions/file-request.actions';

interface SharedFileWithStatus {
  sharedFile: SharedFile;
  status: FileStatus | undefined;
}

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: [ './file-list.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  sharedFileIds?: string[];

  @Input()
  showFileRequestColumn = false;

  sharedFiles: { [sharedFileId: string]: SharedFile } = {};
  statuses: { [sharedFileId: string]: FileStatus } = {};

  displayedColumns = [ 'select', 'icon', 'fileName', 'fromDevice', 'lastModified', 'createdAt', 'size', 'status' ];
  dataSource = new MatTableDataSource<SharedFileWithStatus>();
  selection = new SelectionModel<SharedFileWithStatus>(true, []);

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subscriptions: { [sharedFileId: string]: Subscription } = {};

  constructor(private store: Store<any>, private fileService: FileService) {
  }

  ngOnInit() {
    this.dataSource.sortingDataAccessor = (file, property) => {
      switch (property) {
        case 'fileName':
          return file.sharedFile.fileName;
        case 'fromDevice':
          return file.sharedFile.fromDevice;
        case 'lastModified':
          return file.sharedFile.lastModified;
        case 'createdAt':
          return file.sharedFile.createdAt;
        case 'size':
          return file.sharedFile.blob.size;
        case 'status':
          return file.status ? file.status.message : undefined;
        default:
          return file[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.updateSharedFileSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showFileRequestColumn']) {
      this.displayedColumns = this.showFileRequestColumn
        ? [ ...this.displayedColumns, 'fileRequest' ]
        : this.displayedColumns.filter((col) => col === 'fileRequest');
    }
    if (changes['sharedFileIds']) {
      this.updateSharedFileSubscriptions();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  updateSharedFileSubscriptions() {
    this.unsubscribeAll();
    if (this.sharedFileIds) {
      for (const sharedFileId of this.sharedFileIds) {
        this.subscriptions[sharedFileId] = combineLatest([
          this.store.select(fromSharedFile.selectFileById, sharedFileId),
          this.store.select(fromFileStatus.selectFileStatusByFileId, sharedFileId),
        ]).subscribe(([ sharedFile, status ]) => {
          if (sharedFile) {
            this.sharedFiles = { ...this.sharedFiles, [sharedFile.id]: sharedFile };
            this.statuses = { ...this.statuses, [sharedFile.id]: status };
            this.dataSource.data = this.sharedFilesWithStatus;
          }
        });
      }
    } else {
      this.subscriptions['ALL_FILES'] = combineLatest([
        this.store.select(createSelector(fromSharedFile.selectFeatureState, fromSharedFile.selectEntities)),
        this.store.select(createSelector(fromFileStatus.selectFeatureState, fromFileStatus.selectEntities)),
      ]).subscribe(([ sharedFiles, statuses ]) => {
        this.sharedFiles = sharedFiles;
        this.statuses = statuses;
        this.dataSource.data = this.sharedFilesWithStatus;
      });
    }
  }

  unsubscribeAll = () => {
    Object.values(this.subscriptions).forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = {};
    this.sharedFiles = {};
    this.statuses = {};
    this.dataSource.data = [];
  };

  get sharedFilesArray() {
    return Object.values(this.sharedFiles || {});
  }

  get sharedFilesWithStatus(): SharedFileWithStatus[] {
    return this.sharedFilesArray.map((sharedFile) => ({ sharedFile, status: this.statuses[sharedFile.id] }));
  }

  /** Whether the number of selected elements matches the total number of rows. */
  get isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected ?
      this.selection.clear() :
      this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: SharedFileWithStatus): string {
    return row
      ? `${ this.selection.isSelected(row) ? 'deselect' : 'select' } row ${ row.sharedFile.fileName }`
      : `${ this.isAllSelected ? 'select' : 'deselect' } all`;
  }

  getProgressSpinnerMode(fileStatus: FileStatus) {
    return fileStatus.type === FileStatusType.UploadUpdate ? 'determinate' : 'indeterminate';
  }

  getProgressSpinnerValue(fileStatus: FileStatus) {
    console.log(fileStatus.bytes);
    return fileStatus.type === FileStatusType.UploadUpdate ? (fileStatus.bytes.loaded / fileStatus.bytes.total) * 100 : 0;
  }

  get selectedFiles() {
    return this.selection.selected.map(({ sharedFile }) => sharedFile);
  }

  get canDownloadSelectedFiles() {
    return this.selectedFiles.length > 0 && this.selection.selected.filter(({ sharedFile }) => !!sharedFile.blob).length > 0;
  }

  get canShareSelectedFiles() {
    return this.selectedFiles.length > 0 && this.fileService.canShareFiles(...this.selectedFiles);
  }

  downloadSelectedFiles() {
    const selectedFiles = this.selectedFiles;
    return this.fileService.downloadFiles(...selectedFiles)
      .catch((error) => {
        console.error(error);
        this.selection.clear();
        selectedFiles.forEach(
          (file) => this.store.dispatch(new UpsertFileStatus({
            fileStatus: {
              id: file.id,
              message: 'Fehler beim Herunterladen',
              type: FileStatusType.Error,
            },
          })),
        );
      });
  }

  shareSelectedFiles() {
    const selectedFiles = this.selectedFiles;
    return this.fileService.shareFiles(...selectedFiles).subscribe({
      error: () => {
        this.selection.clear();
        selectedFiles.forEach(
          (file) => this.store.dispatch(new UpsertFileStatus({
            fileStatus: {
              id: file.id,
              message: 'Fehler beim Teilen',
              type: FileStatusType.Error,
            },
          })),
        );
      },
    });
  }

  deleteSelectedFiles() {
    // TODO: Open Material Dialog
    // TODO: Inform user when !fileRequest.isIncoming that only local files are deleted, not the ones from the sender
    const selectedFiles = this.selectedFiles;
    if (confirm('Möchtest du ' + selectedFiles.length + ' Dateien wirklich löschen?')) {
      selectedFiles.forEach((file) => {
        // Delete the File Status
        this.store.dispatch(new DeleteFileStatus({ id: file.id }));
        // Remove Relation to File Request
        if (file.fileRequest) {
          this.store.dispatch(new RemoveFileFromFileRequest({ fileRequestId: file.fileRequest, sharedFileId: file.id }));
        }
      });
      // Delete the Shared Files
      this.store.dispatch(new DeleteSharedFiles({ ids: selectedFiles.map((sharedFile) => sharedFile.id) }));
      // Deselect Shared Files
      this.selection.clear();
    }
  }

}

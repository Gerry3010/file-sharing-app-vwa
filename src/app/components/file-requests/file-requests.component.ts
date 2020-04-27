import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../../reducers';
import { FileService } from '../../services/file.service';
import { MatDialog } from '@angular/material';
import {
  CreateFileRequestDialogComponent,
  CreateFileRequestDialogData,
} from '../create-file-request-dialog/create-file-request-dialog.component';
import { filter, flatMap, switchMap, tap } from 'rxjs/operators';
import { FirebaseService } from '../../services/firebase.service';
import { AddFileRequest } from '../../actions/file-request.actions';
import { Router } from '@angular/router';
import { ImportFileRequestDialogComponent } from '../import-file-request-dialog/import-file-request-dialog.component';
import { combineLatest, of } from 'rxjs';
import { FileCryptoService } from '../../services/file-crypto.service';

enum SelectedTabType {
  'incoming', 'outgoing', 'latest'
}

const SELECTED_TAB_KEY = 'lastSelectedTab';

@Component({
  selector: 'app-file-requests',
  templateUrl: './file-requests.component.html',
  styleUrls: [ './file-requests.component.scss' ],
})
export class FileRequestsComponent implements OnInit {

  public selectedTab: SelectedTabType = parseInt(localStorage.getItem(SELECTED_TAB_KEY), undefined) || SelectedTabType.incoming;
  public selectedTabFabIcon = {
    [SelectedTabType.incoming]: 'save_alt',
    [SelectedTabType.outgoing]: 'publish',
  };

  constructor(private store: Store<State>, private fileService: FileService, private firebase: FirebaseService, private dialog: MatDialog,
              private router: Router, private cryptoService: FileCryptoService) {
  }

  ngOnInit() {
  }

  selectedTabChanged(index: number) {
    this.selectedTab = [ SelectedTabType.incoming, SelectedTabType.outgoing, SelectedTabType.latest ][index] || SelectedTabType.incoming;
    localStorage.setItem(SELECTED_TAB_KEY, this.selectedTab.toString());
  }

  fabClicked(event: MouseEvent) {
    switch (this.selectedTab) {
      case SelectedTabType.incoming: {
        this.openCreateDialog();
        break;
      }
      case SelectedTabType.outgoing: {
        this.openImportDialog();
        break;
      }
    }
  }

  addFileRequestClicked(type: 'incoming' | 'outgoing') {
    type === 'incoming' ? this.openCreateDialog() : this.openImportDialog();
  }

  private openCreateDialog() {
    // TODO: Open page to create a file request
    const dialogRef = this.dialog.open(CreateFileRequestDialogComponent);
    dialogRef.afterClosed().pipe(
      filter((result?: CreateFileRequestDialogData) => !!(result && result.title)),
      flatMap((result: CreateFileRequestDialogData) => this.firebase.createFileRequest(result.title, result.message)),
      flatMap((fileRequest) => {
        this.store.dispatch(new AddFileRequest({ fileRequest }));
        return this.router.navigate([ 'file-requests', fileRequest.id ]);
      }),
    ).subscribe({
      error: (error) => {
        // TODO: Show Snackbar
        console.error(error);
      },
    });
  }

  private openImportDialog() {
    // TODO: Open page to scan QR and add a file request
    const dialogRef = this.dialog.open(ImportFileRequestDialogComponent);
    dialogRef.afterClosed().pipe(
      filter((result?: { id, publicKey, creator }) => !!result),
      switchMap(({ id, publicKey, creator }) => combineLatest([
        of(id),
        this.cryptoService.importRSAPublicKey(publicKey),
        of(creator),
      ])),
    ).subscribe(
      ([ id, publicKey, creator ]) => {
        this.store.dispatch(new AddFileRequest({
          fileRequest: {
            id,
            isIncoming: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            files: [],
            publicKey,
            createdBy: creator,
            title: '',
            isDeleted: false,
          },
        }));
      },
      (error) => {
        // TODO: Show Snackbar
        console.error(error);
      },
    );
  }

}

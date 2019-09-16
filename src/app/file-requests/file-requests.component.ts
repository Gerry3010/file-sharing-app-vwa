import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { FileService } from '../services/file.service';
import { SharedFile } from '../models/shared-file.model';

enum SelectedTabType {
  'incoming', 'outgoing', 'latest'
}

@Component({
  selector: 'app-file-requests',
  templateUrl: './file-requests.component.html',
  styleUrls: [ './file-requests.component.scss' ],
})
export class FileRequestsComponent implements OnInit {

  public selectedTab: SelectedTabType = SelectedTabType.incoming;
  public selectedTabFabIcon = {
    [SelectedTabType.incoming]: 'save_alt',
    [SelectedTabType.outgoing]: 'share',
  };

  constructor(private store: Store<State>, private fileService: FileService) {
  }

  ngOnInit() {
  }

  selectedTabChanged(index: number) {
    this.selectedTab = [ SelectedTabType.incoming, SelectedTabType.outgoing, SelectedTabType.latest ][index] || SelectedTabType.incoming;
  }

  fabClicked(event: MouseEvent) {
    switch (this.selectedTab) {
      case SelectedTabType.incoming:
        // TODO: Open page to create a file request
        const sharedFile = <SharedFile>{
          blob: new File([ 'Test' ], 'test.txt'),
          fileName: 'test.txt',
          createdAt: new Date(),
          id: 'test',
          fromDevice: 'Gerrys MacBook',
          uploadedAt: new Date(),
        };
        const canShareFiles = this.fileService.canShareFiles(sharedFile);
        const fileIconURL = this.fileService.getFileIconURL(sharedFile.fileName);
        console.log({
          canShareFiles,
          fileIconURL,
        });
        if (canShareFiles) {
          this.fileService.shareFiles(sharedFile);
        } else {
          this.fileService.downloadFiles(sharedFile);
        }
        break;
      case SelectedTabType.outgoing:
        // TODO: Open page to scan QR and add a file request
        break;
    }
  }


}

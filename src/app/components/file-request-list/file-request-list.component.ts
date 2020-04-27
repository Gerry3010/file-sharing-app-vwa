import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { merge, Observable, of, Subscription } from 'rxjs';
import { FileRequest } from '../../models/file-request.model';
import { selectFeatureState, selectIncomingFileRequests, selectOutgoingFileRequests } from '../../reducers/file-request.reducer';
import { State } from '../../reducers';
import { UpdateFileRequest } from '../../actions/file-request.actions';
import { selectFilesByFileRequestId } from '../../reducers/selectors';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

type FilterType = 'incoming' | 'outgoing';

@Component({
  selector: 'app-file-request-list',
  templateUrl: './file-request-list.component.html',
  styleUrls: [ './file-request-list.component.scss' ],
})
export class FileRequestListComponent implements OnInit, OnDestroy {
  @Input()
  type: FilterType = 'incoming';

  @Output()
  addFileRequestClick = new EventEmitter<FilterType>();

  fileRequests$: Observable<FileRequest[]>;
  fileRequestNames: { [fileRequestId: string]: string } = {};
  loaded = true;
  private subscriptions: Subscription[] = [];

  constructor(private store: Store<State>) {
  }

  ngOnInit() {
    this.fileRequests$ = this.store.select(this.type === 'incoming' ? selectIncomingFileRequests : selectOutgoingFileRequests);
    this.subscriptions.push(
      this.fileRequests$.pipe(
        switchMap((fileRequests) => this.getDeviceNames(...fileRequests))).subscribe(({ id, deviceNames }) => {
        this.fileRequestNames[id] = deviceNames;
      }),
      this.store.select(selectFeatureState).subscribe((state) => {
        this.loaded = state.loaded;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  toggleFavorite(fileRequest: FileRequest) {
    this.store.dispatch(new UpdateFileRequest({ fileRequest: { id: fileRequest.id, changes: { isFavorite: !fileRequest.isFavorite } } }));
  }

  filterFavorites(fileRequests: FileRequest[] = []) {
    const favorites = fileRequests.filter((fr) => fr.isFavorite);
    return favorites.length > 0 ? favorites : undefined;
  }

  filterNonFavorites(fileRequests: FileRequest[] = []) {
    return fileRequests.filter((fr) => !fr.isFavorite);
  }

  getDeviceNames(...fileRequests: FileRequest[]): Observable<{ id: string, deviceNames: string }> {
    return merge(...fileRequests.map(
      (fileRequest) =>
        (fileRequest.isIncoming ? this.store.select(selectFilesByFileRequestId, fileRequest.id).pipe(
            map((files) => ({ files: files.filter((_, i) => i < 3), moreThan3: files.length > 3 })),
            map(({ files, moreThan3 }) => ({
              files: files.sort((a, b) => a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0),
              moreThan3,
            })),
            map(({ files, moreThan3 }) => ({ devices: files.map((file) => file ? file.fromDevice : ''), moreThan3 })),
            map(({ devices, moreThan3 }) => `${ devices.join(', ') }${ moreThan3 ? 'und weiteren' : '' }`),
          ) : of(fileRequest.createdBy)
        ).pipe(
          map((deviceNames) => ({ id: fileRequest.id, deviceNames })),
        ),
    ));
  }

  noFileRequestButtonClicked() {
    this.addFileRequestClick.emit(this.type);
  }

}

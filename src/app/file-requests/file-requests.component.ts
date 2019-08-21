import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '../reducers';

@Component({
  selector: 'app-file-requests',
  templateUrl: './file-requests.component.html',
  styleUrls: [ './file-requests.component.scss' ],
})
export class FileRequestsComponent implements OnInit {

  constructor(private store: Store<State>) {
  }

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-incoming-requests',
  templateUrl: './incoming-requests.component.html',
  styleUrls: [ './incoming-requests.component.scss' ],
})
export class IncomingRequestsComponent implements OnInit {

  constructor(private store: Store<any>) {
  }

  ngOnInit() {
  }

}

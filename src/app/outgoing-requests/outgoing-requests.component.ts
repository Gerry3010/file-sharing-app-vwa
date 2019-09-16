import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-outgoing-requests',
  templateUrl: './outgoing-requests.component.html',
  styleUrls: ['./outgoing-requests.component.scss']
})
export class OutgoingRequestsComponent implements OnInit {

  constructor(private store: Store<any>) { }

  ngOnInit() {
  }

}

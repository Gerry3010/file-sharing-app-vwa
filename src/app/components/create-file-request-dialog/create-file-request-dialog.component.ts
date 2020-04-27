import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

export interface CreateFileRequestDialogData {
  title: string;
  message?: string;
}

@Component({
  selector: 'app-create-file-request-dialog',
  templateUrl: './create-file-request-dialog.component.html',
  styleUrls: [ './create-file-request-dialog.component.scss' ],
})
export class CreateFileRequestDialogComponent implements OnInit {

  data: CreateFileRequestDialogData = { title: '' };

  constructor(public dialogRef: MatDialogRef<CreateFileRequestDialogComponent>) {
  }

  ngOnInit() {
  }

  onCancel() {
    this.dialogRef.close();
  }

}

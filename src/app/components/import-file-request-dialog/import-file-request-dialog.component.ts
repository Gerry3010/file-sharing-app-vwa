import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-import-file-request-dialog',
  templateUrl: './import-file-request-dialog.component.html',
  styleUrls: [ './import-file-request-dialog.component.css' ],
})
export class ImportFileRequestDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ImportFileRequestDialogComponent>) {
  }

  ngOnInit() {
  }

  onScanSuccess(result: string) {
    try {
      const json = JSON.parse(result);
      const { id, publicKey, creator } = json;
      if (!id || !publicKey || !creator) {
        throw new Error('Der QR-Code enthält nicht genügend Informationen');
      }
      this.dialogRef.close({ id, publicKey, creator });
    } catch {
      // TODO: Display Snackbar
    }
  }

  onClose() {
    this.dialogRef.close();
  }

}

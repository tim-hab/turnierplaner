import { Component, inject } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportJsonService } from '../../services/export-json.service';

@Component({
  selector: 'app-import-json.dialog',
  imports: [MatAnchor],
  templateUrl: './import-json.dialog.html',
  styleUrl: './import-json.dialog.css',
})
export class ImportJsonDialog {
  content = inject(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef);
  jsonService = inject(ExportJsonService);

  close() {
    this.ref.close();
  }

  onlyPlayers() {
    this.jsonService.importPlayerData(this.content);
    this.ref.close();
  }

  allData() {
    this.jsonService.importJsonString(this.content);
    this.ref.close();
  }
}

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportJsonDialog } from '../dialogs/import-json.dialog/import-json.dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  dialog = inject(MatDialog);

  openImportDialog(content: string) {
    this.dialog.open(ImportJsonDialog, { data: content });
  }
}

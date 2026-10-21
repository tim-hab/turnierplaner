import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-message.dialog',
  imports: [MatDialogContent, MatDialogActions, MatAnchor],
  templateUrl: './message.dialog.html',
  styleUrl: './message.dialog.css',
})
export class MessageDialog {
  protected readonly data = inject<{ message: string; acceptText?: string }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MessageDialog>);

  protected abort(): void {
    this.dialogRef.close(false);
  }

  protected close(): void {
    this.dialogRef.close(true);
  }
}

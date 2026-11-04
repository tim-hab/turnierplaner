import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TournamentSummary } from '@core/repositories/tournament-repository';

@Component({
  selector: 'app-load-tournament.dialog',
  imports: [MatDialogContent, MatDialogActions, MatButton],
  templateUrl: './load-tournament.dialog.html',
})
export class LoadTournamentDialog {
  protected readonly tournaments = inject<TournamentSummary[]>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<LoadTournamentDialog>);

  protected close(): void {
    this.dialogRef.close();
  }

  protected select(id: number): void {
    this.dialogRef.close(id);
  }
}

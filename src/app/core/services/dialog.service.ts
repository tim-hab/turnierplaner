import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportJsonDialog } from '@shared/dialogs/import-json.dialog/import-json.dialog';
import { MessageDialog } from '@shared/dialogs/message.dialog/message.dialog';
import { LoadTournamentDialog } from '@shared/dialogs/load-tournament.dialog/load-tournament.dialog';
import { TournamentSummary } from '../repositories/tournament-repository';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  dialog = inject(MatDialog);

  openImportDialog(content: string) {
    this.dialog.open(ImportJsonDialog, { data: content });
  }

  openMessageDialog(message: string, acceptText?: string) {
    return this.dialog.open(MessageDialog, { data: { message, acceptText } });
  }

  openLoadTournamentDialog(tournaments: TournamentSummary[]) {
    return this.dialog.open(LoadTournamentDialog, { data: tournaments });
  }
}

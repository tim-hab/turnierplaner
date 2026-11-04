import { Component, DestroyRef, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TournamentService } from '@core/services/tournament.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Algorithm } from '@core/datatypes/match';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { FileInput } from '@shared/file-input/file-input';
import { FileExport } from '@shared/file-export/file-export';
import { PlayerService } from '@core/services/player.service';
import { ExportJsonService } from '@core/services/export-json.service';
import { DialogService } from '@core/services/dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tournament-control',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    MatIcon,
    FileInput,
    FileExport,
  ],
  templateUrl: './tournament-control.html',
  styleUrl: './tournament-control.css',
})
export class TournamentControl {
  tournamentService = inject(TournamentService);
  playerService = inject(PlayerService);
  exportService = inject(ExportJsonService);
  dialogService = inject(DialogService);
  destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  fieldsControl = new FormControl<number>(4, Validators.required);
  roundControl = new FormControl<number>(5, Validators.required);
  algorithmControl = new FormControl<Algorithm>(Algorithm.random, Validators.required);
  eloModControl = new FormControl<number>(50, Validators.required);
  eloAenControl = new FormControl<number>(32, Validators.required);

  Algorithm = Algorithm;
  matchMaking = false;
  collapsed = false;

  constructor() {
    effect(() => {
      this.roundControl.setValue(this.tournamentService.totalRounds(), { emitEvent: false });
    });
  }

  startTournament() {
    if (this.fieldsControl.valid && this.roundControl.valid) {
      if (
        this.matchMaking &&
        this.algorithmControl.valid &&
        this.eloModControl.valid &&
        this.eloAenControl.valid
      ) {
        this.tournamentService.startTournament(
          this.roundControl.value!,
          this.fieldsControl.value!,
          this.eloModControl.value!,
          this.algorithmControl.value!,
          this.eloAenControl.value!,
        );
      } else {
        this.tournamentService.startTournament(this.roundControl.value!, this.fieldsControl.value!);
      }
      void this.router.navigate(['/fields']);
    }
  }

  endTournament() {
    if (this.tournamentService.round() < this.tournamentService.totalRounds()) {
      this.dialogService
        .openMessageDialog(
          'Die eingestellte Rundenanzahl ist noch nicht erreicht. Möchtest du das Turnier trotzdem beenden?',
          'Beenden',
        )
        .afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((accepted: boolean) => {
          if (accepted) {
            this.tournamentService.endTournament();
            void this.router.navigate(['/table']);
          }
        });
    } else {
      this.tournamentService.endTournament();
      void this.router.navigate(['/table']);
    }
  }

  newTournament() {
    this.dialogService
      .openMessageDialog('Sollen die Spielerdaten übernommen werden?', 'Spieler übernehmen')
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((keepPlayers: boolean) => {
        if (keepPlayers) {
          this.exportService.importPlayerData(this.exportService.generateJsonString());
        } else {
          this.playerService.reset();
          this.tournamentService.reset();
        }
        void this.exportService.saveAsNewTournament().catch((error: unknown) => {
          console.error('Das neue Turnier konnte nicht gespeichert werden.', error);
        });
        void this.router.navigate(['/settings']);
      });
  }

  nextRound() {
    if (this.fieldsControl.valid && this.roundControl.valid) {
      if (
        this.matchMaking &&
        this.algorithmControl.valid &&
        this.eloModControl.valid &&
        this.eloAenControl.valid
      ) {
        this.tournamentService.nextRound(
          this.roundControl.value!,
          this.fieldsControl.value!,
          this.eloModControl.value!,
          this.algorithmControl.value!,
          this.eloAenControl.value!,
        );
      } else {
        this.tournamentService.nextRound(this.roundControl.value!, this.fieldsControl.value!);
      }
      void this.router.navigate(['/fields']);
    }
  }

  toggleProb() {
    this.tournamentService.toggleProb();
  }

  toggleMatchMaking(e: MatSlideToggleChange) {
    this.matchMaking = e.checked;
    if (e.checked) {
      this.collapsed = false;
    }
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }
}

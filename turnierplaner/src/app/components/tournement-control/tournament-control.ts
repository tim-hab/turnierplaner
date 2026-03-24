import { Component, inject, output } from '@angular/core';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TournamentService } from '../../services/tournament.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route } from '../../app.routes';
import { MatSelectModule } from '@angular/material/select';
import { Algorithm } from '../../datatypes/Match';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

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
  ],
  templateUrl: './tournament-control.html',
  styleUrl: './tournament-control.css',
})
export class TournamentControl {
  private tournamentService = inject(TournamentService);

  fieldsControl = new FormControl<number>(4, Validators.required);
  roundControl = new FormControl<number>(5, Validators.required);
  algorithmControl = new FormControl<Algorithm>(Algorithm.random, Validators.required);
  eloModControl = new FormControl<number>(50, Validators.required);
  eloAenControl = new FormControl<number>(32, Validators.required);

  activeRoute = output<Route>();

  Algorithm = Algorithm;
  matchMaking = false;
  collapsed = false;

  startTournament() {
    if (this.fieldsControl.valid && this.roundControl.valid) {
      this.activeRoute.emit(Route.FieldView);
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
    }
  }

  exportCSV() {
    /* empty */
  }

  endTournament() {
    /* empty */
  }

  nextRound() {
    if (this.fieldsControl.valid) {
      this.activeRoute.emit(Route.FieldView);
      if (
        this.matchMaking &&
        this.algorithmControl.valid &&
        this.eloModControl.valid &&
        this.eloAenControl.valid
      ) {
        this.tournamentService.nextRound(
          this.roundControl.value!,
          this.eloModControl.value!,
          this.algorithmControl.value!,
          this.eloAenControl.value!,
        );
      } else {
        this.tournamentService.nextRound(this.fieldsControl.value!);
      }
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

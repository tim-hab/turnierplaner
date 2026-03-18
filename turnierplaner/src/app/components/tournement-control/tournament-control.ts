import { Component, inject, output } from '@angular/core';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TournamentService } from '../../services/tournament.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route } from '../../app.routes';

@Component({
  selector: 'app-tournament-control',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
  ],
  templateUrl: './tournament-control.html',
  styleUrl: './tournament-control.css',
})
export class TournamentControl {
  private tournamentService = inject(TournamentService);

  fieldsControl = new FormControl<number>(4, Validators.required);
  roundControl = new FormControl<number>(5, Validators.required);

  activeRoute = output<Route>();

  startTournament() {
    if (this.fieldsControl.valid && this.roundControl.valid) {
      this.activeRoute.emit(Route.FieldView);
      this.tournamentService.startTournament(this.roundControl.value!, this.fieldsControl.value!);
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
      this.tournamentService.nextRound(this.fieldsControl.value!);
    }
  }

  toggleProb() {
    this.tournamentService.toggleProb();
  }
}

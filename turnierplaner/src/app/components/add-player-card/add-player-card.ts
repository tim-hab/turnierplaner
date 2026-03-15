import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { PlayerService } from '../../services/player.service';

const clubs = ['SuS Westenholz', 'Boke'];

@Component({
  selector: 'app-add-player-card',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './add-player-card.html',
  styleUrl: './add-player-card.css',
})
export class AddPlayerCard {
  form = new FormGroup({
    nameControl: new FormControl<string>('', Validators.required),
    clubControl: new FormControl<string>('', Validators.required),
    eloControl: new FormControl<number>(5),
  });

  playerService = inject(PlayerService);

  addPlayer(event: PointerEvent) {
    event.preventDefault();
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.playerService.addNewPlayer(this.form.value.nameControl!, this.form.value.clubControl!, this.form.value.eloControl!)
    }
  }

  addClub(event: PointerEvent) {
    event.preventDefault();
    const name = prompt('Neuen Verein eingeben: ');
    if (name) this.playerService.addNewClub(name);
  }
}

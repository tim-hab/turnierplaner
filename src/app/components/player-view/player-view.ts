import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlayerService } from '@core/services/player.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Player, sortByName } from '@core/datatypes/player';
import { MatInputModule } from '@angular/material/input';
import { SelectOnFocusDirective } from '@core/directives/select-on-focus.directive';

@Component({
  selector: 'app-player-view',
  imports: [
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    SelectOnFocusDirective,
  ],
  templateUrl: './player-view.html',
  styleUrl: './player-view.css',
})
export class PlayerView {
  playerService = inject(PlayerService);
  round = Math.round;
  sortByName = sortByName;
  editingId: number | null = null;
  private newPlayerName = '';

  editName(player: Player) {
    this.newPlayerName = player.name;
    this.editingId = player.id;
  }

  updateName(input: HTMLInputElement) {
    this.newPlayerName = input.value;
  }

  saveName(player: Player) {
    this.editingId = null;
    this.playerService.updatePlayerName(this.newPlayerName, player);
    this.newPlayerName = '';
  }
}

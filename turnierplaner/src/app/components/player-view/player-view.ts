import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlayerService } from '../../services/player.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Player, sortByName } from '../../datatypes/player';
import { MatInputModule } from '@angular/material/input';
import { SelectOnFocusDirective } from '../../directives/select-on-focus.directive';

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

  editName(id: number) {
    this.editingId = id;
  }

  updateName(player: Player, input: HTMLInputElement) {
    player.name = input.value;
  }

  saveName() {
    this.editingId = null;
    this.playerService.player.update((l) => [...l]);
  }
}

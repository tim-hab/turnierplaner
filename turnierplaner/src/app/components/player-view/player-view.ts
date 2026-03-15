import { Component, inject } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-view',
  imports: [MatList, MatListItem, MatButtonModule, MatIconModule],
  templateUrl: './player-view.html',
  styleUrl: './player-view.css',
})
export class PlayerView {
  playerService = inject(PlayerService);
}

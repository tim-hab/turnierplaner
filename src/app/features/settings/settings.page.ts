import { Component } from '@angular/core';
import { AddPlayerCard } from '../../components/add-player-card/add-player-card';
import { PlayerView } from '../../components/player-view/player-view';

@Component({
  selector: 'app-settings-page',
  imports: [AddPlayerCard, PlayerView],
  template: `
    <div class="app-control-wrapper">
      <app-add-player-card />
      <app-player-view />
    </div>
  `,
})
export class SettingsPage {}

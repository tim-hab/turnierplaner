import { Component, input } from '@angular/core';
import { AddPlayerCard } from '../add-player-card/add-player-card';
import { PlayerView } from '../player-view/player-view';
import { FieldView } from '../field-view/field-view';
import { GameHistory } from '../game-history/game-history';
import { LiveTable } from '../live-table/live-table';
import { Route } from '../../app.routes';

@Component({
  selector: 'app-control',
  imports: [AddPlayerCard, PlayerView, FieldView, GameHistory, LiveTable],
  templateUrl: './control.html',
  styleUrl: './control.css',
})
export class Control {
  activeRoute = input.required<Route>();
  Route = Route;
}

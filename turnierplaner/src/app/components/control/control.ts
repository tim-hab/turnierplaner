import { Component, input } from '@angular/core';
import { AddPlayerCard } from '../add-player-card/add-player-card';
import { TournamentControl } from '../tournement-control/tournament-control';
import { PlayerView } from '../player-view/player-view';
import { FieldView } from '../field-view/field-view';
import { GameHistory } from '../game-history/game-history';
import { LiveTable } from '../live-table/live-table';
import { TournamentEvaluation } from '../tournament-evaluation/tournament-evaluation';
import { Route } from '../../app.routes';

@Component({
  selector: 'app-control',
  imports: [
    AddPlayerCard,
    TournamentControl,
    PlayerView,
    FieldView,
    GameHistory,
    LiveTable,
    TournamentEvaluation,
  ],
  templateUrl: './control.html',
  styleUrl: './control.css',
})
export class Control {
  activeRoute = input.required<Route>();
  Route = Route;
}

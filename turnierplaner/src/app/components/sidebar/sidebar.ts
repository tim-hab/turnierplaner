import { Component, output } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Route } from '../../app.routes';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [MatButtonModule, MatIconButton, MatIcon, MatTooltip],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  activeRoute = output<Route>();

  showSettings() {
    this.activeRoute.emit(Route.Settings);
  }

  showFields() {
    this.activeRoute.emit(Route.FieldView);
  }

  showTable() {
    this.activeRoute.emit(Route.TableView);
  }
}

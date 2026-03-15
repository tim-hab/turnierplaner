import { Component, signal } from '@angular/core';
import { Control } from './components/control/control';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [Control, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('turnierplaner');
}

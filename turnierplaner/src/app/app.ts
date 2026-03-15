import { Component, signal } from '@angular/core';
import { Control } from "./components/control/control";

@Component({
  selector: 'app-root',
  imports: [Control],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('turnierplaner');
}

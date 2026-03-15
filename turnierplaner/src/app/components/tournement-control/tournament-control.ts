import { Component } from '@angular/core';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInput, MatInputModule } from "@angular/material/input";
import { MatAnchor, MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-tournament-control',
  imports: [MatFormFieldModule, MatLabel, MatInputModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './tournament-control.html',
  styleUrl: './tournament-control.css',
})
export class TournamentControl {}

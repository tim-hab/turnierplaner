import { Component } from '@angular/core';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions } from "@angular/material/card";
import { MatList, MatListItem } from "@angular/material/list";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatAnchor } from "@angular/material/button";

@Component({
  selector: 'app-field-view',
  imports: [MatCard, MatCardHeader, MatCardContent, MatList, MatListItem, MatCardActions, MatFormField, MatInput, MatAnchor],
  templateUrl: './field-view.html',
  styleUrl: './field-view.css',
})
export class FieldView {}

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ExportJsonService } from '@core/services/export-json.service';

@Component({
  selector: 'app-file-input',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './file-input.html',
  styleUrl: './file-input.css',
})
export class FileInput {
  jsonService = inject(ExportJsonService);

  importJsonFile() {
    void this.jsonService.importJsonFromFile();
  }
}

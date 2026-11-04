import { Component, inject } from '@angular/core';
import { ExportJsonService } from '@core/services/export-json.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-file-export',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './file-export.html',
  styleUrl: './file-export.css',
})
export class FileExport {
  private jsonService = inject(ExportJsonService);

  exportJsonFile() {
    void this.jsonService.exportJsonToFile();
  }
}

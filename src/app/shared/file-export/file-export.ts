import { Component, inject } from '@angular/core';
import { ExportJsonService } from '@core/services/export-json.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-file-export',
  imports: [MatButtonModule],
  templateUrl: './file-export.html',
  styleUrl: './file-export.css',
})
export class FileExport {
  private jsonService = inject(ExportJsonService);

  exportJsonFile(anchor: HTMLAnchorElement) {
    const url = this.jsonService.generateJsonFile();
    anchor.href = url;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}

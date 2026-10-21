import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ExportJsonService } from '@core/services/export-json.service';
import { DialogService } from '@core/services/dialog.service';

@Component({
  selector: 'app-file-input',
  imports: [MatButtonModule],
  templateUrl: './file-input.html',
  styleUrl: './file-input.css',
})
export class FileInput {
  jsonService = inject(ExportJsonService);
  dialogService = inject(DialogService);

  onFileSelected(input: HTMLInputElement) {
    if (input.files) {
      const reader = new FileReader();
      for (const file of input.files) {
        reader.onloadend = () => {
          const content = reader.result as string;
          this.dialogService.openImportDialog(content);
        };
        reader.readAsText(file);
      }
      input.files = null;
    }
  }
}

import { Component } from '@angular/core';
import { LiveTable } from '../../components/live-table/live-table';

@Component({
  selector: 'app-table-page',
  imports: [LiveTable],
  template: `
    <div class="app-control-wrapper">
      <app-live-table />
    </div>
  `,
})
export class TablePage {}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileExport } from './file-export';

describe('FileExport', () => {
  let component: FileExport;
  let fixture: ComponentFixture<FileExport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileExport],
    }).compileComponents();

    fixture = TestBed.createComponent(FileExport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

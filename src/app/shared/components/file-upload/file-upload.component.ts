import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() accept = '*/*';
  @Input() maxSizeMB = 10;
  @Input() multiple = false;

  @Output() readonly fileSelected = new EventEmitter<File>();
  @Output() readonly filesSelected = new EventEmitter<File[]>();

  selectedFile: File | null = null;
  uploadedUrl = '';
  errorMessage = '';

  constructor(private readonly fileUploadService: FileUploadService) {}

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.uploadedUrl = '';
    this.errorMessage = '';
  }

  private handleFiles(files: File[]): void {
    if (!files.length) {
      return;
    }

    const file = files[0];
    if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.errorMessage = 'File exceeds max size of ' + this.maxSizeMB + 'MB';
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;

    this.fileUploadService.upload(file).subscribe((url) => {
      this.uploadedUrl = url;
      this.fileSelected.emit(file);
      this.filesSelected.emit([file]);
    });
  }
}

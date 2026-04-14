import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  upload(file: File): Observable<string> {
    const objectUrl = URL.createObjectURL(file);
    return of(objectUrl);
  }
}

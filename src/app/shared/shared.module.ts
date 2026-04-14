import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { BadgeComponent } from './components/badge/badge.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { FilterPipe } from './components/filter.pipe';
import { HasRoleDirective } from './components/has-role.directive';
import { SearchBarComponent } from './components/search-bar/search-bar.component';

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    FileUploadComponent,
    DataTableComponent,
    SearchBarComponent,
    BadgeComponent,
    HasRoleDirective,
    FilterPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule
  ],
  exports: [
    ConfirmDialogComponent,
    FileUploadComponent,
    DataTableComponent,
    SearchBarComponent,
    BadgeComponent,
    HasRoleDirective,
    FilterPipe
  ]
})
export class SharedModule {}

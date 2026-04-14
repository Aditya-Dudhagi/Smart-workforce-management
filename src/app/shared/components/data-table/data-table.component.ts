import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'actions';
  actions?: Array<{ label: string; value: string; icon?: string; color?: 'primary' | 'accent' | 'warn' }>;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges, AfterViewInit {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: unknown[] = [];

  @Output() readonly rowClick = new EventEmitter<unknown>();
  @Output() readonly actionClick = new EventEmitter<{ action: string; row: unknown }>();

  dataSource = new MatTableDataSource<unknown>([]);
  displayedColumnKeys: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.displayedColumnKeys = this.columns.map((column) => column.key);
    }

    if (changes['data']) {
      this.dataSource.data = this.data;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onRowClick(row: unknown): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: string, row: unknown, event: MouseEvent): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }

  getCellValue(row: unknown, key: string): string {
    return String((row as Record<string, unknown>)?.[key] || '');
  }

  getBadgeType(row: unknown, key: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const type = String((row as Record<string, unknown>)?.[key + 'Type'] || 'default').toLowerCase();
    if (type === 'success' || type === 'warning' || type === 'danger' || type === 'info') {
      return type;
    }
    return 'default';
  }
}

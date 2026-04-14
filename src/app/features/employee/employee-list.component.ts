import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil } from 'rxjs';

import { Employee } from '../../core/models/employee.model';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly displayedColumns: string[] = ['avatar', 'name', 'email', 'department', 'role', 'status', 'actions'];
  readonly searchControl = new FormControl('');
  readonly departmentControl = new FormControl('All');

  readonly departments = ['All', 'Engineering', 'HR', 'Finance'];

  readonly dataSource = new MatTableDataSource<Employee>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const initialSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.searchControl.setValue(initialSearch, { emitEvent: false });

    const search$ = this.searchControl.valueChanges.pipe(
      startWith(initialSearch),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => this.employeeService.search(query || ''))
    );

    const dept$ = this.departmentControl.valueChanges.pipe(startWith('All'));

    combineLatest([search$, dept$])
      .pipe(
        map(([employees, department]) => {
          if (!department || department === 'All') {
            return employees;
          }
          return employees.filter((employee) => employee.department === department);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((employees) => {
        this.dataSource.data = employees;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.paginator.pageSize = 10;
    this.dataSource.sort = this.sort;
  }

  isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  isAdminOrHr(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('HR');
  }

  openAdd(): void {
    this.router.navigate(['/employees/new']);
  }

  openProfile(employee: Employee): void {
    this.router.navigate(['/employees', employee.id]);
  }

  openEdit(employee: Employee, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/employees/edit', employee.id]);
  }

  deleteEmployee(employee: Employee, event: MouseEvent): void {
    event.stopPropagation();

    const data: ConfirmDialogData = {
      title: 'Delete Employee',
      message: 'Delete ' + employee.firstName + ' ' + employee.lastName + '?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };

    this.dialog
      .open(ConfirmDialogComponent, { width: '360px', data })
      .afterClosed()
      .pipe(
        switchMap((confirmed) => {
          if (!confirmed) {
            return [];
          }
          return this.employeeService.delete(employee.id);
        }),
        switchMap(() => this.employeeService.getAll()),
        takeUntil(this.destroy$)
      )
      .subscribe((employees) => {
        this.dataSource.data = employees;
      });
  }

  getInitials(employee: Employee): string {
    return (employee.firstName.charAt(0) + employee.lastName.charAt(0)).toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

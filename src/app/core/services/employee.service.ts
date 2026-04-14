import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';

import { Employee } from '../models/employee.model';
import { NotificationType } from '../models/notification.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly storageKey = 'swm_employees';
  private readonly employeesSubject = new BehaviorSubject<Employee[]>([]);
  readonly employees$ = this.employeesSubject.asObservable();

  private initialized = false;

  constructor(private readonly http: HttpClient, private readonly notificationService: NotificationService) {}

  /**
   * Returns all employees.
   */
  getAll(): Observable<Employee[]> {
    return this.ensureInitialized().pipe(
      map(() => this.employeesSubject.value),
      catchError((error) => this.handleError<Employee[]>('getAll', error))
    );
  }

  /**
   * Returns a single employee by id.
   */
  getById(id: string): Observable<Employee> {
    return this.ensureInitialized().pipe(
      map(() => {
        const employee = this.employeesSubject.value.find((item) => item.id === id);
        if (!employee) {
          throw new Error(`Employee not found for id: ${id}`);
        }

        return employee;
      }),
      catchError((error) => this.handleError<Employee>('getById', error))
    );
  }

  /**
   * Adds a new employee and persists changes.
   */
  add(employee: Employee): Observable<Employee> {
    return this.ensureInitialized().pipe(
      map(() => {
        const nextEmployee: Employee = {
          ...employee,
          id: employee.id || uuidv4()
        };
        const updated = [...this.employeesSubject.value, nextEmployee];
        this.persist(updated);
        this.notificationService.add(
          'New employee ' + nextEmployee.firstName + ' ' + nextEmployee.lastName + ' added',
          NotificationType.Success
        );
        return nextEmployee;
      }),
      catchError((error) => this.handleError<Employee>('add', error))
    );
  }

  /**
   * Updates an existing employee.
   */
  update(id: string, employee: Partial<Employee>): Observable<Employee> {
    return this.ensureInitialized().pipe(
      map(() => {
        const current = this.employeesSubject.value;
        const index = current.findIndex((item) => item.id === id);
        if (index < 0) {
          throw new Error(`Employee not found for id: ${id}`);
        }

        const updatedEmployee = { ...current[index], ...employee, id } as Employee;
        const updated = [...current];
        updated[index] = updatedEmployee;
        this.persist(updated);
        return updatedEmployee;
      }),
      catchError((error) => this.handleError<Employee>('update', error))
    );
  }

  /**
   * Deletes an employee by id.
   */
  delete(id: string): Observable<void> {
    return this.ensureInitialized().pipe(
      map(() => {
        const current = this.employeesSubject.value;
        if (!current.some((item) => item.id === id)) {
          throw new Error(`Employee not found for id: ${id}`);
        }

        const updated = current.filter((item) => item.id !== id);
        this.persist(updated);
      }),
      catchError((error) => this.handleError<void>('delete', error))
    );
  }

  /**
   * Searches employees by name, email, department, and skills.
   */
  search(query: string): Observable<Employee[]> {
    const normalized = query.trim().toLowerCase();
    return this.getAll().pipe(
      map((employees) => {
        if (!normalized) {
          return employees;
        }

        return employees.filter((item) => {
          const haystack = [
            item.firstName,
            item.lastName,
            item.email,
            item.department,
            item.skills.join(' ')
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(normalized);
        });
      }),
      catchError((error) => this.handleError<Employee[]>('search', error))
    );
  }

  /**
   * Filters employees by department.
   */
  filterByDepartment(dept: string): Observable<Employee[]> {
    const normalized = dept.trim().toLowerCase();
    return this.getAll().pipe(
      map((employees) => {
        if (!normalized) {
          return employees;
        }

        return employees.filter((item) => item.department.toLowerCase() === normalized);
      }),
      catchError((error) => this.handleError<Employee[]>('filterByDepartment', error))
    );
  }

  private ensureInitialized(): Observable<boolean> {
    if (this.initialized) {
      return of(true);
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.employeesSubject.next(JSON.parse(stored) as Employee[]);
      this.initialized = true;
      return of(true);
    }

    return this.http.get<Employee[]>(`${environment.apiUrl}/employees.json`).pipe(
      tap((employees) => {
        this.persist(employees);
        this.initialized = true;
      }),
      map(() => true),
      catchError((error) => this.handleError<boolean>('ensureInitialized', error))
    );
  }

  private persist(employees: Employee[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(employees));
    this.employeesSubject.next(employees);
  }

  private handleError<T>(context: string, error: unknown): Observable<T> {
    const message = error instanceof Error ? error.message : `${error}`;
    return throwError(() => new Error(`${context} failed: ${message}`));
  }
}

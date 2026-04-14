import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';

import { Attendance } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly storageKey = 'swm_attendance';
  private readonly attendanceSubject = new BehaviorSubject<Attendance[]>([]);
  readonly attendance$ = this.attendanceSubject.asObservable();

  private initialized = false;

  constructor(private readonly http: HttpClient) {}

  /**
   * Creates or replaces attendance for employee/date.
   */
  markAttendance(record: Attendance): Observable<Attendance> {
    return this.ensureInitialized().pipe(
      map(() => {
        const current = this.attendanceSubject.value;
        const index = current.findIndex((item) => item.employeeId === record.employeeId && item.date === record.date);

        const nextRecord: Attendance = {
          ...record,
          id: record.id || uuidv4()
        };

        const updated = [...current];
        if (index >= 0) {
          updated[index] = { ...updated[index], ...nextRecord, id: updated[index].id };
        } else {
          updated.push(nextRecord);
        }

        this.persist(updated);
        return index >= 0 ? updated[index] : nextRecord;
      }),
      catchError((error) => this.handleError<Attendance>('markAttendance', error))
    );
  }

  /**
   * Returns all attendance records for an employee.
   */
  getByEmployee(empId: string): Observable<Attendance[]> {
    return this.ensureInitialized().pipe(
      map(() => this.attendanceSubject.value.filter((item) => item.employeeId === empId)),
      catchError((error) => this.handleError<Attendance[]>('getByEmployee', error))
    );
  }

  /**
   * Returns monthly attendance records for an employee.
   */
  getMonthlyReport(empId: string, month: number, year: number): Observable<Attendance[]> {
    return this.getByEmployee(empId).pipe(
      map((records) =>
        records.filter((item) => {
          const date = new Date(item.date);
          return date.getFullYear() === year && date.getMonth() + 1 === month;
        })
      ),
      catchError((error) => this.handleError<Attendance[]>('getMonthlyReport', error))
    );
  }

  /**
   * Returns today's attendance status for the employee.
   */
  getTodayStatus(empId: string): Observable<Attendance | null> {
    const today = new Date().toISOString().slice(0, 10);
    return this.getByEmployee(empId).pipe(
      map((records) => records.find((item) => item.date === today) ?? null),
      catchError((error) => this.handleError<Attendance | null>('getTodayStatus', error))
    );
  }

  private ensureInitialized(): Observable<boolean> {
    if (this.initialized) {
      return of(true);
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.attendanceSubject.next(JSON.parse(stored) as Attendance[]);
      this.initialized = true;
      return of(true);
    }

    return this.http.get<Attendance[]>(`${environment.apiUrl}/attendance.json`).pipe(
      tap((records) => {
        this.persist(records);
        this.initialized = true;
      }),
      map(() => true),
      catchError((error) => this.handleError<boolean>('ensureInitialized', error))
    );
  }

  private persist(records: Attendance[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(records));
    this.attendanceSubject.next(records);
  }

  private handleError<T>(context: string, error: unknown): Observable<T> {
    const message = error instanceof Error ? error.message : `${error}`;
    return throwError(() => new Error(`${context} failed: ${message}`));
  }
}

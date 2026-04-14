import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';

import { Leave, LeaveStatus, LeaveType } from '../models/leave.model';
import { NotificationType } from '../models/notification.model';
import { EmployeeService } from './employee.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly storageKey = 'swm_leaves';
  private readonly leavesSubject = new BehaviorSubject<Leave[]>([]);
  readonly leaves$ = this.leavesSubject.asObservable();

  private initialized = false;

  constructor(
    private readonly http: HttpClient,
    private readonly employeeService: EmployeeService,
    private readonly notificationService: NotificationService
  ) {}

  /**
   * Applies a leave request with pending status by default.
   */
  applyLeave(leave: Leave): Observable<Leave> {
    return this.ensureInitialized().pipe(
      map(() => {
        const nextLeave: Leave = {
          ...leave,
          id: leave.id || uuidv4(),
          appliedOn: leave.appliedOn || this.todayIso(),
          status: leave.status || LeaveStatus.Pending
        };

        const updated = [...this.leavesSubject.value, nextLeave];
        this.persist(updated);
        return nextLeave;
      }),
      catchError((error) => this.handleError<Leave>('applyLeave', error))
    );
  }

  /**
   * Returns all leave records for an employee.
   */
  getByEmployee(empId: string): Observable<Leave[]> {
    return this.ensureInitialized().pipe(
      map(() => this.leavesSubject.value.filter((item) => item.employeeId === empId)),
      catchError((error) => this.handleError<Leave[]>('getByEmployee', error))
    );
  }

  /**
   * Returns leave requests waiting for review.
   */
  getPending(): Observable<Leave[]> {
    return this.ensureInitialized().pipe(
      map(() => this.leavesSubject.value.filter((item) => item.status === LeaveStatus.Pending)),
      catchError((error) => this.handleError<Leave[]>('getPending', error))
    );
  }

  /**
   * Approves a leave request and stores the reviewer id.
   */
  approve(id: string, reviewerId: string): Observable<Leave> {
    return this.updateStatus(id, LeaveStatus.Approved, reviewerId, 'approve').pipe(
      switchMap((leave) =>
        this.employeeService.getById(leave.employeeId).pipe(
          tap((employee) => {
            this.notificationService.add(
              'Leave approved for ' + employee.firstName + ' ' + employee.lastName,
              NotificationType.Success
            );
          }),
          map(() => leave)
        )
      )
    );
  }

  /**
   * Rejects a leave request and stores the reviewer id.
   */
  reject(id: string, reviewerId: string): Observable<Leave> {
    return this.updateStatus(id, LeaveStatus.Rejected, reviewerId, 'reject').pipe(
      switchMap((leave) =>
        this.employeeService.getById(leave.employeeId).pipe(
          tap((employee) => {
            this.notificationService.add(
              'Leave rejected for ' + employee.firstName + ' ' + employee.lastName,
              NotificationType.Warning
            );
          }),
          map(() => leave)
        )
      )
    );
  }

  /**
   * Calculates leave balance for approved leaves.
   */
  getLeaveBalance(empId: string): Observable<{ casual: number; sick: number; annual: number }> {
    const allocation = {
      casual: 12,
      sick: 8,
      annual: 18
    };

    return this.getByEmployee(empId).pipe(
      map((leaves) =>
        leaves.filter((item) => item.status === LeaveStatus.Approved).reduce(
          (acc, leave) => {
            const consumedDays = this.getDaySpan(leave.startDate, leave.endDate);
            if (leave.type === LeaveType.Casual) {
              acc.casual += consumedDays;
            }
            if (leave.type === LeaveType.Sick) {
              acc.sick += consumedDays;
            }
            if (leave.type === LeaveType.Annual) {
              acc.annual += consumedDays;
            }
            return acc;
          },
          { casual: 0, sick: 0, annual: 0 }
        )
      ),
      map((used) => ({
        casual: Math.max(allocation.casual - used.casual, 0),
        sick: Math.max(allocation.sick - used.sick, 0),
        annual: Math.max(allocation.annual - used.annual, 0)
      })),
      catchError((error) => this.handleError<{ casual: number; sick: number; annual: number }>('getLeaveBalance', error))
    );
  }

  private updateStatus(id: string, status: LeaveStatus, reviewerId: string, context: string): Observable<Leave> {
    return this.ensureInitialized().pipe(
      map(() => {
        const current = this.leavesSubject.value;
        const index = current.findIndex((item) => item.id === id);
        if (index < 0) {
          throw new Error(`Leave not found for id: ${id}`);
        }

        const updatedLeave: Leave = {
          ...current[index],
          status,
          reviewedBy: reviewerId
        };

        const updated = [...current];
        updated[index] = updatedLeave;
        this.persist(updated);
        return updatedLeave;
      }),
      catchError((error) => this.handleError<Leave>(context, error))
    );
  }

  private ensureInitialized(): Observable<boolean> {
    if (this.initialized) {
      return of(true);
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.leavesSubject.next(JSON.parse(stored) as Leave[]);
      this.initialized = true;
      return of(true);
    }

    return this.http.get<Leave[]>(`${environment.apiUrl}/leaves.json`).pipe(
      tap((leaves) => {
        this.persist(leaves);
        this.initialized = true;
      }),
      map(() => true),
      catchError((error) => this.handleError<boolean>('ensureInitialized', error))
    );
  }

  private persist(leaves: Leave[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(leaves));
    this.leavesSubject.next(leaves);
  }

  private getDaySpan(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private handleError<T>(context: string, error: unknown): Observable<T> {
    const message = error instanceof Error ? error.message : `${error}`;
    return throwError(() => new Error(`${context} failed: ${message}`));
  }
}

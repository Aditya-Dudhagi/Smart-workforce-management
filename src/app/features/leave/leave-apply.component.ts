import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LeaveStatus, LeaveType } from '../../core/models/leave.model';
import { NotificationType } from '../../core/models/notification.model';
import { AuthService } from '../../core/services/auth.service';
import { LeaveService } from '../../core/services/leave.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-leave-apply',
  templateUrl: './leave-apply.component.html',
  styleUrls: ['./leave-apply.component.scss']
})
export class LeaveApplyComponent implements OnInit {
  readonly leaveTypes = [LeaveType.Casual, LeaveType.Sick, LeaveType.Annual, LeaveType.Unpaid];

  leaveBalance = {
    casual: 0,
    sick: 0,
    annual: 0
  };

  readonly form = this.formBuilder.group(
    {
      leaveType: [LeaveType.Casual, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(20)]]
    },
    { validators: endDateAfterStartDateValidator() }
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly leaveService: LeaveService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const employeeId = this.authService.getCurrentUser().employeeId;
    this.leaveService.getLeaveBalance(employeeId).subscribe((balance) => {
      this.leaveBalance = balance;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const employeeId = this.authService.getCurrentUser().employeeId;
    const value = this.form.value;

    this.leaveService
      .applyLeave({
        id: '',
        employeeId,
        type: value.leaveType as LeaveType,
        startDate: value.startDate || '',
        endDate: value.endDate || '',
        reason: value.reason || '',
        status: LeaveStatus.Pending,
        appliedOn: '',
        reviewedBy: undefined
      })
      .subscribe(() => {
        this.notificationService.add('Leave applied successfully', NotificationType.Success);
        this.router.navigate(['/leave/list']);
      });
  }
}

function endDateAfterStartDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return { endDateBeforeStartDate: true };
    }

    return null;
  };
}

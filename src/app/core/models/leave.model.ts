export enum LeaveType {
  Casual = 'Casual',
  Sick = 'Sick',
  Annual = 'Annual',
  Unpaid = 'Unpaid'
}

export enum LeaveStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export interface Leave {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
}

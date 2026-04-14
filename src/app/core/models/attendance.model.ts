export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  HalfDay = 'Half-Day',
  Leave = 'Leave'
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
}

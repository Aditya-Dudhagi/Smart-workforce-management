export enum UserRole {
  Admin = 'Admin',
  HR = 'HR',
  Employee = 'Employee'
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  employeeId: string;
}

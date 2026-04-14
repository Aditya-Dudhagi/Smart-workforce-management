export enum EmployeeRole {
  Admin = 'Admin',
  HR = 'HR',
  Employee = 'Employee'
}

export enum EmployeeStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  joiningDate: string;
  skills: string[];
  profilePicture: string;
  documents: string[];
}

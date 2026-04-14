# Smart Workforce Management

Smart Workforce Management is an Angular 13 application for employee operations, leave tracking, and attendance reporting with role-based access.

## How to run

1. `npm install`
2. `ng serve`

Open `http://localhost:4200` in your browser.

## Demo credentials

| Role     | Username        | Password   |
|----------|-----------------|------------|
| Admin    | admin.user      | Admin@123  |
| HR       | hr.user         | Hr@123     |
| Employee | employee.user   | Emp@123    |

## Module architecture summary

- `core/`: Models, services, guards, and interceptors (auth, employees, leave, attendance, notifications)
- `shared/`: Reusable UI building blocks (data table, search bar, badge, confirm dialog, upload, role directive, filter pipe)
- `layout/`: Application shell with sidebar and topbar
- `features/auth/`: Login and unauthorized screens
- `features/dashboard/`: KPI summary cards and analytics widgets
- `features/employee/`: Employee list, profile, and form management
- `features/leave/`: Leave apply, balance, history, and approvals
- `features/attendance/`: Attendance marking and monthly report calendar

## Future scope

- Integrate real backend APIs (Node/.NET/Spring)
- Add SSO (Azure AD/Okta/Google Workspace)
- Enable PWA support for offline attendance workflows
- Add Excel export for attendance and leave reports

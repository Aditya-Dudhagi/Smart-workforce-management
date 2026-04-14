import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatChipInputEvent } from '@angular/material/chips';
import { finalize, of, switchMap } from 'rxjs';

import { Employee, EmployeeRole, EmployeeStatus } from '../../core/models/employee.model';
import { FileUploadService } from '../../core/services/file-upload.service';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly departments = ['Engineering', 'HR', 'Finance'];
  readonly roles = [EmployeeRole.Admin, EmployeeRole.HR, EmployeeRole.Employee];
  readonly statuses = [EmployeeStatus.Active, EmployeeStatus.Inactive];

  readonly skillInputControl = new FormControl('');

  isEditMode = false;
  employeeId = '';
  isSaving = false;
  profilePreview = '';

  readonly employeeForm = this.formBuilder.group({
    personalInfo: this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }),
    jobInfo: this.formBuilder.group({
      department: ['', Validators.required],
      role: [EmployeeRole.Employee, Validators.required],
      joiningDate: ['', Validators.required],
      status: [EmployeeStatus.Active, Validators.required]
    }),
    skills: this.formBuilder.array([]),
    documents: this.formBuilder.array([]),
    profilePicture: ['']
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly fileUploadService: FileUploadService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            return of(null);
          }

          this.isEditMode = true;
          this.employeeId = id;
          return this.employeeService.getById(id);
        })
      )
      .subscribe((employee) => {
        if (employee) {
          this.patchEmployee(employee);
        }
      });
  }

  get personalInfoGroup(): FormGroup {
    return this.employeeForm.get('personalInfo') as FormGroup;
  }

  get jobInfoGroup(): FormGroup {
    return this.employeeForm.get('jobInfo') as FormGroup;
  }

  get skillsArray(): FormArray {
    return this.employeeForm.get('skills') as FormArray;
  }

  get documentsArray(): FormArray {
    return this.employeeForm.get('documents') as FormArray;
  }

  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.skillsArray.push(this.formBuilder.control(value));
    }
    event.chipInput?.clear();
    this.skillInputControl.setValue('');
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  onProfileFileSelected(files: File[]): void {
    const file = files[0];
    if (!file) {
      return;
    }

    this.fileUploadService.upload(file).subscribe((url) => {
      this.profilePreview = url;
      this.employeeForm.get('profilePicture')?.setValue(url);
    });
  }

  onDocumentsSelected(files: File[]): void {
    files.forEach((file) => {
      this.fileUploadService.upload(file).subscribe((url) => {
        this.documentsArray.push(this.formBuilder.control(url));
      });
    });
  }

  submit(): void {
    if (this.employeeForm.invalid || this.isSaving) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const personalInfo = this.personalInfoGroup.value;
    const jobInfo = this.jobInfoGroup.value;

    const payload: Employee = {
      id: this.employeeId,
      firstName: personalInfo.firstName || '',
      lastName: personalInfo.lastName || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      department: jobInfo.department || '',
      role: (jobInfo.role as EmployeeRole) || EmployeeRole.Employee,
      status: (jobInfo.status as EmployeeStatus) || EmployeeStatus.Active,
      joiningDate: jobInfo.joiningDate || '',
      skills: this.skillsArray.controls.map((control) => control.value || '').filter(Boolean),
      profilePicture: this.employeeForm.get('profilePicture')?.value || '',
      documents: this.documentsArray.controls.map((control) => control.value || '').filter(Boolean)
    };

    this.isSaving = true;

    const request$ = this.isEditMode
      ? this.employeeService.update(this.employeeId, payload)
      : this.employeeService.add(payload);

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe(() => {
      this.router.navigate(['/employees']);
    });
  }

  private patchEmployee(employee: Employee): void {
    this.personalInfoGroup.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone
    });

    this.jobInfoGroup.patchValue({
      department: employee.department,
      role: employee.role,
      joiningDate: employee.joiningDate,
      status: employee.status
    });

    this.profilePreview = employee.profilePicture;
    this.employeeForm.get('profilePicture')?.setValue(employee.profilePicture);

    this.skillsArray.clear();
    employee.skills.forEach((skill) => this.skillsArray.push(this.formBuilder.control(skill)));

    this.documentsArray.clear();
    employee.documents.forEach((document) => this.documentsArray.push(this.formBuilder.control(document)));
  }
}

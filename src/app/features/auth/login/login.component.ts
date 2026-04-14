import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  hidePassword = true;
  isLoading$ = false;
  errorMessage = '';

  readonly loginForm = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  submit(): void {
    if (this.loginForm.invalid || this.isLoading$) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const username = this.loginForm.controls['username'].value ?? '';
    const password = this.loginForm.controls['password'].value ?? '';
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

    this.errorMessage = '';
    this.isLoading$ = true;

    this.authService
      .login(username, password)
      .pipe(finalize(() => (this.isLoading$ = false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.errorMessage = 'Invalid credentials';
        }
      });
  }

  get usernameControl() {
    return this.loginForm.controls['username'];
  }

  get passwordControl() {
    return this.loginForm.controls['password'];
  }
}

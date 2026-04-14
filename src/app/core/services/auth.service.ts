import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly usersKey = 'swm_users';
  private readonly authTokenKey = 'auth_token';
  private readonly currentUserKey = 'swm_current_user';

  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.readStoredCurrentUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  /**
   * Authenticates a user against the mock users source and stores session data.
   */
  login(username: string, password: string): Observable<User> {
    return this.getUsers().pipe(
      map((users) => users.find((u) => u.username === username && u.password === password) ?? null),
      map((user) => {
        if (!user) {
          throw new Error('Invalid username or password.');
        }

        localStorage.setItem(this.authTokenKey, this.createToken(user));
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError((error) => this.handleError<User>('login', error))
    );
  }

  /**
   * Clears auth state and redirects the user to the login page.
   */
  logout(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Returns true when a valid session token and user are available.
   */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(this.authTokenKey) && this.currentUserSubject.value);
  }

  /**
   * Checks whether the current user owns the provided role value.
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return Boolean(user && user.role === role);
  }

  /**
   * Returns the logged-in user, otherwise throws when no session is available.
   */
  getCurrentUser(): User {
    const user = this.currentUserSubject.value;
    if (!user) {
      throw new Error('No authenticated user found.');
    }

    return user;
  }

  private getUsers(): Observable<User[]> {
    const storedUsers = localStorage.getItem(this.usersKey);
    if (storedUsers) {
      return of(JSON.parse(storedUsers) as User[]);
    }

    return this.http.get<User[]>(`${environment.apiUrl}/users.json`).pipe(
      tap((users) => localStorage.setItem(this.usersKey, JSON.stringify(users))),
      catchError((error) => this.handleError<User[]>('getUsers', error))
    );
  }

  private readStoredCurrentUser(): User | null {
    const rawUser = localStorage.getItem(this.currentUserKey);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(this.currentUserKey);
      return null;
    }
  }

  private createToken(user: User): string {
    return btoa(`${user.id}:${user.username}:${Date.now()}`);
  }

  private handleError<T>(context: string, error: unknown): Observable<T> {
    const message = error instanceof Error ? error.message : `${error}`;
    return throwError(() => new Error(`${context} failed: ${message}`));
  }
}

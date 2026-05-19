import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'gerant' | 'vendeur';
  last_login_at: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const stored = localStorage.getItem('cd_user');
      if (stored) {
        try { this.currentUserSubject.next(JSON.parse(stored)); }
        catch { this.clearStorage(); }
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => {
        if (this.isBrowser) {
          localStorage.setItem('cd_token', res.token);
          localStorage.setItem('cd_user', JSON.stringify(res.user));
        }
        this.currentUserSubject.next(res.user);
      }));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      complete: () => this.clearAndRedirect(),
      error:    () => this.clearAndRedirect(),
    });
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('cd_token');
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('cd_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private clearStorage(): void {
    if (this.isBrowser) {
      localStorage.removeItem('cd_token');
      localStorage.removeItem('cd_user');
    }
    this.currentUserSubject.next(null);
  }

  private clearAndRedirect(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }
}
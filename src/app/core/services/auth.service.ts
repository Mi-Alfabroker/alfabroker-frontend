import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthResponse } from '../store/auth/auth.types';
import * as AuthActions from '../store/auth/auth.actions';
import * as AuthSelectors from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:4000/api/v1/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store
  ) {
    this.checkAuthState();
  }

  private checkAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = this.decodeToken(token);
        
        if (this.isTokenExpired(tokenData)) {
          this.clearAuthState();
          return;
        }

        this.store.dispatch(AuthActions.loginSuccess({
          token,
          user: {
            id: tokenData.id,
            email: tokenData.email,
            type: tokenData.type,
            nombre: tokenData.nombre || tokenData.email.split('@')[0],
            estado: tokenData.estado || 'active'
          }
        }));
      } catch (error) {
        this.clearAuthState();
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      return null;
    }
  }

  private isTokenExpired(tokenData: any): boolean {
    if (!tokenData || !tokenData.exp) return true;
    const expirationDate = new Date(tokenData.exp * 1000);
    return expirationDate <= new Date();
  }

  private clearAuthState(): void {
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.clear();
    
    // Dispatch logout action
    this.store.dispatch(AuthActions.logout());
    
    // Forzar la navegación al login
    setTimeout(() => {
      this.router.navigate(['/'], { replaceUrl: true });
    }, 100);
    
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/signin`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.data.token);
          
          this.store.dispatch(AuthActions.loginSuccess({
            token: response.data.token,
            user: response.data.user
          }));
        })
      );
  }

  logout(): void {
    this.clearAuthState();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }

    try {
      const tokenData = this.decodeToken(token);
      const isExpired = this.isTokenExpired(tokenData);
      
      if (isExpired) {
        this.clearAuthState();
        return false;
      }
      
      return true;
    } catch (error) {
      this.clearAuthState();
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './alumno.service';

export interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
}

const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'auth_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  autenticado = signal<boolean>(this.hasToken());
  usuario = signal<string>(localStorage.getItem(USERNAME_KEY) ?? '');

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { username, password });
  }

  guardarSesion(resp: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, resp.token);
    localStorage.setItem(USERNAME_KEY, resp.username);
    this.autenticado.set(true);
    this.usuario.set(resp.username);
  }

  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this.autenticado.set(false);
    this.usuario.set('');
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
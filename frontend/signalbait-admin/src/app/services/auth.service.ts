import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";

interface UserResponse {
  username: string;
  is_authenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000/api';

  // Authentication state
  isLoggedIn = signal(false);
  username = signal('');

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{ message: string; username: string }>(
      `${this.apiUrl}/login/`,
      {
        username: username,
        password: password
      },
      {
        withCredentials: true
      }
    );
  }

  getCurrentUser() {
    return this.http.get<UserResponse>(
      `${this.apiUrl}/me/`,
      {
        withCredentials: true
      }
    );
  }

  logout() {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout/`,
      {},
      {
        withCredentials: true
      }
    );
  }

  setAuthenticated(username: string) {
    this.isLoggedIn.set(true);
    this.username.set(username);
  }

  clearAuthentication() {
    this.isLoggedIn.set(false);
    this.username.set('');
  }

  checkSession() {
    return this.http.get<{
        username: string;
        is_authenticated: boolean;
    }>(
        `${this.apiUrl}/me/`,
        {
        withCredentials: true
        }
    );
    }
}
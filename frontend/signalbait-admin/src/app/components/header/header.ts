import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {

  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.authService.setAuthenticated(response.username);
      },
      error: () => {
        this.authService.clearAuthentication();
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearAuthentication();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
}
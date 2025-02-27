import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="navbar">
      <div class="navbar-title">Car Management System</div>
      <div class="navbar-links" *ngIf="isLoggedIn()">
        <a [routerLink]="['/cars']" class="nav-link">Cars</a>
        <a *ngIf="isAdmin()" [routerLink]="['/users']" class="nav-link">Users</a>
      </div>
      <div class="navbar-user" *ngIf="isLoggedIn()">
        <span class="user-role" [ngClass]="{'admin-role': isAdmin(), 'user-role': !isAdmin()}">
          {{ isAdmin() ? 'Admin' : 'User' }}
        </span>
      </div>
      <div class="navbar-actions">
        <button *ngIf="!isLoggedIn()" (click)="navigateToLogin()" class="login-btn">Login</button>
        <button *ngIf="isLoggedIn()" (click)="logout()" class="logout-btn">Logout</button>
      </div>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #333;
      color: white;
      padding: 10px 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .navbar-title {
      font-size: 1.2rem;
      font-weight: bold;
    }
    .navbar-links {
      display: flex;
      gap: 20px;
    }
    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .navbar-user {
      display: flex;
      align-items: center;
    }
    .user-role {
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .admin-role {
      background-color: #28a745;
      color: white;
    }
    .user-role {
      background-color: #007bff;
      color: white;
    }
    .navbar-actions {
      display: flex;
      gap: 10px;
      margin-left: 15px;
    }
    .login-btn, .logout-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .login-btn {
      background-color: #4CAF50;
      color: white;
    }
    .logout-btn {
      background-color: #f44336;
      color: white;
    }
    .login-btn:hover, .logout-btn:hover {
      opacity: 0.9;
    }
  `],
})
export class AppComponent {
  title = 'car-management';
  
  constructor(private authService: AuthService, private router: Router) {}
  
  isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

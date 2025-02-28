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
      <div class="navbar-left">
        
        <div class="navbar-subtitle">Car Management Warehouse</div>
      </div>
      <div class="navbar-links" *ngIf="isLoggedIn()">
        <a [routerLink]="['/cars']" class="nav-link">Cars</a>
        <a *ngIf="isAdmin()" [routerLink]="['/users']" class="nav-link">Users</a>
      </div>
      <div class="navbar-user" *ngIf="isLoggedIn()">
        <span class="user-role" [ngClass]="{'admin-role': isAdmin(), 'user-role': !isAdmin()}">
          {{ isAdmin() ? 'Administrator' : 'User' }}
        </span>
        <div class="user-permissions">
          <ng-container *ngIf="isAdmin()">
            <span>Full access</span>
          </ng-container>
          <ng-container *ngIf="isUser()">
            <span>Limited access</span>
          </ng-container>
        </div>
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
      background-color: #343a40;
      color: white;
      padding: 15px 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .navbar-left {
      display: flex;
      flex-direction: column;
    }
    .navbar-title {
      font-size: 1.2rem;
      font-weight: bold;
    }
    .navbar-subtitle {
      font-size: 1.8rem;
      font-weight: 600;
      margin-top: 5px;
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
      flex-direction: column;
      align-items: flex-end;
    }
    .user-role {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-weight: 500;
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
    .user-permissions {
      margin-top: 0.25rem;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.8);
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
    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        padding: 10px;
      }
      .navbar-left, .navbar-links, .navbar-user, .navbar-actions {
        margin: 5px 0;
        width: 100%;
        justify-content: center;
      }
      .navbar-user {
        align-items: center;
      }
    }
  `],
})
export class AppComponent {
  title = 'car-management';
  
  constructor(private authService: AuthService, private router: Router) {}
  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  isUser(): boolean {
    return this.authService.isUser();
  }
  
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

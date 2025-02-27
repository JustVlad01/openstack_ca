import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  successMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Failed to load users. Please try again. ${err.status === 403 ? 'Admin access required.' : ''}`;
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user._id !== id);
          this.error = '';
          this.successMessage = 'User deleted successfully';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Failed to delete user. Please try again. ${err.status === 403 ? 'Admin access required.' : ''}`;
          this.successMessage = '';
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  refreshUsers(): void {
    this.successMessage = '';
    this.loadUsers();
  }
}

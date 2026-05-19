import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email        = '';
  password     = '';
  showPassword = false;
  loading      = false;
  errorMsg     = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  onSubmit(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        const errors = err.error?.errors;
        this.errorMsg = errors
          ? Object.values(errors).flat().join(' ')
          : err.error?.message || 'Erreur de connexion.';
        this.loading = false;
      }
    });
  }
}
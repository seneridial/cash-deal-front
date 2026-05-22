import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class ProfilComponent {
  successMsg = '';
  errorMsg   = '';
  loading    = false;

  form = {
    current_password:      '',
    new_password:          '',
    new_password_confirmation: ''
  };

  constructor(
    private http: HttpClient,
    public auth: AuthService
  ) {}

  get currentUser() {
    return this.auth.getCurrentUser();
  }

  save(): void {
    this.errorMsg   = '';
    this.successMsg = '';
    this.loading    = true;

    if (this.form.new_password !== this.form.new_password_confirmation) {
      this.errorMsg = 'Les mots de passe ne correspondent pas.';
      this.loading  = false;
      return;
    }

    if (this.form.new_password.length < 8) {
      this.errorMsg = 'Le mot de passe doit contenir au moins 8 caractères.';
      this.loading  = false;
      return;
    }

    this.http.put(`${environment.apiUrl}/api/profil/password`, this.form).subscribe({
      next: () => {
        this.successMsg = 'Mot de passe modifié avec succès !';
        this.loading    = false;
        this.form = {
          current_password:          '',
          new_password:              '',
          new_password_confirmation: ''
        };
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Erreur.';
        this.loading  = false;
      }
    });
  }
}
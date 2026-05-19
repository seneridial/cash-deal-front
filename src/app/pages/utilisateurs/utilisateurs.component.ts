import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class UtilisateursComponent implements OnInit {
  users: any[]  = [];
  loading       = true;
  showForm      = false;
  editingId: number | null = null;
  successMsg    = '';
  errorMsg      = '';
  private url   = `${environment.apiUrl}/api/users`;

  form: any = {
    name: '', email: '', password: '',
    role: 'vendeur', is_active: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.http.get<any[]>(this.url).subscribe({
      next: (data: any) => { this.users = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(user?: any): void {
    this.showForm   = true;
    this.errorMsg   = '';
    this.successMsg = '';
    if (user) {
      this.editingId = user.id;
      this.form = {
        name:      user.name,
        email:     user.email,
        password:  '',
        role:      user.role,
        is_active: user.is_active
      };
    } else {
      this.editingId = null;
      this.form = { name: '', email: '', password: '', role: 'vendeur', is_active: true };
    }
  }

  closeForm(): void { this.showForm = false; }

  save(): void {
    if (this.editingId) {
      this.http.put(`${this.url}/${this.editingId}`, this.form).subscribe({
        next: () => {
          this.successMsg = 'Utilisateur modifié !';
          this.showForm   = false;
          this.loadUsers();
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
      });
    } else {
      this.http.post(this.url, this.form).subscribe({
        next: () => {
          this.successMsg = 'Utilisateur créé !';
          this.showForm   = false;
          this.loadUsers();
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
      });
    }
  }

  toggleActif(user: any): void {
    this.http.put(`${this.url}/${user.id}`, { is_active: !user.is_active }).subscribe({
      next: () => this.loadUsers(),
      error: () => alert('Erreur.')
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.http.delete(`${this.url}/${id}`).subscribe({
      next: () => this.loadUsers(),
      error: (err: any) => alert(err.error?.message || 'Erreur.')
    });
  }

  getRoleBadge(role: string): string {
    const map: any = {
      'admin':   'badge-red',
      'gerant':  'badge-blue',
      'vendeur': 'badge-green'
    };
    return map[role] || 'badge-amber';
  }

  getInitiales(name: string): string {
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getNbActifs(): number {
    return this.users.filter((u: any) => u.is_active).length;
  }

  getNbRole(role: string): number {
    return this.users.filter((u: any) => u.role === role).length;
  }
}
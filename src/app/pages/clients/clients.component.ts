import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class ClientsComponent implements OnInit {
  clients: any[]  = [];
  loading         = true;
  showForm        = false;
  searchTerm      = '';
  typeFilter      = '';
  successMsg      = '';
  errorMsg        = '';
  editingId: number | null = null;

  form: any = {
    nom: '', telephone: '', telephone2: '',
    email: '', adresse: '', ville: '',
    type: 'client', entreprise: '',
    notes: '', is_vip: false
  };

  constructor(
    private clientService: ClientService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    const filters: any = {};
    if (this.searchTerm) filters['search'] = this.searchTerm;
    if (this.typeFilter) filters['type']   = this.typeFilter;

    this.clientService.getAll(filters).subscribe({
      next: (r: any) => { this.clients = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(client?: any): void {
    this.showForm   = true;
    this.errorMsg   = '';
    this.successMsg = '';
    if (client) {
      this.editingId = client.id;
      this.form = { ...client };
    } else {
      this.editingId = null;
      this.form = {
        nom: '', telephone: '', telephone2: '',
        email: '', adresse: '', ville: '',
        type: 'client', entreprise: '',
        notes: '', is_vip: false
      };
    }
  }

  closeForm(): void { this.showForm = false; }

  save(): void {
    if (this.editingId) {
      this.clientService.update(this.editingId, this.form).subscribe({
        next: () => {
          this.successMsg = 'Client modifié !';
          this.showForm   = false;
          this.loadClients();
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
      });
    } else {
      this.clientService.create(this.form).subscribe({
        next: () => {
          this.successMsg = 'Client ajouté !';
          this.showForm   = false;
          this.loadClients();
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce client ?')) return;
    this.clientService.delete(id).subscribe({
      next: () => this.loadClients(),
      error: (err: any) => alert(err.error?.message || 'Erreur.')
    });
  }

  getInitiales(nom: string): string {
    return nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarColor(type: string): string {
    return type === 'fournisseur' ? '#FEF3C7' : '#E6F1FB';
  }

  getAvatarTextColor(type: string): string {
    return type === 'fournisseur' ? '#92400E' : '#0C447C';
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { HttpClient } from '@angular/common/http';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class ContactComponent implements OnInit {
  messages: any[] = [];
  clients: any[]  = [];
  loading         = true;
  showForm        = false;
  showDetail: any = null;
  reponse         = '';
  successMsg      = '';
  errorMsg        = '';
  private url     = `${environment.apiUrl}/api/messages`;

  form: any = {
    client_id: null,
    nom:       '',
    email:     '',
    telephone: '',
    sujet:     '',
    message:   ''
  };

  constructor(
    private http: HttpClient,
    private clientService: ClientService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
    this.clientService.getAll({ type: 'client' }).subscribe({
      next: (r: any) => this.clients = r.data,
      error: () => {}
    });
  }

  loadMessages(): void {
    this.loading = true;
    this.http.get<any>(this.url).subscribe({
      next: (r: any) => { this.messages = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(): void {
    this.showForm   = true;
    this.errorMsg   = '';
    this.successMsg = '';
    this.form = {
      client_id: null, nom: '', email: '',
      telephone: '', sujet: '', message: ''
    };
  }

  onClientChange(): void {
    const client = this.clients.find((c: any) => c.id == this.form.client_id);
    if (client) {
      this.form.nom       = client.nom;
      this.form.email     = client.email || '';
      this.form.telephone = client.telephone || '';
    }
  }

  envoyer(): void {
    this.http.post<any>(this.url, this.form).subscribe({
      next: () => {
        this.successMsg = 'Message envoyé !';
        this.showForm   = false;
        this.loadMessages();
      },
      error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
    });
  }

  voir(message: any): void {
    this.showDetail = message;
    this.reponse    = message.reponse || '';
    if (message.statut === 'non_lu') {
      this.http.put(`${this.url}/${message.id}/lire`, {}).subscribe({
        next: () => this.loadMessages(),
        error: () => {}
      });
    }
  }

  repondreMessage(): void {
    this.http.put(`${this.url}/${this.showDetail.id}/repondre`, { reponse: this.reponse }).subscribe({
      next: () => {
        this.successMsg = 'Réponse envoyée !';
        this.showDetail = null;
        this.loadMessages();
      },
      error: () => {}
    });
  }

  getNonLus(): number {
    return this.messages.filter((m: any) => m.statut === 'non_lu').length;
  }

  getRepondus(): number {
    return this.messages.filter((m: any) => m.statut === 'repondu').length;
  }

  getBadge(statut: string): string {
    const map: any = {
      'non_lu':  'badge-red',
      'lu':      'badge-amber',
      'repondu': 'badge-green'
    };
    return map[statut] || 'badge-amber';
  }

  getStatutLabel(statut: string): string {
    const map: any = {
      'non_lu':  'Non lu',
      'lu':      'Lu',
      'repondu': 'Répondu'
    };
    return map[statut] || statut;
  }
}
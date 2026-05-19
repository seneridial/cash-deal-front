import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-factures',
  templateUrl: './factures.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class FacturesComponent implements OnInit {
  factures: any[] = [];
  loading         = true;
  private url     = `${environment.apiUrl}/api/factures`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    this.http.get<any>(this.url).subscribe({
      next: (r: any) => { this.factures = r.data || r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  downloadPdf(facture: any): void {
    const token = localStorage.getItem('cd_token');
    const url   = `${environment.apiUrl}/api/factures/${facture.id}/pdf`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const link    = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = `facture-${facture.numero}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch(() => alert('Erreur lors du téléchargement du PDF'));
  }

  getBadge(statut: string): string {
    const map: any = {
      'payee':     'badge-green',
      'emise':     'badge-blue',
      'brouillon': 'badge-amber',
      'annulee':   'badge-red'
    };
    return map[statut] || 'badge-amber';
  }

  getTypeBadge(type: string): string {
    return type === 'devis' ? 'badge-blue' : type === 'avoir' ? 'badge-amber' : 'badge-green';
  }

  format(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(val || 0)) + ' F';
  }
}
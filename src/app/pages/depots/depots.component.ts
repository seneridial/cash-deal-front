import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { HttpClient } from '@angular/common/http';
import { ProduitService } from '../../services/produit.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-depots',
  templateUrl: './depots.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class DepotsComponent implements OnInit {
  mouvements: any[] = [];
  produits: any[]   = [];
  etats: any[]      = [];
  stats: any        = {};
  loading           = true;
  showForm          = false;
  activeTab         = 'mouvements';
  successMsg        = '';
  errorMsg          = '';
  typeFilter        = '';
  private url       = `${environment.apiUrl}/api/mouvements`;

  form: any = {
    produit_id:     null,
    type:           'entree',
    quantite:       1,
    prix_unitaire:  0,
    origine:        '',
    motif:          '',
    date_mouvement: new Date().toISOString().split('T')[0],
    notes:          ''
  };

  constructor(
    private http: HttpClient,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadMouvements();
    this.loadEtats();
    this.produitService.getAll().subscribe({
      next: (r: any) => this.produits = r.data,
      error: () => {}
    });
  }

  loadStats(): void {
    this.http.get<any>(`${this.url}/stats`).subscribe({
      next: (s: any) => this.stats = s,
      error: () => {}
    });
  }

  loadMouvements(): void {
    this.loading = true;
    const params: any = {};
    if (this.typeFilter) params['type'] = this.typeFilter;

    this.http.get<any>(this.url, { params }).subscribe({
      next: (r: any) => { this.mouvements = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadEtats(): void {
    this.http.get<any>(`${this.url}/etats`).subscribe({
      next: (d: any) => this.etats = d,
      error: () => {}
    });
  }

  openForm(): void {
    this.showForm   = true;
    this.errorMsg   = '';
    this.successMsg = '';
    this.form = {
      produit_id: null, type: 'entree',
      quantite: 1, prix_unitaire: 0,
      origine: '', motif: '',
      date_mouvement: new Date().toISOString().split('T')[0],
      notes: ''
    };
  }

  soumettre(): void {
    this.http.post<any>(this.url, this.form).subscribe({
      next: () => {
        this.successMsg = 'Mouvement enregistré !';
        this.showForm   = false;
        this.loadMouvements();
        this.loadStats();
        this.loadEtats();
      },
      error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
    });
  }

  exportPdf(): void {
    const token = localStorage.getItem('cd_token');
    fetch(`${environment.apiUrl}/api/mouvements/pdf`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/pdf' }
    })
    .then(r => r.blob())
    .then(blob => {
      const link    = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = `depots-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    });
  }

  exportExcel(): void {
    if (!this.etats.length) return;
    const headers = ['Produit','Référence','Catégorie','Vendus','Rachetés','Restants','CA Ventes','Coût Achats','Bénéfice','Perte'];
    const rows = this.etats.map((e: any) => [
      e.produit, e.reference, e.categorie,
      e.vendus, e.rachetes, e.restants,
      e.ca_ventes, e.cout_achats, e.benefice, e.perte
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map((v: any) => `"${v}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `etats-produits-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  format(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(val || 0)) + ' F';
  }
}
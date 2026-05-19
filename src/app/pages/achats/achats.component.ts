import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { ClientService } from '../../services/client.service';
import { ProduitService } from '../../services/produit.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-achats',
  templateUrl: './achats.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class AchatsComponent implements OnInit {
  achats: any[]       = [];
  fournisseurs: any[] = [];
  produits: any[]     = [];
  loading             = false;
  showForm            = false;
  successMsg          = '';
  errorMsg            = '';
  total               = 0;
  private url         = `${environment.apiUrl}/api/achats`;

  form: any = {
    fournisseur_id: null,
    date_achat:     new Date().toISOString().split('T')[0],
    mode_paiement:  'especes',
    notes:          '',
    details:        [{ produit_id: null, quantite: 1, prix_unitaire: 0 }]
  };

  constructor(
    private clientService: ClientService,
    private produitService: ProduitService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAchats();
    this.clientService.getAll({ type: 'fournisseur' }).subscribe({
      next: (r: any) => this.fournisseurs = r.data,
      error: () => {}
    });
    this.produitService.getAll().subscribe({
      next: (r: any) => this.produits = r.data,
      error: () => {}
    });
  }

  loadAchats(): void {
    this.loading = true;
    this.http.get<any>(this.url).subscribe({
      next: (r: any) => { this.achats = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addLigne(): void {
    this.form.details.push({ produit_id: null, quantite: 1, prix_unitaire: 0 });
    this.recalculer();
  }

  removeLigne(index: number): void {
    if (this.form.details.length > 1) {
      this.form.details.splice(index, 1);
      this.recalculer();
    }
  }

  // Appelé à chaque changement de quantité ou prix
  recalculer(): void {
    this.total = this.form.details.reduce(
      (sum: number, d: any) => {
        const qte  = parseFloat(d.quantite)      || 0;
        const prix = parseFloat(d.prix_unitaire) || 0;
        return sum + (qte * prix);
      }, 0
    );
    this.cdr.detectChanges();
  }

  soumettre(): void {
    this.recalculer();
    this.loading  = true;
    this.errorMsg = '';

    const payload = {
      ...this.form,
      montant_paye: this.total,
      details: this.form.details
        .filter((d: any) => d.produit_id !== null)
        .map((d: any) => ({
          produit_id:    Number(d.produit_id),
          quantite:      Number(d.quantite),
          prix_unitaire: parseFloat(d.prix_unitaire) || 0
        }))
    };

    this.http.post<any>(this.url, payload).subscribe({
      next: () => {
        this.successMsg = 'Achat enregistré !';
        this.showForm   = false;
        this.loading    = false;
        this.resetForm();
        this.loadAchats();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Erreur.';
        this.loading  = false;
      }
    });
  }

  resetForm(): void {
    this.total = 0;
    this.form  = {
      fournisseur_id: null,
      date_achat:     new Date().toISOString().split('T')[0],
      mode_paiement:  'especes',
      notes:          '',
      details:        [{ produit_id: null, quantite: 1, prix_unitaire: 0 }]
    };
  }

  format(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(val || 0)) + ' F';
  }

  getBadge(statut: string): string {
    const map: any = { 'recu': 'badge-green', 'en_attente': 'badge-amber', 'annule': 'badge-red' };
    return map[statut] || 'badge-amber';
  }
}
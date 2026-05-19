import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { VenteService } from '../../services/vente.service';
import { ProduitService } from '../../services/produit.service';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ventes',
  templateUrl: './ventes.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class VentesComponent implements OnInit {
  ventes: any[]   = [];
  produits: any[] = [];
  clients: any[]  = [];
  loading         = false;
  showForm        = false;
  successMsg      = '';
  errorMsg        = '';

  form: any = {
    client_id:     null,
    date_vente:    new Date().toISOString().split('T')[0],
    mode_paiement: 'especes',
    remise:        0,
    notes:         '',
    details:       [{ produit_id: null, quantite: 1, prix_unitaire: 0 }]
  };

  constructor(
    private venteService: VenteService,
    private produitService: ProduitService,
    private clientService: ClientService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadVentes();
    this.produitService.getAll({ statut: 'actif' }).subscribe({
      next: (r: any) => this.produits = r.data,
      error: () => {}
    });
    this.clientService.getAll({ type: 'client' }).subscribe({
      next: (r: any) => this.clients = r.data,
      error: () => {}
    });
  }

  loadVentes(): void {
    this.loading = true;
    this.venteService.getAll().subscribe({
      next: (r: any) => { this.ventes = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onProduitChange(index: number): void {
    const ligne   = this.form.details[index];
    const produit = this.produits.find((p: any) => p.id == ligne.produit_id);
    if (produit) { ligne.prix_unitaire = produit.prix_vente; }
  }

  addLigne(): void {
    this.form.details.push({ produit_id: null, quantite: 1, prix_unitaire: 0 });
  }

  removeLigne(index: number): void {
    if (this.form.details.length > 1) {
      this.form.details.splice(index, 1);
    }
  }

  get totalHT(): number {
    return this.form.details.reduce(
      (sum: number, d: any) => sum + (d.quantite * d.prix_unitaire), 0
    );
  }

  get totalFinal(): number {
    return this.totalHT - (this.form.remise || 0);
  }

  soumettre(): void {
    this.loading  = true;
    this.errorMsg = '';

    const payload = {
      ...this.form,
      montant_paye: this.totalFinal,
      details: this.form.details.filter((d: any) => d.produit_id !== null)
    };

    this.venteService.create(payload).subscribe({
      next: () => {
        this.successMsg = 'Vente enregistrée avec succès !';
        this.showForm   = false;
        this.loading    = false;
        this.resetForm();
        this.loadVentes();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Erreur lors de l\'enregistrement.';
        this.loading  = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      client_id:     null,
      date_vente:    new Date().toISOString().split('T')[0],
      mode_paiement: 'especes',
      remise:        0,
      notes:         '',
      details:       [{ produit_id: null, quantite: 1, prix_unitaire: 0 }]
    };
  }

  getBadge(statut: string): string {
    const map: any = {
      'paye':       'badge-green',
      'en_attente': 'badge-amber',
      'partiel':    'badge-blue',
      'annule':     'badge-red'
    };
    return map[statut] || 'badge-amber';
  }

  format(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(val || 0)) + ' F';
  }
}
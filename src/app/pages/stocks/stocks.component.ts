import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { ProduitService } from '../../services/produit.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent]
})
export class StocksComponent implements OnInit {
  produits: any[] = [];
  stats: any      = {};
  loading         = true;
  searchTerm      = '';
  statutFilter    = '';
  showForm        = false;
  errorMsg        = '';
  successMsg      = '';
  editingId: number | null = null;

  form: any = {
    reference: '', nom: '', categorie_id: '',
    prix_achat: 0, prix_vente: 0, prix_revient: 0,
    quantite: 0, seuil_alerte: 5, unite: 'pièce',
    statut: 'actif', notes: ''
  };

  constructor(
    private produitService: ProduitService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadProduits();
  }

  loadStats(): void {
    this.produitService.getStats().subscribe({
      next: (s: any) => this.stats = s,
      error: () => {}
    });
  }

  loadProduits(): void {
    this.loading = true;
    const filters: any = {};
    if (this.searchTerm)   filters['search']      = this.searchTerm;
    if (this.statutFilter) filters['statut_stock'] = this.statutFilter;

    this.produitService.getAll(filters).subscribe({
      next: (res: any) => { this.produits = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(produit?: any): void {
    this.showForm   = true;
    this.errorMsg   = '';
    this.successMsg = '';
    if (produit) {
      this.editingId = produit.id;
      this.form = { ...produit };
    } else {
      this.editingId = null;
      this.form = {
        reference: '', nom: '', categorie_id: '',
        prix_achat: 0, prix_vente: 0, prix_revient: 0,
        quantite: 0, seuil_alerte: 5, unite: 'pièce',
        statut: 'actif', notes: ''
      };
    }
  }

  closeForm(): void { this.showForm = false; }

  save(): void {
    if (this.editingId) {
      this.produitService.update(this.editingId, this.form).subscribe({
        next: () => {
          this.successMsg = 'Produit modifié !';
          this.showForm = false;
          this.loadProduits();
          this.loadStats();
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
      });
    } else {
      this.produitService.create(this.form).subscribe({
        next: () => {
          this.successMsg = 'Produit ajouté !';
          this.showForm = false;
          this.loadProduits();
          this.loadStats();
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce produit ?')) return;
    this.produitService.delete(id).subscribe({
      next: () => { this.loadProduits(); this.loadStats(); },
      error: (err: any) => { alert(err.error?.message || 'Erreur suppression.'); }
    });
  }

  exportExcel(): void {
    this.produitService.getAll({ per_page: 1000 }).subscribe({
      next: (res: any) => {
        const data = res.data.map((p: any) => ({
          'Référence':         p.reference,
          'Nom':               p.nom,
          'Catégorie':         p.categorie?.nom || '',
          'Prix achat (F)':    p.prix_achat,
          'Prix vente (F)':    p.prix_vente,
          'Prix revient (F)':  p.prix_revient,
          'Quantité':          p.quantite,
          'Seuil alerte':      p.seuil_alerte,
          'Unité':             p.unite,
          'Statut stock':      p.quantite === 0 ? 'Rupture' : p.quantite <= p.seuil_alerte ? 'Stock faible' : 'En stock',
          'Bénéfice unitaire': Number(p.prix_vente) - Number(p.prix_revient),
          'Valeur stock':      Number(p.prix_revient) * p.quantite,
          'Notes':             p.notes || '',
        }));

        // Générer CSV compatible Excel
        const headers  = Object.keys(data[0]);
        const csvRows  = [
          headers.join(';'),
          ...data.map((row: any) =>
            headers.map((h: string) => `"${row[h] ?? ''}"`).join(';')
          )
        ];

        // Ajouter résumé
        csvRows.push('');
        csvRows.push('RÉSUMÉ');
        csvRows.push(`"Total produits";"${this.stats.total || 0}"`);
        csvRows.push(`"En stock";"${this.stats.en_stock || 0}"`);
        csvRows.push(`"Stock faible";"${this.stats.stock_faible || 0}"`);
        csvRows.push(`"Rupture";"${this.stats.rupture || 0}"`);
        csvRows.push(`"Date export";"${new Date().toLocaleDateString('fr-FR')}"`);

        const csvContent = '\uFEFF' + csvRows.join('\n');
        const blob       = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url        = URL.createObjectURL(blob);
        const link       = document.createElement('a');
        const date       = new Date().toISOString().split('T')[0];

        link.href     = url;
        link.download = `stocks-cash-deal-${date}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => alert('Erreur lors de l\'export')
    });
  }

  getBadge(p: any): string {
    if (p.quantite === 0) return 'badge-red';
    if (p.quantite <= p.seuil_alerte) return 'badge-amber';
    return 'badge-green';
  }

  getStatutLabel(p: any): string {
    if (p.quantite === 0) return 'Rupture';
    if (p.quantite <= p.seuil_alerte) return 'Stock faible';
    return 'En stock';
  }
}
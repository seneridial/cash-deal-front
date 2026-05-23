import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { ProduitService } from '../../services/produit.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

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
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  form: any = {
    reference: '', nom: '', categorie_id: '',
    origine: '',
    prix_achat: 0, prix_vente: 0, prix_revient: 0,
    quantite: 0, seuil_alerte: 5, unite: 'pièce',
    statut: 'actif', notes: ''
  };

  constructor(
    private produitService: ProduitService,
    public auth: AuthService,
    private http: HttpClient
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
    this.showForm    = true;
    this.errorMsg    = '';
    this.successMsg  = '';
    this.selectedFile = null;
    this.previewUrl  = null;

    if (produit) {
      this.editingId = produit.id;
      this.form = { ...produit };
      this.previewUrl = produit.photo_url || null;
    } else {
      this.editingId = null;
      this.form = {
        reference: '', nom: '', categorie_id: '',
        origine: '',
        prix_achat: 0, prix_vente: 0, prix_revient: 0,
        quantite: 0, seuil_alerte: 5, unite: 'pièce',
        statut: 'actif', notes: ''
      };
    }
  }

  closeForm(): void {
    this.showForm     = false;
    this.selectedFile = null;
    this.previewUrl   = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => { this.previewUrl = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    const formData = new FormData();

    // Ajouter tous les champs du formulaire
    Object.keys(this.form).forEach(key => {
      if (this.form[key] !== null && this.form[key] !== undefined) {
        formData.append(key, this.form[key]);
      }
    });

    // Ajouter la photo si sélectionnée
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    const url = `${environment.apiUrl}/api/produits`;

    if (this.editingId) {
      formData.append('_method', 'PUT');
      this.http.post(`${url}/${this.editingId}`, formData).subscribe({
        next: () => {
          this.successMsg = 'Produit modifié !';
          this.showForm = false;
          this.loadProduits();
          this.loadStats();
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Erreur.'; }
      });
    } else {
      this.http.post(url, formData).subscribe({
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
    next: () => {
      this.successMsg = 'Produit supprimé !';
      this.loadProduits();
      this.loadStats();
    },
    error: (err: any) => {
      this.errorMsg = err.error?.message || 'Erreur lors de la suppression.';
    }
  });
}

  exportExcel(): void {
    this.produitService.getAll({ per_page: 1000 }).subscribe({
      next: (res: any) => {
        const data = res.data.map((p: any) => ({
          'Référence':         p.reference,
          'Nom':               p.nom,
          'Catégorie':         p.categorie?.nom || '',
          'Origine':           p.origine || '',
          'Prix achat (F)':    p.prix_achat,
          'Prix vente (F)':    p.prix_vente,
          'Prix revient (F)':  p.prix_revient,
          'Quantité':          p.quantite,
          'Seuil alerte':      p.seuil_alerte,
          'Statut stock':      p.quantite === 0 ? 'Rupture' : p.quantite <= p.seuil_alerte ? 'Stock faible' : 'En stock',
        }));

        const headers  = Object.keys(data[0]);
        const csvRows  = [
          headers.join(';'),
          ...data.map((row: any) =>
            headers.map((h: string) => `"${row[h] ?? ''}"`).join(';')
          )
        ];

        const csvContent = '\uFEFF' + csvRows.join('\n');
        const blob       = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url        = URL.createObjectURL(blob);
        const link       = document.createElement('a');
        link.href        = url;
        link.download    = `stocks-cash-deal-${new Date().toISOString().split('T')[0]}.csv`;
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
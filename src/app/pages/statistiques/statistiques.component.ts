import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';
import { StatistiqueService } from '../../services/statistique.service';

declare const Chart: any;

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent]
})
export class StatistiquesComponent implements OnInit, AfterViewInit {
  @ViewChild('chartEvolution') chartEvolution!: ElementRef;
  @ViewChild('chartRepartition') chartRepartition!: ElementRef;

  dashboard: any    = {};
  evolution: any[]  = [];
  topProduits: any[]= [];
  loading           = true;
  dataLoaded        = false;

  private chartEvo: any = null;
  private chartRep: any = null;

  constructor(private statService: StatistiqueService) {}

  ngOnInit(): void {
    this.statService.getDashboard().subscribe({
      next: (d: any) => {
        this.dashboard = d;
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });

    this.statService.getTopProduits(5).subscribe({
      next: (d: any) => this.topProduits = d,
      error: () => {}
    });

    this.statService.getEvolution().subscribe({
      next: (d: any) => {
        this.evolution  = d;
        this.dataLoaded = true;
        setTimeout(() => this.initCharts(), 300);
      },
      error: () => {}
    });
  }

  ngAfterViewInit(): void {}

  initCharts(): void {
    this.initChartEvolution();
    this.initChartRepartition();
  }

  initChartEvolution(): void {
    if (!this.chartEvolution?.nativeElement) return;
    if (this.chartEvo) this.chartEvo.destroy();

    const labels  = this.evolution.map((e: any) => e.label);
    const ventes  = this.evolution.map((e: any) => e.ventes);
    const achats  = this.evolution.map((e: any) => e.achats);

    this.chartEvo = new Chart(this.chartEvolution.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ventes',
            data: ventes,
            backgroundColor: '#185FA5',
            borderRadius: 4,
          },
          {
            label: 'Achats',
            data: achats,
            backgroundColor: '#B5D4F4',
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx: any) =>
                `${ctx.dataset.label}: ${new Intl.NumberFormat('fr-FR').format(ctx.raw)} F`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val: any) =>
                new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(val) + ' F'
            }
          }
        }
      }
    });
  }

  initChartRepartition(): void {
    if (!this.chartRepartition?.nativeElement) return;
    if (this.chartRep) this.chartRep.destroy();

    const total    = this.dashboard.nb_produits || 1;
    const enStock  = this.dashboard.en_stock    || 0;
    const faible   = this.dashboard.stock_faible|| 0;
    const rupture  = this.dashboard.rupture     || 0;

    this.chartRep = new Chart(this.chartRepartition.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['En stock', 'Stock faible', 'Rupture'],
        datasets: [{
          data: [enStock, faible, rupture],
          backgroundColor: ['#16a34a', '#f59e0b', '#dc2626'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.label}: ${ctx.raw} produits`
            }
          }
        }
      }
    });
  }

  format(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(val || 0)) + ' F';
  }
}
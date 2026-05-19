import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatistiqueService } from '../../services/statistique.service';
import { AuthService, User } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/layout/topbar/topbar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent]
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  loading    = true;
  currentUser: User | null = null;

  constructor(
    private statService: StatistiqueService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.statService.getDashboard().subscribe({
      next: (data: any) => { this.stats = data; this.loading = false; },
      error: ()         => { this.loading = false; }
    });
  }

  format(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(val || 0)) + ' F';
  }
}
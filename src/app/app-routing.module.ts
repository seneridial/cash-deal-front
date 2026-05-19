import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StocksComponent } from './pages/stocks/stocks.component';
import { VentesComponent } from './pages/ventes/ventes.component';
import { AchatsComponent } from './pages/achats/achats.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { StatistiquesComponent } from './pages/statistiques/statistiques.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'stocks', component: StocksComponent, canActivate: [AuthGuard], data: { roles: ['admin', 'gerant'] } },
  { path: 'ventes', component: VentesComponent, canActivate: [AuthGuard] },
  { path: 'achats', component: AchatsComponent, canActivate: [AuthGuard], data: { roles: ['admin', 'gerant'] } },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
  { path: 'factures', component: FacturesComponent, canActivate: [AuthGuard] },
  { path: 'statistiques', component: StatistiquesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StocksComponent } from './pages/stocks/stocks.component';
import { VentesComponent } from './pages/ventes/ventes.component';
import { AchatsComponent } from './pages/achats/achats.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { StatistiquesComponent } from './pages/statistiques/statistiques.component';
import { UtilisateursComponent } from './pages/utilisateurs/utilisateurs.component';
import { AuthGuard } from './guards/auth.guard';
import { DepotsComponent } from './pages/depots/depots.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'stocks', component: StocksComponent, canActivate: [AuthGuard], data: { roles: ['admin', 'gerant'] } },
  { path: 'ventes', component: VentesComponent, canActivate: [AuthGuard] },
  { path: 'achats', component: AchatsComponent, canActivate: [AuthGuard], data: { roles: ['admin', 'gerant'] } },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
  { path: 'factures', component: FacturesComponent, canActivate: [AuthGuard] },
  { path: 'statistiques', component: StatistiquesComponent, canActivate: [AuthGuard] },
  { path: 'utilisateurs', component: UtilisateursComponent, canActivate: [AuthGuard], data: { roles: ['admin'] } },
  { path: 'depots', component: DepotsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' },
];
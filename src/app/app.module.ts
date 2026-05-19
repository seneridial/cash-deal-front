// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';

// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';

// import { StocksComponent } from './pages/stocks/stocks.component';
// import { VentesComponent } from './pages/ventes/ventes.component';
// import { AchatsComponent } from './pages/achats/achats.component';
// import { ClientsComponent } from './pages/clients/clients.component';
// import { FacturesComponent } from './pages/factures/factures.component';
// import { StatistiquesComponent } from './pages/statistiques/statistiques.component';

// import { AuthInterceptor } from './interceptors/auth.interceptor';

// import { LoginComponent } from './pages/login/login.component';
// import { DashboardComponent } from './pages/dashboard/dashboard.component';
// import { SidebarComponent } from './shared/layout/sidebar/sidebar.component';
// import { TopbarComponent } from './shared/layout/topbar/topbar.component';

// @NgModule({
//   declarations: [
//     AppComponent,
//     StocksComponent,
//     VentesComponent,
//     AchatsComponent,
//     ClientsComponent,
//     FacturesComponent,
//     StatistiquesComponent,
//   ],
//   imports: [
//     BrowserModule,
//     FormsModule,
//     ReactiveFormsModule,
//     HttpClientModule,
//     AppRoutingModule,
//     RouterModule,
//     LoginComponent,
//     DashboardComponent,
//     SidebarComponent,
//     TopbarComponent,
//   ],
//   providers: [
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: AuthInterceptor,
//       multi: true,
//     },
//   ],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}
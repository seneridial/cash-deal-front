import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
@Injectable({ providedIn: 'root' })
export class StatistiqueService {
  private url = `${environment.apiUrl}/api/statistiques`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.url}/dashboard`);
  }

  getEvolution(annee?: number): Observable<any> {
    if (annee) {
      return this.http.get<any>(`${this.url}/evolution`, {
        params: { annee: annee.toString() }
      });
    }
    return this.http.get<any>(`${this.url}/evolution`);
  }

  getTopProduits(limit = 5): Observable<any> {
    return this.http.get<any>(`${this.url}/top-produits`, {
      params: { limit: limit.toString() }
    });
  }
}
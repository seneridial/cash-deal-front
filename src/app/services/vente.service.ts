import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class VenteService {
  private url = `${environment.apiUrl}/api/ventes`;

  constructor(private http: HttpClient) {}

  getAll(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(k => {
      if (filters[k]) params = params.set(k, filters[k]);
    });
    return this.http.get<any>(this.url, { params });
  }

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.url, payload);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.url}/stats`);
  }
}
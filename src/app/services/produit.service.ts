import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private url = `${environment.apiUrl}/api/produits`;

  constructor(private http: HttpClient) {}

  getAll(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(k => {
      if (filters[k]) params = params.set(k, filters[k]);
    });
    return this.http.get<any>(this.url, { params });
  }

  getOne(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.url}/stats`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.url, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
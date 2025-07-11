import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaceResult } from '../models/race-result.model';
import { DriverPoints } from '../models/driver-points.model';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPointsTable(): Observable<{ trackLayouts: { name: string; image: string }[], drivers: DriverPoints[] }> {
    return this.http.get<{ trackLayouts: { name: string; image: string }[], drivers: DriverPoints[] }>(`${this.apiUrl}/points/table`);
  }

  getAllResults(): Observable<RaceResult[]> {
    return this.http.get<RaceResult[]>(`${this.apiUrl}/results`);
  }
}
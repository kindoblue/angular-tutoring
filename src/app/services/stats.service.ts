import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, retry, shareReplay } from 'rxjs/operators';

export interface Stats {
  totalEmployees: number;
  totalFloors: number;
  totalOffices: number;
  totalSeats: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${API_BASE_URL}/stats`;

  // Mock data for when the server is not available
  private mockStats: Stats = {
    totalEmployees: 73,
    totalFloors: 9,
    totalOffices: 180,
    totalSeats: 720
  };

  // Cached stats observable
  private stats$: Observable<Stats> | null = null;

  constructor(private http: HttpClient) {}

  getStats(): Observable<Stats> {
    // If we already have a cached observable, return it
    if (this.stats$) {
      return this.stats$;
    }

    // Otherwise, create a new observable with caching
    this.stats$ = this.http.get<Stats>(this.apiUrl).pipe(
      retry(1),
      catchError((error) => {
        console.warn('Error fetching stats from server, using mock data:', error);
        return of(this.mockStats);
      }),
      // Cache the last emitted value and share it among all subscribers
      // The '1' means we keep 1 previous value in cache
      shareReplay(1)
    );

    return this.stats$;
  }

  // Method to force refresh the stats if needed
  refreshStats(): Observable<Stats> {
    // Clear the cache
    this.stats$ = null;
    // Get fresh data
    return this.getStats();
  }
} 
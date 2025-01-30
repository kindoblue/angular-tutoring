import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardStats } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Mock data - replace with actual API calls in production
  private mockStats: DashboardStats = {
    totalEmployees: 150,
    totalFloors: 4,
    totalOffices: 40,
    totalSeats: 200,
    occupancyRate: 75,
    officesPerFloor: [
      { floorNumber: 1, officeCount: 12 },
      { floorNumber: 2, officeCount: 10 },
      { floorNumber: 3, officeCount: 8 },
      { floorNumber: 4, officeCount: 10 }
    ],
    seatsPerFloor: [
      { floorNumber: 1, seatCount: 60 },
      { floorNumber: 2, seatCount: 50 },
      { floorNumber: 3, seatCount: 40 },
      { floorNumber: 4, seatCount: 50 }
    ]
  };

  getDashboardStats(): Observable<DashboardStats> {
    return of(this.mockStats);
  }
} 
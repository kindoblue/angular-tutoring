import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  maxOffices(): number {
    return Math.max(...(this.stats()?.officesPerFloor.map(f => f.officeCount) || [0]));
  }

  maxSeats(): number {
    return Math.max(...(this.stats()?.seatsPerFloor.map(f => f.seatCount) || [0]));
  }

  getSeatsForFloor(floorNumber: number): number {
    return this.stats()?.seatsPerFloor.find(f => f.floorNumber === floorNumber)?.seatCount || 0;
  }

  private loadDashboardStats(): void {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.stats.set(stats);
    });
  }
} 
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatsService, Stats } from '../../services/stats.service';

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
  stats = signal<Stats | null>(null);

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.statsService.getStats().subscribe(stats => {
      this.stats.set(stats);
    });
  }
} 
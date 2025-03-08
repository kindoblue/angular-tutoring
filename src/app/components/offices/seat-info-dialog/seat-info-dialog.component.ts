import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Seat } from '../../../interfaces/seat.interface';

@Component({
  selector: 'app-seat-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Seat Information</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="error" class="error-message">
          <mat-icon>error</mat-icon>
          <p>{{error}}</p>
        </div>

        <div *ngIf="!loading && !error" class="seat-info">
          <div class="location-info">
            <div class="info-row">
              <mat-icon>apartment</mat-icon>
              <span>Floor: {{seat.room?.floor?.name || 'Unknown Floor'}}</span>
            </div>
            <div class="info-row">
              <mat-icon>meeting_room</mat-icon>
              <span>Room: {{seat.room?.name || 'Unknown Room'}}</span>
            </div>
            <div class="info-row">
              <mat-icon>chair</mat-icon>
              <span>Seat: {{seat.seatNumber}}</span>
            </div>
          </div>

          <div *ngIf="seat.employees && seat.employees.length > 0" class="employee-info">
            <h3>Assigned Employees</h3>
            <div *ngFor="let employee of seat.employees" class="employee-entry">
              <div class="info-row">
                <mat-icon>person</mat-icon>
                <span>{{employee.fullName}}</span>
              </div>
              <div class="info-row">
                <mat-icon>work</mat-icon>
                <span>{{employee.occupation}}</span>
              </div>
            </div>
          </div>

          <div *ngIf="!seat.employees || seat.employees.length === 0" class="no-employee">
            <mat-icon>person_off</mat-icon>
            <p>No employees assigned to this seat</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      max-width: 500px;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .employee-info {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }
    .employee-entry {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #e0e0e0;
    }
    .employee-entry:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .no-employee {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #757575;
      padding: 20px 0;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        color: rgba(0, 0, 0, 0.87);
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background-color: #fdecea;
      border-radius: 4px;
      color: #d32f2f;

      mat-icon {
        color: #d32f2f;
      }

      p {
        margin: 0;
      }
    }

    .seat-info {
      padding: 1rem;
    }

    .location-info {
      margin-bottom: 1.5rem;
    }

    .employee-info {
      h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: rgba(0, 0, 0, 0.87);
      }
    }

    .no-employee {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(0, 0, 0, 0.6);
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;

      mat-icon {
        color: rgba(0, 0, 0, 0.4);
      }

      p {
        margin: 0;
      }
    }
  `]
})
export class SeatInfoDialogComponent {
  loading = false;
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<SeatInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public seat: Seat
  ) {}

  close(): void {
    this.dialogRef.close();
  }
} 
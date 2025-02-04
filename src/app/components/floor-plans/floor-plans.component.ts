import { Component, OnInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FloorService } from '../../services/floor.service';
import { MatButtonModule } from '@angular/material/button';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-floor-plans',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  template: `
    <div class="floor-plans-container">
      <h1>Office assignments</h1>

      <mat-card class="floor-selector">
        <mat-form-field>
          <mat-label>Select Floor</mat-label>
          <mat-select [formControl]="selectedFloorControl">
            <mat-option *ngFor="let floor of floors()" [value]="floor.floorNumber">
              {{floor.name}}
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>apartment</mat-icon>
        </mat-form-field>
      </mat-card>

      <div class="floor-content">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="error" class="error-message">
          <mat-icon>error</mat-icon>
          <p>{{error}}</p>
        </div>

        <div *ngIf="!loading && !error && selectedFloor()" class="rooms-grid">
          <mat-card *ngFor="let room of selectedFloor()?.rooms" class="room-card">
            <mat-card-content>
              <div class="room-header">
                <div class="room-info">
                  <h3>{{room.name}}</h3>
                  <p class="room-number">Room {{room.roomNumber}}</p>
                </div>
                <button mat-raised-button color="primary" (click)="printRoomLabel(room)">
                  <mat-icon>print</mat-icon>
                  Print label
                </button>
              </div>
              <div class="employees-list">
                <div *ngFor="let seat of room.seats" class="seat-info">
                  <div class="seat-number">{{seat.seatNumber}}</div>
                  <div [class.occupied]="seat.occupied" class="employee-info">
                    <span *ngIf="seat.employee">
                      {{seat.employee.fullName}} - {{seat.employee.occupation}}
                    </span>
                    <span *ngIf="!seat.employee" class="vacant">
                      Vacant
                    </span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .floor-plans-container {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .floor-selector {
      padding: 1.5rem;

      mat-form-field {
        width: 100%;
        max-width: 300px;
      }
    }

    .floor-content {
      position: relative;
      min-height: 200px;
    }

    .loading-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .room-card {
      .room-header {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .floor-selector {
      padding: 1.5rem;

      mat-form-field {
        width: 100%;
        max-width: 300px;
      }
    }

    .floor-content {
      position: relative;
      min-height: 200px;
    }

    .loading-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .room-card {
      .room-header {
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .room-info {
          h3 {
            margin: 0;
            color: rgba(0, 0, 0, 0.87);
          }
  
          .room-number {
            margin: 0.25rem 0 0 0;
            color: #1976d2;
            font-weight: 500;
          }
        }

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }

      .employees-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .seat-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          background: #f5f5f5;
          border-radius: 4px;

          .seat-number {
            min-width: 60px;
            font-weight: 500;
            color: #1976d2;
          }

          .employee-info {
            flex: 1;
            
            &.occupied {
              color: #1976d2;
              font-weight: 500;
            }

            .vacant {
              color: rgba(0, 0, 0, 0.5);
              font-style: italic;
            }
          }
        }
      }
    }
  `]
})
export class FloorPlansComponent implements OnInit {
  loading = false;
  error: string | null = null;
  selectedFloorControl = new FormControl<number | null>(null);
  floors;
  selectedFloor;

  constructor(private floorService: FloorService) {
    this.floors = floorService.floors;
    this.selectedFloor = floorService.selectedFloor;
  }

  ngOnInit() {
    // Handle floor selection changes
    this.selectedFloorControl.valueChanges.subscribe(floorNumber => {
      if (floorNumber !== null) {
        this.loading = true;
        this.error = null;
        this.floorService.loadFloor(floorNumber);
        this.loading = false;
      }
    });

    // Set initial floor selection
    const currentFloors = this.floors();
    if (currentFloors.length > 0 && this.selectedFloorControl.value === null) {
      this.selectedFloorControl.setValue(currentFloors[0].floorNumber);
    }
  }

  printRoomLabel(room: any) {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Add room header
    doc.setFontSize(20);
    doc.text(`${room.name} (Room ${room.roomNumber})`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Add floor name
    yPosition += 10;
    doc.setFontSize(14);
    const floor = this.selectedFloor();
    if (floor) {
      doc.text(floor.name, pageWidth / 2, yPosition, { align: 'center' });
    }

    // Add employees list
    yPosition += 20;
    doc.setFontSize(12);
    
    room.seats.forEach((seat: any) => {
      if (seat.employee) {
        const text = `${seat.seatNumber}: ${seat.employee.fullName} - ${seat.employee.occupation}`;
        doc.text(text, 20, yPosition);
        yPosition += 10;
      }
    });

    // Save the PDF
    doc.save(`room-${room.roomNumber}-label.pdf`);
  }
} 
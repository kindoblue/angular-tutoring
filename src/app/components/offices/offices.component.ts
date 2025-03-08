import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FloorService } from '../../services/floor.service';
import { EmployeeService } from '../../services/employee.service';
import { MatButtonModule } from '@angular/material/button';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { Floor } from '../../interfaces/floor.interface';
import { Room } from '../../interfaces/room.interface';
import { Seat } from '../../interfaces/seat.interface';
import { Signal, effect } from '@angular/core';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss']
})
export class OfficesComponent implements OnInit {
  loading = false;
  error: string | null = null;
  selectedFloorControl = new FormControl<number | null>(null);
  floors: Signal<Floor[]>;
  selectedFloor: Signal<Floor | null>;
  seatUpdate: Signal<{ seatId: number, seat: Partial<Seat> } | null>;
  reservingForEmployee: { id: number; name: string; } | null = null;

  constructor(
    private floorService: FloorService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.floors = this.floorService.floors;
    this.selectedFloor = this.floorService.selectedFloor;
    this.seatUpdate = this.floorService.seatUpdate;
    
    // Set up an effect to handle seat updates
    effect(() => {
      const update = this.seatUpdate();
      // When a seat update occurs, we can do specific handling here if needed
      if (update) {
        console.log('Seat update detected:', update);
        // The UI will automatically update because we're using signals
      }
    });
  }

  ngOnInit() {
    // Check if we're reserving a seat for an employee
    this.route.queryParams.subscribe(params => {
      if (params['employeeId'] && params['employeeName']) {
        this.reservingForEmployee = {
          id: parseInt(params['employeeId']),
          name: params['employeeName']
        };
        console.log('Employee context set:', this.reservingForEmployee);
      }
    });

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

  // TrackBy function to improve rendering performance
  trackBySeatId(index: number, seat: any): number {
    return seat.id;
  }

  isSeatOccupied(seat: any): boolean {
    return seat.employees && seat.employees.length > 0;
  }

  onSeatClick(seatId: number) {
    if (this.reservingForEmployee) {
      this.assignSeatToEmployee(this.reservingForEmployee.id, seatId);
    } else {
      this.showSeatInfo(seatId);
    }
  }

  private assignSeatToEmployee(employeeId: number, seatId: number) {
    this.loading = true;
    console.log('Making API call to assign seat:', {
      employeeId: employeeId,
      seatId: seatId
    });
    
    this.employeeService.assignSeat(employeeId, seatId)
      .subscribe({
        next: () => {
          console.log('Seat assignment successful');
          
          // Directly update the seat using the FloorService
          // The seatUpdate signal will now trigger and only update the specific seat
          this.floorService.updateSeat(seatId, {
            occupied: true,
            employees: [
              {
                id: this.reservingForEmployee!.id,
                fullName: this.reservingForEmployee!.name,
                occupation: ''
              }
            ]
          });
          
          this.snackBar.open(
            `Seat assigned to ${this.reservingForEmployee?.name}`,
            'Close',
            { 
              duration: 5000,
              verticalPosition: 'top'
            }
          );
          
          this.loading = false;
          this.reservingForEmployee = null;
        },
        error: (error) => {
          console.error('Seat assignment failed:', error);
          this.snackBar.open(
            `Failed to assign seat: ${error.message}`,
            'Close',
            { 
              duration: 5000,
              verticalPosition: 'top'
            }
          );
          this.loading = false;
        }
      });
  }
  
  private showSeatInfo(seatId: number) {
    this.floorService.getSeatInfo(seatId).pipe(
      catchError((error: Error) => {
        this.snackBar.open(
          `Failed to fetch seat information: ${error.message}`,
          'Close',
          { 
            duration: 5000,
            verticalPosition: 'top'
          }
        );
        return EMPTY;
      })
    ).subscribe(seat => {
      if (seat) {
        const seatNumber = seat.seatNumber || 'Unknown';
        const employeeName = seat.employees && seat.employees.length > 0 ? seat.employees[0].fullName : null;
        
        this.snackBar.open(
          employeeName 
            ? `Seat ${seatNumber} is occupied by ${employeeName}` 
            : `Seat ${seatNumber} is vacant`,
          'Close',
          { 
            duration: 5000,
            verticalPosition: 'top'
          }
        );
      }
    });
  }
}

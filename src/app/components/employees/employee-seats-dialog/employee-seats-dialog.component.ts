import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../interfaces/employee.interface';
import { Seat } from '../../../interfaces/seat.interface';
import { Floor } from '../../../interfaces/floor.interface';
import { FloorService } from '../../../services/floor.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Signal, effect } from '@angular/core';

@Component({
  selector: 'app-employee-seats-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-seats-dialog.component.html',
  styleUrls: ['./employee-seats-dialog.component.scss']
})
export class EmployeeSeatsDialogComponent {
  seats: Seat[] = [];
  loading = true;
  error: string | null = null;
  
  // For seat assignment
  isAssigningSeats = false;
  selectedFloorControl = new FormControl<number | null>(null);
  floors: Signal<Floor[]>;
  selectedFloor: Signal<Floor | null>;
  seatUpdate: Signal<{ seatId: number, seat: Partial<Seat> } | null>;
  assignmentLoading = false;

  constructor(
    private dialogRef: MatDialogRef<EmployeeSeatsDialogComponent>,
    private employeeService: EmployeeService,
    private router: Router,
    private floorService: FloorService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public employee: Employee
  ) {
    this.loadEmployeeSeats();
    
    // Initialize floor service signals
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

  private loadEmployeeSeats(): void {
    this.employeeService.getEmployeeSeats(this.employee.id)
      .subscribe({
        next: (seats) => {
          this.seats = seats;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  reserveSeat(): void {
    // Switch to seat assignment mode
    this.isAssigningSeats = true;
    
    // Resize the dialog to give more room for seat selection
    this.dialogRef.updateSize('800px');
    
    // Initialize floor selection
    const currentFloors = this.floors();
    if (currentFloors.length > 0 && this.selectedFloorControl.value === null) {
      this.selectedFloorControl.setValue(currentFloors[0].floorNumber);
    }
    
    // Handle floor selection changes
    this.selectedFloorControl.valueChanges.subscribe(floorNumber => {
      if (floorNumber !== null) {
        this.assignmentLoading = true;
        this.error = null;
        this.floorService.loadFloor(floorNumber);
        this.assignmentLoading = false;
      }
    });
  }
  
  // Track by functions to improve rendering performance
  trackBySeatId(index: number, seat: any): number {
    return seat.id;
  }

  isSeatOccupied(seat: any): boolean {
    return seat.employees && seat.employees.length > 0;
  }

  onSeatClick(seatId: number) {
    this.assignSeatToEmployee(this.employee.id, seatId);
  }

  private assignSeatToEmployee(employeeId: number, seatId: number) {
    this.assignmentLoading = true;
    console.log('Making API call to assign seat:', {
      employeeId: employeeId,
      seatId: seatId
    });
    
    this.employeeService.assignSeat(employeeId, seatId)
      .subscribe({
        next: () => {
          console.log('Seat assignment successful');
          
          // Directly update the seat using the FloorService
          this.floorService.updateSeat(seatId, {
            occupied: true,
            employees: [
              {
                id: this.employee.id,
                fullName: this.employee.fullName,
                occupation: ''
              }
            ]
          });
          
          this.assignmentLoading = false;
          this.snackBar.open('Seat assigned successfully', 'Close', { 
            duration: 3000,
            verticalPosition: 'top'
          });
          
          // Reload seats and return to the seats view
          this.loadEmployeeSeats();
          this.isAssigningSeats = false;
          this.dialogRef.updateSize('500px');
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
          this.assignmentLoading = false;
        }
      });
  }
  
  cancelAssignment(): void {
    // Return to seat view
    this.isAssigningSeats = false;
    this.dialogRef.updateSize('500px');
  }
}

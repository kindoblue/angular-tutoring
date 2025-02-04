import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RoomGridComponent } from '../room-grid/room-grid.component';
import { FloorService } from '../../services/floor.service';
import { EmployeeService } from '../../services/employee.service';
import { Floor } from '../../interfaces/floor.interface';

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
    ReactiveFormsModule,
    RoomGridComponent
  ],
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss']
})
export class OfficesComponent implements OnInit {
  loading = false;
  error: string | null = null;
  selectedFloorControl = new FormControl<number | null>(null);
  floors;
  reservingForEmployee: { id: number; name: string } | null = null;

  constructor(
    private floorService: FloorService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.floors = floorService.floors;
  }

  ngOnInit() {
    // Check if we're reserving a seat for an employee
    this.route.queryParams.subscribe(params => {
      if (params['employeeId'] && params['employeeName']) {
        this.reservingForEmployee = {
          id: parseInt(params['employeeId']),
          name: params['employeeName']
        };
      }
    });

    // Handle floor selection changes
    this.selectedFloorControl.valueChanges.subscribe(floorNumber => {
      if (floorNumber !== null) {
        this.floorService.loadFloor(floorNumber);
      }
    });

    // Set initial floor selection
    const currentFloors = this.floors();
    if (currentFloors.length > 0 && this.selectedFloorControl.value === null) {
      this.selectedFloorControl.setValue(currentFloors[0].floorNumber);
    }
  }

  onSeatSelected(seatId: number) {
    if (this.reservingForEmployee) {
      this.loading = true;
      this.employeeService.assignSeat(this.reservingForEmployee.id, seatId)
        .subscribe({
          next: () => {
            this.snackBar.open(
              `Seat assigned to ${this.reservingForEmployee?.name}`,
              'Close',
              { duration: 3000 }
            );
            this.loading = false;
            // Clear the reservation context
            this.reservingForEmployee = null;
          },
          error: (error) => {
            this.snackBar.open(
              `Failed to assign seat: ${error.message}`,
              'Close',
              { duration: 3000 }
            );
            this.loading = false;
          }
        });
    }
  }
}

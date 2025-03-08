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
import { OfficeSeatAssignmentDialogComponent } from '../../office-seat-assignment-dialog/office-seat-assignment-dialog.component';

@Component({
  selector: 'app-employee-seats-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './employee-seats-dialog.component.html',
  styleUrls: ['./employee-seats-dialog.component.scss']
})
export class EmployeeSeatsDialogComponent {
  seats: Seat[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<EmployeeSeatsDialogComponent>,
    private employeeService: EmployeeService,
    private router: Router,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public employee: Employee
  ) {
    this.loadEmployeeSeats();
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
    // Close the current dialog
    this.dialogRef.close();
    
    // Open the office seat assignment dialog
    const dialogRef = this.dialog.open(OfficeSeatAssignmentDialogComponent, {
      width: '800px',
      data: {
        employeeId: this.employee.id,
        employeeName: this.employee.fullName
      }
    });

    // Refresh the seats list if a seat was assigned
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // If the dialog was closed with a successful assignment, reopen this dialog with refreshed data
        this.dialog.open(EmployeeSeatsDialogComponent, {
          data: this.employee,
          width: '500px'
        });
      }
    });
  }
}

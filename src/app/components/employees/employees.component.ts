import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Observable, map } from 'rxjs';
import { Employee } from '../../interfaces/employee.interface';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent {
  employees$: Observable<Employee[]>;

  constructor(private employeeService: EmployeeService) {
    this.employees$ = this.employeeService.getEmployees('', 0, 100).pipe(
      map(result => result.items)
    );
  }
}

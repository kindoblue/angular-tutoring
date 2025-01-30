import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Employee } from '../../interfaces/employee.interface';
import { EmployeeService } from '../../services/employee.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements AfterViewInit {
  @ViewChild('employeesGrid') employeesGrid!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  employees: Employee[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 8;
  searchControl = new FormControl('');
  private hasMoreEmployees = true;

  constructor(private employeeService: EmployeeService) {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.resetAndSearch();
    });
  }

  ngAfterViewInit() {
    this.loadEmployees();
  }

  private resetAndSearch(): void {
    this.employees = [];
    this.currentPage = 0;
    this.hasMoreEmployees = true;
    this.loadEmployees();
  }

  private loadEmployees(): void {
    if (!this.hasMoreEmployees || this.loading) return;

    this.loading = true;
    this.employeeService.getEmployees(
      this.searchControl.value || '',
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (result) => {
        this.employees = [...this.employees, ...result.items];
        this.hasMoreEmployees = result.items.length === this.pageSize;
        this.currentPage++;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const nearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;

    if (nearBottom && !this.loading) {
      this.loadEmployees();
    }
  }
}

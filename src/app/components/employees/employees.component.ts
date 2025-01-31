import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, EmployeeResponse, Employee } from '../../services/employee.service';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

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
  pageSize = 16;
  totalElements = 0;
  totalPages = 0;
  searchControl = new FormControl('');
  error: string | null = null;

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
    this.totalElements = 0;
    this.totalPages = 0;
    this.error = null;
    this.loadEmployees();
  }

  private loadEmployees(): void {
    if (this.currentPage >= this.totalPages && this.totalPages !== 0) return;
    if (this.loading) return;

    this.loading = true;
    this.error = null;

    this.employeeService.getEmployees(
      this.searchControl.value || '',
      this.currentPage,
      this.pageSize
    ).pipe(
      catchError(error => {
        this.error = error.message;
        this.loading = false;
        return EMPTY;
      })
    ).subscribe(response => {
      this.employees = [...this.employees, ...response.content];
      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage + 1;
      this.pageSize = response.size;
      this.loading = false;
    });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const nearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;

    if (nearBottom && !this.loading && !this.error && this.currentPage < this.totalPages) {
      this.loadEmployees();
    }
  }
}

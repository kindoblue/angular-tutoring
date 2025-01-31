import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Employee {
  id: number;
  fullName: string;
  occupation: string;
  createdAt: number[];
  seats?: any[]; // Adding seats as it's present in the API response
}

export interface EmployeeResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${API_BASE_URL}/employees`;
  
  // Mock data kept as fallback
  private mockEmployees: Employee[] = [
    { id: 1, fullName: 'John Doe', occupation: 'Software Engineer', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 2, fullName: 'Jane Smith', occupation: 'Product Manager', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 3, fullName: 'Michael Johnson', occupation: 'UX Designer', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 4, fullName: 'Sarah Williams', occupation: 'Data Analyst', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 5, fullName: 'Charlie Davis', occupation: 'DevOps Engineer', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 6, fullName: 'Emily Davis', occupation: 'Project Manager', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 7, fullName: 'David Miller', occupation: 'Frontend Developer', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 8, fullName: 'Lisa Wilson', occupation: 'Backend Developer', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 9, fullName: 'James Taylor', occupation: 'QA Engineer', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] },
    { id: 10, fullName: 'Emma Anderson', occupation: 'System Architect', createdAt: [2025, 1, 28, 8, 8, 2, 530895000] }
  ];

  constructor(private http: HttpClient) {}

  getEmployees(
    searchTerm: string = '',
    pageIndex: number = 0,
    pageSize: number = 5
  ): Observable<EmployeeResponse> {
    let params = new HttpParams()
      .set('page', pageIndex.toString())
      .set('size', pageSize.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    // Use the search endpoint
    const url = `${this.apiUrl}/search`;
    
    return this.http.get<EmployeeResponse>(url, { params }).pipe(
      retry(1),
      catchError((error) => {
        console.warn('Error fetching employees:', error);
        return throwError(() => error);
      })
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError((error) => {
        console.error('Error fetching employee:', error);
        return throwError(() => error);
      })
    );
  }

  createEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee).pipe(
      catchError((error) => {
        console.error('Error creating employee:', error);
        return throwError(() => error);
      })
    );
  }

  updateEmployee(id: number, employee: Omit<Employee, 'id' | 'createdAt'>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee).pipe(
      catchError((error) => {
        console.error('Error updating employee:', error);
        return throwError(() => error);
      })
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting employee:', error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

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
  currentPage: number;
  totalPages: number;
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

    return this.http.get<Employee[] | EmployeeResponse>(this.apiUrl, { params }).pipe(
      retry(1),
      map(response => {
        // Check if response is an array (non-paginated)
        if (Array.isArray(response)) {
          let filteredEmployees = response;
          
          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filteredEmployees = response.filter(emp => 
              emp.fullName.toLowerCase().includes(search) ||
              emp.occupation.toLowerCase().includes(search)
            );
          }

          const startIndex = pageIndex * pageSize;
          const content = filteredEmployees.slice(startIndex, startIndex + pageSize);
          const totalElements = filteredEmployees.length;
          
          return {
            content,
            totalElements,
            currentPage: pageIndex,
            totalPages: Math.ceil(totalElements / pageSize),
            size: pageSize
          };
        }
        // If it's already in EmployeeResponse format, return as is
        return response as EmployeeResponse;
      }),
      catchError((error) => {
        console.warn('Falling back to mock data due to API error:', error);
        // Fallback to mock data if API fails
        let filteredEmployees = this.mockEmployees;
        
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredEmployees = this.mockEmployees.filter(emp => 
            emp.fullName.toLowerCase().includes(search) ||
            emp.occupation.toLowerCase().includes(search)
          );
        }

        const startIndex = pageIndex * pageSize;
        const content = filteredEmployees.slice(startIndex, startIndex + pageSize);
        const totalElements = filteredEmployees.length;
        
        return of({
          content,
          totalElements,
          currentPage: pageIndex,
          totalPages: Math.ceil(totalElements / pageSize),
          size: pageSize
        });
      })
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError((error) => {
        console.warn('Falling back to mock data due to API error:', error);
        const employee = this.mockEmployees.find(emp => emp.id === id);
        return employee ? of(employee) : throwError(() => new Error('Employee not found'));
      })
    );
  }

  createEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee).pipe(
      catchError((error) => {
        console.warn('Falling back to mock data due to API error:', error);
        const newId = Math.max(...this.mockEmployees.map(emp => emp.id)) + 1;
        const newEmployee = { 
          ...employee, 
          id: newId,
          createdAt: [2025, 1, 28, 8, 8, 2, 530895000] // Mock creation date
        };
        this.mockEmployees.push(newEmployee);
        return of(newEmployee);
      })
    );
  }

  updateEmployee(id: number, employee: Omit<Employee, 'id' | 'createdAt'>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee).pipe(
      catchError((error) => {
        console.warn('Falling back to mock data due to API error:', error);
        const index = this.mockEmployees.findIndex(emp => emp.id === id);
        if (index === -1) {
          return throwError(() => new Error('Employee not found'));
        }
        const updatedEmployee = {
          ...this.mockEmployees[index],
          ...employee
        };
        this.mockEmployees[index] = updatedEmployee;
        return of(updatedEmployee);
      })
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.warn('Falling back to mock data due to API error:', error);
        const index = this.mockEmployees.findIndex(emp => emp.id === id);
        if (index === -1) {
          return throwError(() => new Error('Employee not found'));
        }
        this.mockEmployees.splice(index, 1);
        return of(void 0);
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

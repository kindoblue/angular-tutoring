import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Employee } from '../interfaces/employee.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', occupation: 'Software Engineer' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', occupation: 'Product Manager' },
    { id: 3, firstName: 'Michael', lastName: 'Johnson', occupation: 'UX Designer' },
    { id: 4, firstName: 'Sarah', lastName: 'Williams', occupation: 'Data Analyst' },
    { id: 5, firstName: 'Robert', lastName: 'Brown', occupation: 'DevOps Engineer' },
    { id: 6, firstName: 'Emily', lastName: 'Davis', occupation: 'Project Manager' },
    { id: 7, firstName: 'David', lastName: 'Miller', occupation: 'Frontend Developer' },
    { id: 8, firstName: 'Lisa', lastName: 'Wilson', occupation: 'Backend Developer' },
    { id: 9, firstName: 'James', lastName: 'Taylor', occupation: 'QA Engineer' },
    { id: 10, firstName: 'Emma', lastName: 'Anderson', occupation: 'System Architect' },
    { id: 11, firstName: 'Daniel', lastName: 'Thomas', occupation: 'Database Administrator' },
    { id: 12, firstName: 'Olivia', lastName: 'Jackson', occupation: 'Business Analyst' }
  ];

  private employeesSubject = new BehaviorSubject<Employee[]>(this.employees);

  getEmployees(
    searchTerm: string = '',
    pageIndex: number = 0,
    pageSize: number = 5
  ): Observable<{ items: Employee[]; total: number }> {
    return this.employeesSubject.pipe(
      map(employees => {
        let filteredEmployees = employees;
        
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredEmployees = employees.filter(emp => 
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search) ||
            emp.occupation.toLowerCase().includes(search)
          );
        }

        const total = filteredEmployees.length;
        const items = filteredEmployees.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        
        return { items, total };
      })
    );
  }
} 
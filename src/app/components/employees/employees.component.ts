import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="employees-container">
      <h1>Employees</h1>
      <p>View and manage employees</p>
    </div>
  `,
  styles: [`
    .employees-container {
      padding: 2rem;
      
      h1 {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class EmployeesComponent {} 
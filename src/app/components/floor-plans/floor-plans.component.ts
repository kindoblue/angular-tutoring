import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floor-plans',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="floor-plans-container">
      <h1>Floor Plans</h1>
      <p>View and manage office floor plans</p>
    </div>
  `,
  styles: [`
    .floor-plans-container {
      padding: 2rem;
      
      h1 {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class FloorPlansComponent {} 
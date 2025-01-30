import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offices-container">
      <h1>Offices</h1>
      <p>View and manage office locations</p>
    </div>
  `,
  styles: [`
    .offices-container {
      padding: 2rem;
      
      h1 {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class OfficesComponent {} 
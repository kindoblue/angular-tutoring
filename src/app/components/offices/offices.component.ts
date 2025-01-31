import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorListComponent } from '../floor-list/floor-list.component';
import { RoomGridComponent } from '../room-grid/room-grid.component';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [CommonModule, FloorListComponent, RoomGridComponent],
  template: `
    <div class="offices-container">
      <header>
        <h1>Offices</h1>
        <p>View and manage office locations</p>
      </header>
      <main class="offices-layout">
        <app-floor-list class="floor-list"></app-floor-list>
        <app-room-grid class="room-grid"></app-room-grid>
      </main>
    </div>
  `,
  styles: [`
    .offices-container {
      padding: 2rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      
      header {
        margin-bottom: 2rem;
        
        h1 {
          margin-bottom: 0.5rem;
        }
      }
    }

    .offices-layout {
      flex: 1;
      display: grid;
      grid-template-columns: minmax(200px, 1fr) 3fr;
      gap: 2rem;
      height: 100%;
      
      .floor-list, .room-grid {
        overflow: auto;
      }
    }
  `]
})
export class OfficesComponent {}

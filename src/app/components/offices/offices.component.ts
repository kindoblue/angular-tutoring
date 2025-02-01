import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorListComponent } from '../floor-list/floor-list.component';
import { RoomGridComponent } from '../room-grid/room-grid.component';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [CommonModule, FloorListComponent, RoomGridComponent],
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss']
})
export class OfficesComponent {}

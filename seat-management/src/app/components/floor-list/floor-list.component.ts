import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorService } from '../../services/floor.service';

@Component({
  selector: 'app-floor-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-list.component.html',
  styleUrls: ['./floor-list.component.scss']
})
export class FloorListComponent {
  floors;
  selectedFloor;

  constructor(private floorService: FloorService) {
    this.floors = this.floorService.floors;
    this.selectedFloor = this.floorService.selectedFloor;
  }

  onFloorSelect(floorNumber: number) {
    this.floorService.loadFloor(floorNumber);
  }
}

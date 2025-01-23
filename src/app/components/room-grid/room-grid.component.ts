import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorService } from '../../services/floor.service';
import { Floor } from '../../interfaces/floor.interface';

@Component({
  selector: 'app-room-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-grid.component.html',
  styleUrls: ['./room-grid.component.scss']
})
export class RoomGridComponent {
  selectedFloor;

  constructor(private floorService: FloorService) {
    this.selectedFloor = this.floorService.selectedFloor;
  }

  onSeatClick(roomId: number, seatId: number) {
    this.floorService.toggleSeatOccupancy(roomId, seatId);
  }
}

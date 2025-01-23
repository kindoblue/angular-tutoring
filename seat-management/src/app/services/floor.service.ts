import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Floor } from '../interfaces/floor.interface';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private selectedFloorSignal = signal<Floor | null>(null);
  private floorsSignal = signal<number[]>([1, 2, 3, 4, 5]); // Example floors

  constructor(private http: HttpClient) {}

  get selectedFloor() {
    return this.selectedFloorSignal.asReadonly();
  }

  get floors() {
    return this.floorsSignal.asReadonly();
  }

  loadFloor(floorNumber: number) {
    // In a real app, this would be an API endpoint
    // For now, we'll simulate it with a local file
    this.http.get<Floor>('/assets/floor.json')
      .subscribe(floor => {
        this.selectedFloorSignal.set(floor);
      });
  }

  toggleSeatOccupancy(roomId: number, seatId: number) {
    this.selectedFloorSignal.update(floor => {
      if (!floor) return null;
      
      const updatedRooms = floor.rooms.map(room => {
        if (room.id === roomId) {
          const updatedSeats = room.seats.map(seat => {
            if (seat.id === seatId) {
              return { ...seat, occupied: !seat.occupied };
            }
            return seat;
          });
          return { ...room, seats: updatedSeats };
        }
        return room;
      });

      return { ...floor, rooms: updatedRooms };
    });
  }
}

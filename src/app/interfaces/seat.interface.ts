import { Floor } from './floor.interface';
import { Room } from './room.interface';

export interface Seat {
  id: number;
  room: {
    id: number;
    floor: {
      id: number;
      floorNumber: number;
      name: string;
      createdAt: number[];
    };
    roomNumber: string;
    name: string;
    createdAt: number[];
  };
  seatNumber: string;
  createdAt: number[];
  employee?: {
    id: number;
    fullName: string;
    occupation: string;
    createdAt: number[];
  };
  occupied: boolean;
}

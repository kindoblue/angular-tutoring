import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Floor } from '../interfaces/floor.interface';
import { catchError, retry, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { Seat } from '../interfaces/seat.interface';

/**
 * Service responsible for managing floor data and seat occupancy state.
 * Uses Angular's signals for reactive state management and HttpClient for API communication.
 */
@Injectable({
  providedIn: 'root'
})
export class FloorService {
  /** Base URL for the API endpoints */
  private apiUrl = 'http://localhost:8080/api';

  /** Signal holding the currently selected floor's data */
  private selectedFloorSignal = signal<Floor | null>(null);

  /** Signal holding the list of all available floors */
  private floorsSignal = signal<Floor[]>([]);

  constructor(private http: HttpClient) {
    // Load the list of floors when the service is initialized
    this.loadFloors();
  }

  /**
   * Returns a readonly signal of the currently selected floor
   * @returns A readonly signal containing the current floor data or null if no floor is selected
   */
  get selectedFloor() {
    return this.selectedFloorSignal.asReadonly();
  }

  /**
   * Returns a readonly signal of all available floors
   * @returns A readonly signal containing the array of all floors
   */
  get floors() {
    return this.floorsSignal.asReadonly();
  }

  /**
   * Handles HTTP errors and provides consistent error reporting
   * @param error The HTTP error response
   * @returns An observable that emits the error message
   */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.status === 0) {
      // Client-side or network error occurred
      console.error('Client-side error:', error.error);
    } else {
      // Backend returned an unsuccessful response code
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  /**
   * Fetches the list of all available floors from the API
   * Updates the floorsSignal with the retrieved data
   */
  private loadFloors() {
    this.http.get<Floor[]>(`${this.apiUrl}/floors`, {
      headers: {
        'Accept': 'application/json'
      },
      withCredentials: true
    })
    .pipe(
      retry(1),
      catchError(this.handleError)
    )
    .subscribe({
      next: (floors) => {
        console.log('Received floors data:', floors);
        this.floorsSignal.set(floors);
      },
      error: (error) => {
        console.error('Error loading floors:', error);
        this.floorsSignal.set([]);
      }
    });
  }

  /**
   * Loads detailed information for a specific floor
   * @param floorNumber The number of the floor to load
   * Updates the selectedFloorSignal with the retrieved floor data
   */
  loadFloor(floorNumber: number) {
    this.http.get<Floor>(`${this.apiUrl}/floors/${floorNumber}`, {
      headers: {
        'Accept': 'application/json'
      },
      withCredentials: true
    })
    .pipe(
      retry(1),
      catchError(this.handleError)
    )
    .subscribe({
      next: (floor) => {
        console.log('Received floor data:', floor);
        // Sort rooms by roomNumber before setting the floor data
        const sortedFloor = {
          ...floor,
          rooms: floor.rooms ? [...floor.rooms].sort((a, b) => {
            // Convert room numbers to numbers for proper numeric sorting
            const aNum = parseInt(a.roomNumber);
            const bNum = parseInt(b.roomNumber);
            return aNum - bNum;
          }) : []
        };
        this.selectedFloorSignal.set(sortedFloor);
      },
      error: (error) => {
        console.error('Error loading floor:', error);
        this.selectedFloorSignal.set(null);
      }
    });
  }

  /**
   * Toggles the occupancy status of a specific seat
   * @param roomId The ID of the room containing the seat
   * @param seatId The ID of the seat to toggle
   * Updates the selectedFloorSignal with the modified seat state
   */
  toggleSeatOccupancy(roomId: number, seatId: number) {
    // This is a local UI update only, not making an API call
    const currentFloor = this.selectedFloorSignal();
    
    if (currentFloor && currentFloor.rooms) {
      const updatedRooms = currentFloor.rooms.map(room => {
        if (room.id === roomId && room.seats) {
          const updatedSeats = room.seats.map(seat => {
            if (seat.id === seatId) {
              // Check if the seat has employees
              const hasEmployees = seat.employees && seat.employees.length > 0;
              // Toggle the occupied state based on whether there are employees
              return { ...seat, occupied: !hasEmployees };
            }
            return seat;
          });
          
          return { ...room, seats: updatedSeats };
        }
        return room;
      });
      
      this.selectedFloorSignal.set({ ...currentFloor, rooms: updatedRooms });
    }
  }

  getSeatInfo(seatId: number): Observable<Seat> {
    return this.http.get<Seat>(`${this.apiUrl}/seats/${seatId}`).pipe(
      retry(1),
      catchError((error) => {
        console.error('Error fetching seat info:', error);
        return throwError(() => error);
      })
    );
  }
}

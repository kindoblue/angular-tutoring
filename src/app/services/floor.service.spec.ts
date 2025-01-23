import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FloorService } from './floor.service';
import { Floor } from '../interfaces/floor.interface';

describe('FloorService', () => {
  let service: FloorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FloorService]
    });
    service = TestBed.inject(FloorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load floors on initialization', () => {
    const mockFloors: Floor[] = [
      {
        id: 1,
        floorNumber: 1,
        name: 'First Floor',
        createdAt: [2025, 1, 1],
        rooms: []
      }
    ];

    // The service makes a request in the constructor
    const req = httpMock.expectOne('http://localhost:8080/api/floors');
    expect(req.request.method).toBe('GET');
    req.flush(mockFloors);

    // Check if the floors signal was updated
    expect(service.floors()).toEqual(mockFloors);
  });

  it('should load specific floor details', () => {
    const mockFloor: Floor = {
      id: 1,
      floorNumber: 1,
      name: 'First Floor',
      createdAt: [2025, 1, 1],
      rooms: [
        {
          id: 1,
          roomNumber: '101',
          name: 'Room 101',
          createdAt: [2025, 1, 1],
          seats: [
            {
              id: 1,
              seatNumber: '101-1',
              createdAt: [2025, 1, 1],
              occupied: false
            }
          ]
        }
      ]
    };

    service.loadFloor(1);

    const req = httpMock.expectOne('http://localhost:8080/api/floors/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockFloor);

    // Check if the selected floor signal was updated
    expect(service.selectedFloor()).toEqual(mockFloor);
  });

  it('should toggle seat occupancy', () => {
    const mockFloor: Floor = {
      id: 1,
      floorNumber: 1,
      name: 'First Floor',
      createdAt: [2025, 1, 1],
      rooms: [
        {
          id: 1,
          roomNumber: '101',
          name: 'Room 101',
          createdAt: [2025, 1, 1],
          seats: [
            {
              id: 1,
              seatNumber: '101-1',
              createdAt: [2025, 1, 1],
              occupied: false
            }
          ]
        }
      ]
    };

    // Set initial floor data
    service.loadFloor(1);
    const req = httpMock.expectOne('http://localhost:8080/api/floors/1');
    req.flush(mockFloor);

    // Toggle seat occupancy
    service.toggleSeatOccupancy(1, 1);

    // Check if the seat was toggled
    const updatedFloor = service.selectedFloor();
    expect(updatedFloor?.rooms[0].seats[0].occupied).toBe(true);
  });

  it('should handle error when loading floors', () => {
    const req = httpMock.expectOne('http://localhost:8080/api/floors');
    req.error(new ErrorEvent('Network error'));

    // Check if the floors signal was set to empty array
    expect(service.floors()).toEqual([]);
  });

  it('should handle error when loading specific floor', () => {
    service.loadFloor(1);

    const req = httpMock.expectOne('http://localhost:8080/api/floors/1');
    req.error(new ErrorEvent('Network error'));

    // Check if the selected floor signal was set to null
    expect(service.selectedFloor()).toBeNull();
  });
});

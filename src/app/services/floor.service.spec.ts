import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FloorService } from './floor.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Floor } from '../interfaces/floor.interface';

describe('FloorService', () => {
  let service: FloorService;
  let httpMock: HttpTestingController;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FloorService]
    });
    service = TestBed.inject(FloorService);
    httpMock = TestBed.inject(HttpTestingController);

    // Handle the initial loadFloors call that happens in constructor
    const req = httpMock.expectOne('http://localhost:8080/api/floors');
    req.flush([]);
    tick(); // Process the async operation
    httpMock.verify();
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load floors on initialization', fakeAsync(() => {
    // Trigger a new load
    service['loadFloors']();
    
    const req = httpMock.expectOne('http://localhost:8080/api/floors');
    expect(req.request.method).toBe('GET');
    
    const mockFloors: Floor[] = [
      {
        id: 1,
        floorNumber: 1,
        name: 'First Floor',
        createdAt: [2025, 1, 1],
        rooms: []
      }
    ];
    req.flush(mockFloors);
    
    tick(); // Process all pending asynchronous activities
    expect(service.floors()).toEqual(mockFloors);
    httpMock.verify();
  }));

  it('should handle error when loading floors', fakeAsync(() => {
    // Trigger a new load
    service['loadFloors']();
    tick(); // Process the initial async operation

    const req = httpMock.expectOne('http://localhost:8080/api/floors');
    expect(req.request.method).toBe('GET');
    req.flush('Error loading floors', { status: 404, statusText: 'Not Found' });

    tick(); // Process the error response
    expect(service.floors()).toEqual([]);
    httpMock.verify();
  }));

  it('should load specific floor details', fakeAsync(() => {
    const mockFloor: Floor = {
      id: 1,
      floorNumber: 1,
      name: 'First Floor',
      createdAt: [2025, 1, 1],
      rooms: []
    };

    service.loadFloor(1);
    tick(); // Process the initial request

    const req = httpMock.expectOne('http://localhost:8080/api/floors/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockFloor);

    tick(); // Process the response
    expect(service.selectedFloor()).toEqual(mockFloor);
    httpMock.verify();
  }));

  it('should handle error when loading specific floor', fakeAsync(() => {
    service.loadFloor(1);
    tick(); // Process the initial request

    const req = httpMock.expectOne('http://localhost:8080/api/floors/1');
    expect(req.request.method).toBe('GET');
    req.flush('Floor not found', { status: 404, statusText: 'Not Found' });

    tick(); // Process the error response
    expect(service.selectedFloor()).toBeNull();
    httpMock.verify();
  }));

  it('should toggle seat occupancy', fakeAsync(() => {
    // Set up initial floor state
    const mockFloor: Floor = {
      id: 1,
      floorNumber: 1,
      name: 'First Floor',
      createdAt: [2025, 1, 1],
      rooms: [{
        id: 1,
        roomNumber: '101',
        name: 'Room 101',
        createdAt: [2025, 1, 1],
        seats: [{
          id: 1,
          seatNumber: '1A',
          occupied: false,
          createdAt: [2025, 1, 1]
        }]
      }]
    };

    service.loadFloor(1);
    tick(); // Process the initial request

    const floorReq = httpMock.expectOne('http://localhost:8080/api/floors/1');
    floorReq.flush(mockFloor);

    tick(); // Process the response

    // Toggle seat occupancy
    service.toggleSeatOccupancy(1, 1);
    tick(); // Process any potential async operations

    // Verify the seat was toggled
    const updatedFloor = service.selectedFloor();
    expect(updatedFloor?.rooms[0].seats[0].occupied).toBe(true);
    httpMock.verify();
  }));
});

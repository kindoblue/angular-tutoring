import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { EmployeesComponent } from './employees.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ElementRef, ChangeDetectorRef } from '@angular/core';
import { EmployeeSeatsDialogComponent } from './employee-seats-dialog/employee-seats-dialog.component';

describe('EmployeesComponent', () => {
  let component: EmployeesComponent;
  let fixture: ComponentFixture<EmployeesComponent>;
  let httpMock: HttpTestingController;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    // Mock ResizeObserver
    class MockResizeObserver implements ResizeObserver {
      constructor(callback: ResizeObserverCallback) {}
      observe = jasmine.createSpy('observe');
      unobserve = jasmine.createSpy('unobserve');
      disconnect = jasmine.createSpy('disconnect');
    }
    window.ResizeObserver = MockResizeObserver;

    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    dialogRefSpyObj.afterClosed.and.returnValue(of(true));

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open'], {
      openDialogs: [],
      getDialogById: () => null,
      afterOpened: of({}),
      afterAllClosed: of({})
    });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    await TestBed.configureTestingModule({
      imports: [
        EmployeesComponent,
        MatDialogModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimations(),
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EmployeesComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);

    // Set up ViewChild before any change detection
    const mockGrid = document.createElement('div');
    component.employeesGrid = new ElementRef(mockGrid);
    spyOnProperty(mockGrid, 'clientHeight', 'get').and.returnValue(500);
    spyOnProperty(mockGrid, 'scrollHeight', 'get').and.returnValue(1000);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});

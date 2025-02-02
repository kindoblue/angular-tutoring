import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloorListComponent } from './floor-list.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('FloorListComponent', () => {
  let component: FloorListComponent;
  let fixture: ComponentFixture<FloorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FloorListComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FloorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGridComponent } from './room-grid.component';

describe('RoomGridComponent', () => {
  let component: RoomGridComponent;
  let fixture: ComponentFixture<RoomGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

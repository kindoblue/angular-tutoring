import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FloorListComponent } from '../floor-list/floor-list.component';
import { RoomGridComponent } from '../room-grid/room-grid.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FloorListComponent,
    RoomGridComponent
  ],
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss']
})
export class OfficesComponent implements AfterViewInit {
  @ViewChild('officesGrid') officesGrid!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  loading = false;
  error: string | null = null;
  searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      // Handle search value changes
      console.log('Search value:', value);
    });
  }

  ngAfterViewInit() {
    // Create a ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      this.checkLayout();
    });
    
    // Start observing the offices grid
    resizeObserver.observe(this.officesGrid.nativeElement);
  }

  private checkLayout(): void {
    // Add any layout checks or adjustments needed
  }

  onScroll(event: Event): void {
    // Handle scroll events if needed
  }
}

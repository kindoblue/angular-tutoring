import { Component, ElementRef, OnInit, ViewChild, effect, AfterViewInit, SecurityContext, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as d3 from 'd3';

import { FloorService } from '../../services/floor.service';
import { FloorPlanService } from '../../services/floor-plan.service';
import { Floor } from '../../interfaces/floor.interface';
import { Signal } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-floor-plan',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './floor-plan.component.html',
  styleUrls: ['./floor-plan.component.scss']
})
export class FloorPlanComponent implements OnInit, AfterViewInit {
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;
  
  selectedFloorControl = new FormControl<number | null>(null);
  floors: Signal<Floor[]>;
  selectedFloor: Signal<Floor | null>;
  
  // For debugging
  debug = true;
  svgContentPreview = '';
  svgContainerWidth = 0;
  svgContainerHeight = 0;
  
  // D3 elements
  svg: any = null;
  zoom: any = null;
  
  private isContainerInitialized = false;

  constructor(
    private floorService: FloorService,
    public floorPlanService: FloorPlanService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.floors = this.floorService.floors;
    this.selectedFloor = this.floorService.selectedFloor;
    
    // Set up an effect to watch for SVG content changes
    effect(() => {
      const svgContent = this.floorPlanService.floorPlanSvg();
      console.log('🔄 Effect triggered: SVG content changed', svgContent ? `(${svgContent.length} characters)` : '(null)');
      
      if (svgContent) {
        this.svgContentPreview = svgContent.substring(0, 100) + '...';
        
        // Only render if container is available
        if (this.svgContainer) {
          console.log('🎯 Container ready, rendering SVG directly');
          setTimeout(() => this.renderSvgDirect(svgContent), 0);
        } else {
          console.log('⏳ SVG container not available yet');
        }
      } else {
        console.log('⚠️ No SVG content to render');
      }
    });
    
    // Set up an effect to watch for errors
    effect(() => {
      const error = this.floorPlanService.error();
      if (error) {
        console.log('❌ Error from FloorPlanService:', error);
        this.snackBar.open(`Error: ${error}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }
  
  ngOnInit(): void {
    console.log('📋 FloorPlanComponent initialized');
    
    // Handle floor selection changes
    this.selectedFloorControl.valueChanges.subscribe(floorNumber => {
      if (floorNumber !== null) {
        console.log(`🔄 Floor selected: ${floorNumber}`);
        this.floorService.loadFloor(floorNumber);
        this.floorPlanService.loadFloorPlan(floorNumber);
      }
    });
    
    // Set initial floor selection
    const currentFloors = this.floors();
    if (currentFloors.length > 0 && this.selectedFloorControl.value === null) {
      console.log('🏁 Setting initial floor selection');
      this.selectedFloorControl.setValue(currentFloors[0].floorNumber);
    }
  }
  
  ngAfterViewInit(): void {
    console.log('🔍 ngAfterViewInit called, container:', this.svgContainer?.nativeElement);
    
    if (this.svgContainer) {
      // Set initial dimensions
      const containerElement = this.svgContainer.nativeElement;
      containerElement.style.width = '100%';
      containerElement.style.height = '600px'; // Set a default height
      
      // Force a layout recalculation
      containerElement.getBoundingClientRect();
      
      // Mark container as initialized
      this.isContainerInitialized = true;
      
      // Update debug info
      this.updateContainerDimensions();
      
      // Force change detection
      this.cdr.detectChanges();
      
      // Re-render SVG if we have it
      const svgContent = this.floorPlanService.floorPlanSvg();
      if (svgContent) {
        console.log('🔁 Re-rendering SVG after view init');
        // Use RAF for better timing
        requestAnimationFrame(() => {
          this.renderSvgDirect(svgContent);
          this.cdr.detectChanges();
        });
      }
    }
  }
  
  /**
   * Updates debug information about container dimensions
   */
  private updateContainerDimensions(): void {
    if (this.svgContainer && this.svgContainer.nativeElement) {
      const rect = this.svgContainer.nativeElement.getBoundingClientRect();
      this.svgContainerWidth = rect.width;
      this.svgContainerHeight = rect.height;
      this.isContainerInitialized = this.svgContainerWidth > 0 && this.svgContainerHeight > 0;
      console.log(`📏 Container dimensions: ${this.svgContainerWidth} x ${this.svgContainerHeight}`);
      console.log(`📏 Container initialized: ${this.isContainerInitialized}`);
    }
  }
  
  /**
   * Renders the SVG content directly into the container
   */
  private renderSvgDirect(svgContent: string): void {
    if (!this.svgContainer || !this.isContainerInitialized) {
      console.error('❌ SVG container not available or not initialized');
      return;
    }
    
    try {
      console.log('🎨 Starting direct SVG rendering');
      
      // Clear previous content and D3 bindings
      if (this.svg) {
        this.svg.on('.zoom', null);
      }
      this.svgContainer.nativeElement.innerHTML = '';
      
      // Force layout recalculation
      this.svgContainer.nativeElement.getBoundingClientRect();
      
      // Update dimensions for debug info
      this.updateContainerDimensions();
      
      // Create a new div to hold the SVG with explicit dimensions
      const svgDiv = document.createElement('div');
      svgDiv.style.width = '100%';
      svgDiv.style.height = '100%';
      svgDiv.style.display = 'flex';
      svgDiv.style.justifyContent = 'center';
      svgDiv.style.alignItems = 'center';
      svgDiv.style.minHeight = '400px'; // Set minimum height
      
      // Set the SVG content
      svgDiv.innerHTML = svgContent;
      
      // Get the SVG element
      const svgElement = svgDiv.querySelector('svg');
      if (svgElement) {
        console.log('📄 Found SVG element in parsed content');
        
        // Make the SVG responsive
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '100%';
        
        // Force layout recalculation before getting bbox
        svgElement.getBoundingClientRect();
        
        // Ensure viewBox is set if not present
        if (!svgElement.getAttribute('viewBox')) {
          try {
            const bbox = svgElement.getBBox();
            svgElement.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
          } catch (e) {
            console.warn('Unable to set viewBox:', e);
          }
        }
        
        // Make sure preserveAspectRatio is set
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Add the SVG to the container
        this.svgContainer.nativeElement.appendChild(svgElement);
        console.log('✅ SVG appended to container');
        
        // Force layout recalculation
        svgElement.getBoundingClientRect();
        
        // Initialize D3 zoom using RAF
        requestAnimationFrame(() => {
          this.initializeZoom(svgElement);
          this.updateContainerDimensions();
          this.cdr.detectChanges();
        });
      } else {
        console.error('❌ No SVG element found in the content');
        this.svgContainer.nativeElement.innerHTML = 
          '<div class="error-message"><mat-icon>error</mat-icon><p>Failed to parse SVG content</p></div>';
      }
    } catch (error) {
      console.error('❌ Error rendering SVG:', error);
      this.svgContainer.nativeElement.innerHTML = 
        '<div class="error-message"><mat-icon>error</mat-icon><p>Error rendering SVG</p></div>';
    }
  }
  
  /**
   * Initializes zoom behavior on the SVG element
   */
  private initializeZoom(svgElement: SVGElement): void {
    try {
      // Initialize D3 zoom
      this.svg = d3.select(svgElement);
      
      // Create a main group if it doesn't exist
      let mainGroup = this.svg.select('g');
      if (mainGroup.empty()) {
        // If there's no group, create one and move all direct children into it
        mainGroup = this.svg.append('g');
        
        // Clone all direct children (except the group we just created)
        const children = Array.from(svgElement.childNodes);
        children.forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE && 
              child !== mainGroup.node() && 
              (child as Element).tagName !== 'g') {
            mainGroup.node()?.appendChild(child.cloneNode(true));
            svgElement.removeChild(child);
          }
        });
      }
      
      // Create zoom behavior
      this.zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event: any) => {
          mainGroup.attr('transform', event.transform);
        });
      
      // Apply zoom to SVG
      this.svg.call(this.zoom);
      
      // Set initial transform
      const initialTransform = d3.zoomIdentity.translate(0, 0).scale(0.9);
      this.svg.call(this.zoom.transform, initialTransform);
      
      console.log('🔍 Zoom behavior initialized');
    } catch (error) {
      console.error('❌ Error initializing zoom:', error);
    }
  }
} 
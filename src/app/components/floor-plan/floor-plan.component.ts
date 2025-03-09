import { Component, ElementRef, OnInit, ViewChild, effect, AfterViewInit, SecurityContext, ChangeDetectorRef, signal, inject } from '@angular/core';
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
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;
  @ViewChild('backgroundSvg') backgroundSvg!: ElementRef;
  @ViewChild('drawingLayer') drawingLayer!: ElementRef;
  
  selectedFloorControl = new FormControl<number | null>(null);
  floors: Signal<Floor[]>;
  selectedFloor: Signal<Floor | null>;
  
  // For debugging
  debug = true;
  svgContentPreview = '';
  svgContainerWidth = 0;
  svgContainerHeight = 0;
  isContainerInitialized = false;
  
  // D3 elements
  backgroundSvgSelection: any = null;
  drawingLayerSelection: any = null;
  zoom: any = null;

  constructor(
    private floorService: FloorService,
    public floorPlanService: FloorPlanService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.floors = this.floorService.floors;
    this.selectedFloor = this.floorService.selectedFloor;

    // Set up SVG content effect
    effect(() => {
      const svgContent = this.floorPlanService.floorPlanSvg();
      console.log('🔄 Effect triggered: SVG content changed', svgContent ? `(${svgContent.length} characters)` : '(null)');
      
      if (svgContent) {
        this.svgContentPreview = svgContent.substring(0, 100) + '...';
        
        if (this.isContainerInitialized) {
          console.log('🎯 Container ready, rendering SVG');
          requestAnimationFrame(() => {
            this.renderSvgBackground(svgContent);
            this.cdr.detectChanges();
          });
        } else {
          console.log('⏳ Waiting for container initialization');
        }
      }
    });

    // Set up error effect
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
    
    // Initialize container dimensions
    if (this.canvasContainer) {
      this.initializeContainer();
    }
    
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
    if (!this.isContainerInitialized) {
      this.initializeContainer();
    }
  }

  private initializeContainer(): void {
    if (!this.canvasContainer || !this.backgroundSvg || !this.drawingLayer) return;
    
    console.log('🔍 Initializing container');
    const containerElement = this.canvasContainer.nativeElement;
    
    // Force a layout recalculation
    const rect = containerElement.getBoundingClientRect();
    this.svgContainerWidth = rect.width;
    this.svgContainerHeight = rect.height;
    
    // Initialize D3 selections
    this.backgroundSvgSelection = d3.select(this.backgroundSvg.nativeElement);
    this.drawingLayerSelection = d3.select(this.drawingLayer.nativeElement);
    
    // Set up zoom on the drawing layer
    this.initializeZoom();
    
    // Mark as initialized if we have dimensions
    this.isContainerInitialized = this.svgContainerWidth > 0 && this.svgContainerHeight > 0;
    console.log(`📏 Container dimensions: ${this.svgContainerWidth} x ${this.svgContainerHeight}`);
    console.log(`📏 Container initialized: ${this.isContainerInitialized}`);
    
    // Force change detection
    this.cdr.detectChanges();
  }

  private renderSvgBackground(svgContent: string): void {
    if (!this.backgroundSvg || !this.isContainerInitialized) {
      console.error('❌ Background SVG not available or not initialized');
      return;
    }
    
    try {
      console.log('🎨 Starting SVG background rendering');
      
      // Parse the SVG content
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      
      // Ensure we have an SVG element
      if (!(svgDoc.documentElement instanceof SVGSVGElement)) {
        throw new Error('Invalid SVG content');
      }
      const originalSvg = svgDoc.documentElement;
      
      // Get the background SVG element
      const backgroundElement = this.backgroundSvg.nativeElement;
      
      // Clear existing content
      while (backgroundElement.firstChild) {
        backgroundElement.removeChild(backgroundElement.firstChild);
      }
      
      // Create a root group for transformations if it doesn't exist
      let rootGroup = backgroundElement.querySelector('g');
      if (!rootGroup) {
        rootGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        backgroundElement.appendChild(rootGroup);
      }
      
      // Copy viewBox if present
      if (originalSvg.hasAttribute('viewBox')) {
        backgroundElement.setAttribute('viewBox', originalSvg.getAttribute('viewBox')!);
      } else {
        // Try to compute viewBox from content
        try {
          const bbox = originalSvg.getBBox();
          backgroundElement.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
        } catch (e) {
          console.warn('Unable to compute viewBox, using default');
          backgroundElement.setAttribute('viewBox', '0 0 1000 1000');
        }
      }
      
      // Copy preserveAspectRatio
      backgroundElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      // Copy all child nodes into the root group
      Array.from(originalSvg.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          rootGroup.appendChild(node.cloneNode(true));
        }
      });
      
      console.log('✅ Background SVG rendered successfully');
    } catch (error) {
      console.error('❌ Error rendering background SVG:', error);
    }
  }

  private initializeZoom(): void {
    try {
      // Create zoom behavior
      this.zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event: any) => {
          // Apply zoom transform to both layers
          this.backgroundSvgSelection.select('g').attr('transform', event.transform);
          this.drawingLayerSelection.select('g').attr('transform', event.transform);
        });

      // Ensure both SVGs have a root group for transformations
      if (this.backgroundSvgSelection.select('g').empty()) {
        this.backgroundSvgSelection.append('g');
      }
      if (this.drawingLayerSelection.select('g').empty()) {
        this.drawingLayerSelection.append('g');
      }
      
      // Enable zoom and pan on the drawing layer
      this.drawingLayerSelection
        .style('cursor', 'grab')
        .call(this.zoom)
        .on('mousedown.zoom', () => {
          this.drawingLayerSelection.style('cursor', 'grabbing');
        })
        .on('mouseup.zoom', () => {
          this.drawingLayerSelection.style('cursor', 'grab');
        });
      
      // Set initial transform
      const initialTransform = d3.zoomIdentity.translate(0, 0).scale(0.9);
      this.drawingLayerSelection.call(this.zoom.transform, initialTransform);
      
      console.log('🔍 Zoom behavior initialized');
    } catch (error) {
      console.error('❌ Error initializing zoom:', error);
    }
  }
} 
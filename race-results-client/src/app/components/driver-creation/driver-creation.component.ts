import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RaceService } from '../../services/race.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-creation.component.html',
  styleUrls: ['./driver-creation.component.scss']
})
export class DriverCreationComponent implements OnInit {
  driverName: string = '';
  selectedLocation: string = '';
  locations: { country: string; location: string; coords: string }[] = [];

  constructor(private raceService: RaceService, private router: Router) {}

  ngOnInit(): void {
    this.raceService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      }
    });
  }

  createDriver(): void {
    console.log('Entered driver name:', this.driverName);
    this.raceService.createDriver({ name: this.driverName, location: this.selectedLocation }).subscribe({
      next: () => {
        this.router.navigate(['/garage']);
      },
      error: (error) => {
        console.error('Error creating driver:', error);
      }
    });
  }
}
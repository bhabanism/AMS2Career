import { Component, OnInit } from '@angular/core';
import { RaceService } from '../../services/race.service';
import { DriverPoints } from '../../models/driver-points.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driver-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-points.component.html',
  styleUrls: ['./driver-points.component.scss']
})
export class DriverPointsComponent implements OnInit {
  drivers: DriverPoints[] = [];
  trackLayouts: { name: string; image: string }[] = [];
  private serverUrl = 'http://localhost:3000'; // Match race.service.ts apiUrl

  constructor(private raceService: RaceService) {}

  ngOnInit(): void {
    this.raceService.getPointsTable().subscribe({
      next: (data) => {
        // Prepend server URL to image paths
        this.trackLayouts = data.trackLayouts.map(track => ({
          name: track.name,
          image: track.image ? `${this.serverUrl}${track.image}` : ''
        }));
        this.drivers = data.drivers.map(driver => ({
          ...driver,
          carImage: driver.carImage ? `${this.serverUrl}${driver.carImage}` : ''
        }));
      },
      error: (error) => {
        console.error('Error fetching points table:', error);
      }
    });
  }
}
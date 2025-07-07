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
  trackLayouts: string[] = [];

  constructor(private raceService: RaceService) {}

  ngOnInit(): void {
    this.raceService.getPointsTable().subscribe({
      next: (data) => {
        this.trackLayouts = data.trackLayouts;
        this.drivers = data.drivers;
      },
      error: (error) => {
        console.error('Error fetching points table:', error);
      }
    });
  }
}
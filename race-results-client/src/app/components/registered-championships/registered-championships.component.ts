import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaceService } from '../../services/race.service';
import { Router } from '@angular/router';
import { Championship } from '../../models/championship.model';

@Component({
  selector: 'app-registered-championships',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registered-championships.component.html',
  styleUrls: ['./registered-championships.component.scss']
})
export class RegisteredChampionshipsComponent implements OnInit {
  championships: Championship[] = [];
  driverId = 'Shylock'; // Hardcoded for single driver

  constructor(private raceService: RaceService, private router: Router) {}

  ngOnInit(): void {
    this.raceService.getRegisteredChampionships(this.driverId).subscribe({
      next: (championships) => {
        this.championships = championships;
      },
      error: (error) => {
        console.error('Error fetching registered championships:', error);
      }
    });
  }

  goToGarage(): void {
    this.router.navigate(['/garage']);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaceService } from '../../services/race.service';
import { Router } from '@angular/router';
import { Championship } from '../../models/championship.model';

@Component({
  selector: 'app-championship',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './championship.component.html',
  styleUrls: ['./championship.component.scss']
})
export class ChampionshipComponent implements OnInit {
  championships: Championship[] = [];
  driverId = 'Shylock'; // Hardcoded for single driver

  constructor(private raceService: RaceService, private router: Router) {}

  ngOnInit(): void {
    this.raceService.getAvailableChampionships(this.driverId).subscribe({
      next: (championships) => {
        this.championships = championships;
      },
      error: (error) => {
        console.error('Error fetching championships:', error);
      }
    });
  }

  register(championshipId: string): void {
    this.raceService.registerForChampionship(this.driverId, championshipId).subscribe({
      next: () => {
        alert('Successfully registered for championship!');
      },
      error: (error) => {
        console.error('Error registering for championship:', error);
      }
    });
  }

  goToGarage(): void {
    this.router.navigate(['/garage']);
  }
}
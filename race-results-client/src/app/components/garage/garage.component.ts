import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaceService } from '../../services/race.service';
import { Router } from '@angular/router';
import { Driver } from '../../models/driver.model';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './garage.component.html',
  styleUrls: ['./garage.component.scss']
})
export class GarageComponent implements OnInit {
  driver: Driver | null = null;

  constructor(private raceService: RaceService, private router: Router) {}

  ngOnInit(): void {
    this.raceService.getDriver().subscribe({
      next: (driver) => {
        if (driver) {
          this.driver = driver;
        } else {
          this.router.navigate(['/driver-creation']);
        }
      },
      error: (error) => {
        console.error('Error fetching driver:', error);
        this.router.navigate(['/driver-creation']);
      }
    });
  }

  goToPoints(): void {
    this.router.navigate(['/points']);
  }

  goToChampionship(): void {
    this.router.navigate(['/championship']);
  }

  goToRegisteredChampionships(): void {
    this.router.navigate(['/registered-championships']);
  }
}
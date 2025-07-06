import { Component, signal, WritableSignal, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';

interface RaceResult {
  SessionName: string;
  TrackName: string;
  TrackLayout: string;
  Drivers: { Position: number; DriverName: string; CarName: string; CarClass: string }[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  displayedColumns: string[] = ['Position', 'DriverName', 'CarName', 'CarClass'];
  dataSource = new MatTableDataSource<RaceResult['Drivers'][0]>([]);
  raceResults: WritableSignal<RaceResult[]> = signal([]);
  trackLayout: WritableSignal<string> = signal('');

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient) {
    this.fetchResults();
  }

  fetchResults() {
    this.http.get<RaceResult[]>('http://localhost:3000/results').subscribe({
      next: (results) => {
        this.raceResults.set(results);
        if (results.length > 0) {
          this.trackLayout.set(results[results.length - 1].TrackLayout);
          this.dataSource.data = results[results.length - 1].Drivers;
          this.dataSource.sort = this.sort;
        }
      },
      error: (error) => console.error('Error fetching results:', error)
    });
  }
}
export interface DriverPoints {
  driverName: string;
  racePoints: { [trackLayout: string]: number };
  totalPoints: number;
}
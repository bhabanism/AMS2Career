export interface RaceResult {
  SessionName: string;
  TrackName: string;
  TrackLayout: string;
  Drivers: {
    Position: number;
    DriverName: string;
    CarName: string;
    CarClass: string;
  }[];
}
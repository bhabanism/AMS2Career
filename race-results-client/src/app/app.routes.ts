import { Routes } from '@angular/router';
import { DriverPointsComponent } from './components/driver-points/driver-points.component';
import { DriverCreationComponent } from './components/driver-creation/driver-creation.component';
import { GarageComponent } from './components/garage/garage.component';

export const routes: Routes = [
    { path: '', redirectTo: 'driver-creation', pathMatch: 'full' },
    { path: 'driver-creation', component: DriverCreationComponent },
    { path: 'garage', component: GarageComponent },
    { path: 'points', component: DriverPointsComponent }
];
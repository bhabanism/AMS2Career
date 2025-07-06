import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(MatTableModule, MatSortModule)
  ]
}).catch(err => console.error(err));
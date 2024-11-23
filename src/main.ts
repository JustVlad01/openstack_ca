import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { CarManagementComponent } from './app/components/car-management/car-management.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([{ path: '', component: CarManagementComponent }]),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));

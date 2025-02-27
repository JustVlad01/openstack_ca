import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Helps with event coalescing in Angular
    provideRouter(routes), // Provide the routes for the app
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()), // Enable client-side hydration
    provideAnimationsAsync(), // Support animations asynchronously
  ]
};

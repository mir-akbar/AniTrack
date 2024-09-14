import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),
    provideAnimations(),
    { provide: 'NGX_SKELETON_LOADER_CONFIG', useValue: { animation: 'pulse' } },provideHttpClient(withFetch())],
};

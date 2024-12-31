import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { providerWindow } from './providers/window.provider';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
    providerWindow()
  ]
};

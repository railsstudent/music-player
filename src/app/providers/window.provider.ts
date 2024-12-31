import { isPlatformBrowser } from '@angular/common';
import { inject, makeEnvironmentProviders, PLATFORM_ID } from '@angular/core';
import { WINDOW_TOKEN } from '../constants/app.const';

export function providerWindow() {
    return makeEnvironmentProviders([
        {
            provide: WINDOW_TOKEN,
            useFactory: () => { 
                const platformId = inject(PLATFORM_ID);
                return isPlatformBrowser(platformId) ? window : undefined
            }
        }
    ])
}
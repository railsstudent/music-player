import { InjectionToken } from '@angular/core';

export const WINDOW_TOKEN = new InjectionToken<Window & typeof globalThis>('WINDOW_TOKEN');

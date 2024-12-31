import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WINDOW_TOKEN } from '../../injection-tokens/window.token';
import { filter, fromEvent, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-volume-control',
  imports: [FormsModule],
  template: `
    <div class="flex items-center">
      <button (click)="decreaseVolume()" class="volume-btn mr-2">-</button>
      <input type="range" min="0" max="100" [(ngModel)]="volume"
        class="w-full h-4 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb" />
      <span class="absolute left-1/2 transform -translate-x-1/2">{{ volume() }}%</span>
      <button (click)="increaseVolume()" class="volume-btn ml-2">+</button>
    </div>`,
  styleUrl: './volume-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeControlComponent {
  volume = model.required<number>();

  window = inject(WINDOW_TOKEN);

  constructor() {
    if (this.window) {
      fromEvent(this.window, 'keydown')
        .pipe(
          filter((e) => e instanceof KeyboardEvent),
          map((e) => e as KeyboardEvent),
          filter((e) => ['ArrowUp', 'ArrowDown'].includes(e.key)),
          takeUntilDestroyed()
        )
        .subscribe((e) => {
          if (e.key === 'ArrowUp') {
            this.increaseVolume();
          } else if (e.key === 'ArrowDown')
            this.decreaseVolume();
          }
        );
    }
  }

  increaseVolume() {
    const newVolume = Math.min((this.volume() || 50) + 10, 100);
    this.volume.set(newVolume);
  }

  decreaseVolume() {
    const newVolume = Math.max((this.volume() || 50) - 10, 0);
    this.volume.set(newVolume);
  }
}

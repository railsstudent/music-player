import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { WINDOW_TOKEN } from '../../injection-tokens/window.token';
import { filter, fromEvent, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-player-controls',
  imports: [],
  templateUrl: './player-controls.component.html',
  styleUrl: './player-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerControlsComponent {
  isMuted = model.required<boolean>();
  currentTrackIndex = model.required<number>();
  canPlay = model.required<boolean>();

  numTracks = input.required<number>();

  window = inject(WINDOW_TOKEN);

  constructor() {
    if (this.window) {
      fromEvent(this.window, 'keydown')
        .pipe(
          filter((e) => e instanceof KeyboardEvent),
          map((e) => e as KeyboardEvent),
          filter((e) => ['m', 'ArrowRight', 'ArrowLeft'].includes(e.key)),
          takeUntilDestroyed()
        )
        .subscribe((e) => {
          switch (e.key) {
            case 'm':
              this.toggleMute();
              break;
            case 'ArrowRight':
              this.handleNext();
              break;
            case 'ArrowLeft':
              this.handlePrevious();
              break;  
          }
        });
    }
  }

  handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.numTracks());
    this.canPlay.set(true);
  }

  handlePrevious() {
    this.currentTrackIndex.update((prev) => (prev - 1 + this.numTracks()) % this.numTracks());
    this.canPlay.set(true);
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
  }
}

import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { WINDOW_TOKEN } from '../../injection-tokens/window.token';
import { filter, fromEvent, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-player-controls',
  template: `
    <div class="flex justify-center space-x-4">
      <button (click)="handlePrevious()" class="btn">
        <i class="fas fa-step-backward"></i>
      </button>
      <button (click)="handlePlayPause()" class="btn">
        <i class="fas" [class]="{ 'fa-pause': isPlaying(), 'fa-play': !isPlaying() }"></i>
      </button>
      <button (click)="handleNext()" class="btn">
        <i class="fas fa-step-forward"></i>
      </button>
      <button (click)="toggleMute()" class="btn">
        <i class="fas" [class]="{ 'fa-volume-mute': isMuted(), 'fa-volume-up': !isMuted() }"></i>
      </button>
    </div>`,
  styleUrl: './player-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerControlsComponent {
  isMuted = model.required<boolean>();
  currentTrackIndex = model.required<number>();
  hasUserAction = model.required<boolean>();
  isPlaying = model.required<boolean>();
  numTracks = input.required<number>();

  window = inject(WINDOW_TOKEN);

  constructor() {
    if (this.window) {
      fromEvent(this.window, 'keydown')
        .pipe(
          filter((e) => e instanceof KeyboardEvent),
          map((e) => e as KeyboardEvent),
          filter((e) => ['m', 'ArrowRight', 'ArrowLeft', ' '].includes(e.key)),
          takeUntilDestroyed()
        )
        .subscribe((e) => this.adjustTrackPlayed(e));
    }
  }

  adjustTrackPlayed (e: KeyboardEvent) {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        this.handlePlayPause();
        break;
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
  }

  handlePlayPause() {
    this.isPlaying.set(!this.isPlaying());
    this.hasUserAction.set(true);
  }

  handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.numTracks());
    this.hasUserAction.set(true);
    this.isPlaying.set(true);
  }

  handlePrevious() {
    this.currentTrackIndex.update((prev) => (prev - 1 + this.numTracks()) % this.numTracks());
    this.hasUserAction.set(true);
    this.isPlaying.set(true);
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
  }
}

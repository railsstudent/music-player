import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MusicPlayerFilterBarComponent } from './music-player/music-player-filter-bar.component';
import { TrackListComponent } from './music-player/track-list.component';
import { ErrorComponent } from './error/error.component';
import { TrackInfoComponent } from './music-player/track-info.component';
import { PlayerControlsComponent } from './music-player/player-controls.component';
import { VolumeControlComponent } from './music-player/volume-control.component';
import { ProgressBarComponent } from './music-player/progress-bar.component';
import { TRACK_DATA } from './constants/track-data.const';
import { WINDOW_TOKEN } from './constants/app.const';
import { filter, fromEvent, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [MusicPlayerFilterBarComponent, TrackListComponent, ErrorComponent, 
    TrackInfoComponent, PlayerControlsComponent, VolumeControlComponent, ProgressBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  volume = signal(100);
  tracks = signal(TRACK_DATA);

  currentTrackIndex = signal(0);
  isPlaying = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  isMuted = signal(false);
  progress = signal(0);
  currentTime = signal(0);
  duration = signal(0);
  filteredTracks = computed(() =>
    this.tracks().filter(({ title }) =>
      title.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );
  currentTrack = computed(() => 
    this.currentTrackIndex() < 0 ? undefined : this.filteredTracks()[this.currentTrackIndex()]);
  filteredTrackLength = computed(() => this.filteredTracks().length);

  audio: HTMLAudioElement | null = null;

  window = inject(WINDOW_TOKEN);
  destroyRef$ = inject(DestroyRef);

  constructor() {
    this.loadTrack();
    if (this.window) {
      fromEvent(this.window, 'keydown')
        .pipe(
          filter((e) => e instanceof KeyboardEvent),
          map((e) => e as KeyboardEvent),
          tap((e) => this.handleKeydown(e)),
          takeUntilDestroyed(this.destroyRef$)
        ).subscribe()
    }

    effect(async () => {
      if (this.audio) { 
        this.error.set(null); 
        this.audio.muted = this.isMuted();
        if (this.isPlaying()) {
          // await this.audio.play();
          this.playTrack();
        } else {
          this.audio.pause();
        }

        this.audio.volume = this.volume() / 100;
        const duration  = this.audio.duration || 1;
        const newTime = (this.progress() / 100) * duration;
        this.audio.currentTime = newTime;
      }
    });
  }

  handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.isPlaying.set(!this.isPlaying())
        break;
      case 'ArrowRight':
        this.handleNext();
        break;
      case 'ArrowLeft':
        this.handlePrevious();
        break;
      case 'ArrowUp':
        this.increaseVolume();
        break;
      case 'ArrowDown':
        this.decreaseVolume();
        break;
      case 'm':
        this.isMuted.set(!this.isMuted());
        break;
      case 's':
        this.handleSearch(event);
        break;
    }
  }

  loadTrack() {
    if (!this.audio?.paused) {
      this.audio?.pause();
      this.isPlaying.set(false);
    }

    this.audio = null;
    const currentTrack = this.currentTrack();
    if (currentTrack) {
      this.audio = new Audio(currentTrack.url);

      this.audio.addEventListener('timeupdate', this.updateProgress.bind(this));
      this.audio.addEventListener('ended', this.handleNext.bind(this));
      this.audio.addEventListener('canplay', () => this.error.set(null));
      this.audio.addEventListener('error', () => {
        this.error.set('Unable to load audio. Please check the audio source.');
        this.isPlaying.set(false);
      });
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

  private handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.filteredTrackLength());
  }

  private async playTrack() {
    try {
      this.error.set(null);
      this.loadTrack();
      await this.audio?.play();
      this.isPlaying.set(true);
    } catch (e) {
      if (!this.audio?.paused) {
        this.audio?.pause();
      }
      if (e instanceof Error) {
        this.error.set((e as Error).message);
      } else {
        this.error.set('Playback failed. Please try again.');
      }
    }
  }

  private handlePrevious() {
    this.currentTrackIndex.update((prev) => (prev - 1 + this.filteredTrackLength()) % this.filteredTrackLength());
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  updateProgress() {
    if (this.audio) {
      const duration = this.audio.duration || 1;
      const currentTime = this.audio.currentTime;
      this.progress.set((currentTime / duration) * 100);
      this.currentTime.set(currentTime);
      this.duration.set(duration);
    }
  }
}
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
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
export class AppComponent implements OnInit {
  volume = signal(100);
  tracks = signal(TRACK_DATA);

  currentTrackIndex = signal(0);
  isPlaying = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  isMuted = signal(false);
  progress = signal(0);
  filteredTracks = computed(() =>
    this.tracks().filter(({ title }) =>
      title.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );
  currentTrack = computed(() => 
    this.currentTrackIndex() < 0 ? undefined : this.filteredTracks()[this.currentTrackIndex()]);
  filteredTrackLength = computed(() => this.filteredTracks().length);

  audio = viewChild.required<ElementRef<HTMLAudioElement>>('a');
  nativeAudio = computed(() => this.audio().nativeElement);

  window = inject(WINDOW_TOKEN);
  destroyRef$ = inject(DestroyRef);

  constructor() {
    if (this.window) {
      fromEvent(this.window, 'keydown')
        .pipe(
          filter((e) => e instanceof KeyboardEvent),
          map((e) => e as KeyboardEvent),
          tap((e) => this.handleKeydown(e)),
          takeUntilDestroyed()
        ).subscribe()
    }

    effect(async () => {
      // if (this.audio) { 
        this.nativeAudio().muted = this.isMuted();
        if (this.isPlaying()) {
          // await this.audio.play();
          this.playTrack();
        } else {
          this.nativeAudio().pause();
        }

        this.nativeAudio().volume = this.volume() / 100;
        const duration  = this.nativeAudio().duration || 1;
        const newTime = (this.progress() / 100) * duration;
        this.nativeAudio().currentTime = newTime;
      // }
    });
  }

  ngOnInit(): void {
    this.loadTrack();

    fromEvent(this.nativeAudio(), 'timeupdate')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.updateProgress());

    fromEvent(this.nativeAudio(), 'ended')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.handleNext());

    fromEvent(this.nativeAudio(), 'canplay')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.error.set(null));

    fromEvent(this.nativeAudio(), 'error')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.error.set('Unable to load audio. Please check the audio source.');
        this.isPlaying.set(false);
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
        this.currentTrackIndex.update((prev) => (prev - 1 + this.filteredTrackLength()) % this.filteredTrackLength());
        break;
      case 'ArrowUp':
        const increasedVolume = Math.min((this.volume() || 50) + 10, 100);
        this.volume.set(increasedVolume);    
        break;
      case 'ArrowDown':
        const decreasedVolume = Math.max((this.volume() || 50) - 10, 0);
        this.volume.set(decreasedVolume);
        break;
      case 'm':
        this.isMuted.set(!this.isMuted());
        break;
      default:
        break;
    }
  }

  loadTrack() {
    if (!this.nativeAudio().paused) {
      this.nativeAudio().pause();
      this.isPlaying.set(false);
    }

    const currentTrack = this.currentTrack();
    if (currentTrack) {
      this.nativeAudio().src = currentTrack.url;
    }
  }

  private handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.filteredTrackLength());
  }

  private async playTrack() {
    try {
      this.error.set(null);
      this.loadTrack();
      await this.nativeAudio().play();
      this.isPlaying.set(true);
    } catch (e) {
      if (!this.nativeAudio().paused) {
        this.nativeAudio().pause();
      }
      if (e instanceof Error) {
        this.error.set((e as Error).message);
      } else {
        this.error.set('Playback failed. Please try again.');
      }
    }
  }

  updateProgress() {
    const duration = this.nativeAudio().duration || 1;
    const currentTime = this.nativeAudio().currentTime;
    this.progress.set((currentTime / duration) * 100);
  }
}
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, map } from 'rxjs';
import { ErrorComponent } from './error/error.component';
import { WINDOW_TOKEN } from './injection-tokens/window.token';
import { Track } from './interfaces/track.interface';
import { TrackDurationComponent } from './music-player/track-duration/track-duration.component';
import { TrackFilterComponent } from './music-player/track-filter/track-filter.component';
import { TrackInfoComponent } from './music-player/track-info/track-info.component';
import { TrackListComponent } from './music-player/track-list/track-list.component';
import { VolumeControlComponent } from './music-player/volume-control/volume-control.component';
import { TRACK_DATA } from './track-data';

@Component({
  selector: 'app-root',
  imports: [NgClass, VolumeControlComponent, TrackInfoComponent, ErrorComponent, TrackFilterComponent,
    TrackListComponent, TrackDurationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  volume = signal(100);
  tracks = signal<Track[]>(TRACK_DATA);

  currentTrackIndex = signal(0);
  isPlaying = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  isMuted = signal(false);
  filteredTracks = computed(() =>
    this.tracks().filter((track) =>
      track.title.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );
  numTracks = computed(() => this.filteredTracks().length);
  currentTrack = computed(() => {
    const index = this.currentTrackIndex();
    return index < 0 ? undefined : this.filteredTracks()[index];
  });

  audio = viewChild.required<ElementRef<HTMLAudioElement>>('a');
  audioNativeElement = computed(() => this.audio().nativeElement);

  destroyRef$ = inject(DestroyRef);

  isPreloadingDone = signal(false);
  numLoaded = signal(0);
  audios: HTMLAudioElement[] = [];
  window = inject(WINDOW_TOKEN);

  trackDuration = signal({
    duration: 0,
    currentTime: 0,
    progress: 0,
  });

  constructor() {
    if (this.window) {
      fromEvent(this.window, 'keydown')
        .pipe(
          filter((e) => e instanceof KeyboardEvent),
          map((e) => e as KeyboardEvent),
          takeUntilDestroyed()
        )
        .subscribe((e) => this.handleKeydown(e));
    }

    effect(() => {
      this.audioNativeElement().volume = this.volume() / 100;
      this.audioNativeElement().muted = this.isMuted();

      this.loadTrack();
      this.isPlaying.set(true);
      this.audioNativeElement().play();
    });
  }

  ngOnInit() {
    fromEvent(this.audioNativeElement(), 'timeupdate')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.updateProgress());

    fromEvent(this.audioNativeElement(), 'ended')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.handleNext());

    fromEvent(this.audioNativeElement(), 'canplay')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.error.set(null));

    fromEvent(this.audioNativeElement(), 'error')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.error.set('Unable to load audio. Please check the audio source.');
        this.isPlaying.set(false);
      });

    for (const track of this.tracks()) {
      console.log('preload url', track.url);

      const audio = new Audio();
      this.audios.push(audio);
      audio.addEventListener('canplaythrough', this.loadedAudio.bind(this), false);
      audio.src = track.url;
    }
  }

  loadedAudio() {
    this.numLoaded.update((prev) => prev + 1);
    if (this.numLoaded() === this.numTracks()) {
      this.loadTrack();
      this.isPreloadingDone.set(true);
    }
  }

  ngOnDestroy() {
    for (const audio of this.audios) {
      audio.removeEventListener('canplaythrough', this.loadedAudio.bind(this));
    }
  }

  handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.handlePlayPause();
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
        this.toggleMute();
        break;
    }
  }

  loadTrack() {
    try {
      if (!this.audioNativeElement().paused) {
        this.audioNativeElement().pause();
        this.isPlaying.set(false);
      }

      const track = this.currentTrack();
      if (track) {
        this.audioNativeElement().src = track.url;
      }
    } catch {
      if (!this.audioNativeElement().paused) {
        this.audioNativeElement().pause();
        this.isPlaying.set(false);
      }
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

  handlePlayPause() {
    if (this.isPlaying()) {
      this.audioNativeElement().pause();
    } else {
      this.audioNativeElement().play()
      .catch(() => {
        this.error.set('Playback failed. Please try again.');
      });
    }
    this.isPlaying.set(!this.isPlaying());
  }

  handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.numTracks());
  }

  handlePrevious() {
    this.currentTrackIndex.update((prev) => (prev - 1 + this.numTracks()) % this.numTracks());
  }

  handleSeek(value: number) {
    this.trackDuration.update((prev) => ({ ...prev, progress: value }));

    const newTime = (value / 100) * this.audioNativeElement().duration;
    this.audioNativeElement().currentTime = newTime;
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
  }

  updateProgress() {
    const duration = this.audioNativeElement().duration || 1;
    const currentTime = this.audioNativeElement().currentTime;
    this.trackDuration.set({
      duration,
      currentTime,
      progress: (currentTime / duration) * 100
    });
  }
}
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
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { ErrorComponent } from './error/error.component';
import { Track, TrackDuration } from './music-player/interfaces/track.interface';
import { TrackControlBarsComponent } from './music-player/track-control-bars/track-control-bars.component';
import { TrackFilterComponent } from './music-player/track-filter/track-filter.component';
import { TrackInfoComponent } from './music-player/track-info/track-info.component';
import { TrackListComponent } from './music-player/track-list/track-list.component';
import { TRACK_DATA } from './track-data';

@Component({
  selector: 'app-root',
  imports: [TrackInfoComponent, ErrorComponent, TrackFilterComponent,
    TrackListComponent, TrackControlBarsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
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

  trackDuration = signal<TrackDuration>({
    duration: 0,
    currentTime: 0,
    progress: 0,
  });

  hasUserAction = signal(false);

  constructor() {
    effect(() => {
      this.audioNativeElement().volume = this.volume() / 100;
      this.audioNativeElement().muted = this.isMuted();

      if (this.hasUserAction() && !this.isPlaying()) {
        this.audioNativeElement().pause();
      }

      if (this.hasUserAction() && this.isPlaying()) {
        if (this.currentTrack()?.url !== this.audioNativeElement().src) {
          this.loadTrack();
          this.audioNativeElement().play();
        } else {
          this.audioNativeElement().play()
            .catch(() => {
              this.error.set('Playback failed. Please try again.');
            });
        }
      }
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
  }

  loadTrack() {
    try {
      if (!this.audioNativeElement().paused) {
        this.audioNativeElement().pause();
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

  handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.numTracks());
    this.hasUserAction.set(true);
  }

  handleSeek(value: number) {
    this.trackDuration.update((prev) => ({ ...prev, progress: value }));

    const newTime = (value / 100) * this.audioNativeElement().duration;
    this.audioNativeElement().currentTime = newTime;
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
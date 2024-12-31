import { NgClass } from '@angular/common';
import {
  Component,
  OnInit,
  signal,
  computed,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  viewChild,
  DestroyRef,
  inject,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { Track } from './interfaces/track.interface';
import { TRACK_DATA } from './track-data';

@Component({
  selector: 'app-root',
  imports: [NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('trackListContainer') trackListContainer!: ElementRef;
  volume = signal(100);
  tracks = signal<Track[]>(TRACK_DATA);

  currentTrackIndex = signal(0);
  isPlaying = signal(false);
  progress = signal(0);
  error = signal<string | null>(null);
  searchQuery = signal('');
  isMuted = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  filteredTracks = computed(() =>
    this.tracks().filter((track) =>
      track.title.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  audio = viewChild.required<ElementRef<HTMLAudioElement>>('a');
  audioNativeElement = computed(() => this.audio().nativeElement);

  destroyRef$ = inject(DestroyRef);

  isPreloadingDone = signal(false);
  numLoaded = signal(0);
  audios: HTMLAudioElement[] = [];

  ngOnInit() {
    window.addEventListener('keydown', this.handleKeydown.bind(this));

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
    if (this.numLoaded() === this.tracks().length) {
      this.loadTrack();
      this.isPreloadingDone.set(true);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleKeydown.bind(this));

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

      this.audioNativeElement().src = this.filteredTracks()[this.currentTrackIndex()].url;

      if (this.volume() !== null) {
        this.setVolume(this.volume());
      }
    } catch {
      if (!this.audioNativeElement().paused) {
        this.audioNativeElement().pause();
        this.isPlaying.set(false);
      }
    }
  }

  handleVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.volume.set(value);
    this.setVolume(value);
  }

  increaseVolume() {
    const newVolume = Math.min((this.volume() || 50) + 10, 100);
    this.volume.set(newVolume);
    this.setVolume(newVolume);
  }

  decreaseVolume() {
    const newVolume = Math.max((this.volume() || 50) - 10, 0);
    this.volume.set(newVolume);
    this.setVolume(newVolume);
  }

  setVolume(value: number) {
    // if (this.audio) {
      this.audioNativeElement().volume = value / 100;
    // }
  }

  handlePlayPause() {
    // if (this.audio) {
      if (this.isPlaying()) {
        this.audioNativeElement().pause();
      } else {
        this.audioNativeElement().play()
        .catch(() => {
          this.error.set('Playback failed. Please try again.');
        });
      }
      this.isPlaying.set(!this.isPlaying());
    // }
  }

  scrollToCurrentTrack() {
    const container = this.trackListContainer.nativeElement;
    const selectedTrack = container.children[this.currentTrackIndex()];
    if (selectedTrack) {
      selectedTrack.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  handleNext() {
    this.currentTrackIndex.set(
      (this.currentTrackIndex() + 1) % this.tracks().length
    );
    this.loadTrack();
    this.isPlaying.set(true);
    this.audioNativeElement().play();
    this.scrollToCurrentTrack();
  }

  handlePrevious() {
    this.currentTrackIndex.set(
      (this.currentTrackIndex() - 1 + this.tracks().length) % this.tracks().length
    );
    this.loadTrack();
    this.isPlaying.set(true);
    this.audioNativeElement().play();
    this.scrollToCurrentTrack();
  }

  handleTrackSelect(index: number) {
    this.currentTrackIndex.set(index);
    this.loadTrack();
    this.isPlaying.set(true);
    this.audioNativeElement().play();
    this.scrollToCurrentTrack();
  }

  handleSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.progress.set(value);

    // if (this.audio) {
      const newTime = (value / 100) * this.audioNativeElement().duration;
      this.audioNativeElement().currentTime = newTime;
    // }
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
//    if (this.audio) {
      this.audioNativeElement().muted = this.isMuted();
//    }
  }

  updateProgress() {
    // if (this.audio) {
      const duration = this.audioNativeElement().duration || 1;
      const currentTime = this.audioNativeElement().currentTime;
      this.progress.set((currentTime / duration) * 100);
      this.currentTime.set(currentTime);
      this.duration.set(duration);
    // }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
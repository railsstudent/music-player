import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  OnInit,
  signal,
} from '@angular/core';
import { Track } from './music-player/interfaces/track.interface';
import { MusicPlayerFilterBarComponent } from './music-player/music-player-filter-bar.component';
import { TrackListComponent } from './music-player/track-list.component';
import { ErrorComponent } from './error/error.component';
import { TrackInfoComponent } from './music-player/track-info.component';
import { PlayerControlsComponent } from './music-player/player-controls.component';
import { VolumeControlComponent } from './music-player/volume-control.component';
import { ProgressBarComponent } from './music-player/progress-bar.component';

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
  tracks = signal<Track[]>([
    {
      title: 'Serenity',
      artist: 'Piano and Strings',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      title: 'Energetic Beats',
      artist: 'Drum and Bass Collective',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      title: 'Smooth Jazz',
      artist: 'Sax and Keys',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
    {
      title: 'Classical Symphony',
      artist: 'Orchestra Ensemble',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    },
    {
      title: 'Electronic Dreams',
      artist: 'Synthwave Collective',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    },
    {
      title: 'Ambient Relaxation',
      artist: 'Chillout Lounge',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    },
    {
      title: 'Country Folk',
      artist: 'Acoustic Guitar Trio',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    },
    {
      title: 'Rocking Blues',
      artist: 'Electric Guitar Band',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    },
    {
      title: 'Hip Hop Beats',
      artist: 'Rap Collective',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    },
    {
      title: 'Reggae Vibes',
      artist: 'Island Rhythms',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    },
  ]);

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
    this.currentTrackIndex() < 0 ? undefined : this.tracks()[this.currentTrackIndex()]);
  isChangeTrack = computed(() => {
    const currentTrack = this.currentTrack();
    return !!this.audio && !!currentTrack && currentTrack.url !== this.audio.src;
  })

  audio: HTMLAudioElement | null = null;

  constructor() {
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

  ngOnInit() {
    this.loadTrack();
    window.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleKeydown.bind(this));
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
    this.currentTrackIndex.update((prev) => (prev + 1) % this.tracks.length);
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
    this.currentTrackIndex.update((prev) => (prev - 1 + this.tracks.length) % this.tracks.length);
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

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
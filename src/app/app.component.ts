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

@Component({
  selector: 'app-root',
  imports: [MusicPlayerFilterBarComponent, TrackListComponent, ErrorComponent, TrackInfoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  volume = signal(100);
  tracks: Track[] = [
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
  ];

  currentTrackIndex = signal(0);
  isPlaying = signal(false);
  progress = signal(0);
  error = signal<string | null>(null);
  searchQuery = signal('');
  isMuted = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  filteredTracks = computed(() =>
    this.tracks.filter((track) =>
      track.title.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );
  currentTrack = computed(() => 
    this.currentTrackIndex() < 0 ? undefined : this.tracks[this.currentTrackIndex()]);

  private audio: HTMLAudioElement | null = null;

  constructor() {
    effect(() => {
      if (this.isPlaying()) {
        this.playTrack();
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
      case 's':
        this.handleSearch(event);
        break;
    }
  }

  loadTrack() {
    if (!this.audio?.paused) {
      this.audio?.pause();
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
    if (this.volume() !== null) {
      this.setVolume(this.volume());
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
    if (this.audio) {
      this.audio.volume = value / 100;
    }
  }

  async handlePlayPause() {
    try {
      this.error.set(null);
      if (this.audio) {
        if (this.isPlaying()) {
          this.audio.pause();
        } else {
          await this.audio.play();
        }
        this.isPlaying.set(!this.isPlaying());
      } 
    } catch (e) {
      if (!this.audio?.paused) {
        this.audio?.pause();
      }
      this.error.set('Playback failed. Please try again.');
    }
  }

  handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.tracks.length);
  }

  private async playTrack() {
    try {
      this.error.set(null);
      this.loadTrack();
      await this.audio?.play();
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

  handlePrevious() {
    this.currentTrackIndex.update((prev) => (prev - 1 + this.tracks.length) % this.tracks.length);
  }

  handleSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.progress.set(value);

    if (this.audio) {
      const newTime = (value / 100) * this.audio.duration;
      this.audio.currentTime = newTime;
    }
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
    if (this.audio) {
      this.audio.muted = this.isMuted();
    }
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
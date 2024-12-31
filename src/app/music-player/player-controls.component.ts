import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Track } from './interfaces/track.interface';

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrl: './player-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerControlsComponent {
  tracks = input.required<Track[]>();
  currentTrackIndex = model(0);
  isPlaying = model(false);
  isMuted = model(false);

  numTracks = computed(() => this.tracks().length);

  handlePrevious() {
    this.currentTrackIndex.update((prev) => (prev - 1 + this.numTracks()) % this.numTracks());
  }

  handleNext() {
    this.currentTrackIndex.update((prev) => (prev + 1) % this.numTracks());
  }
}

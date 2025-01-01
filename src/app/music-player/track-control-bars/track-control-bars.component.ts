import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { TrackDurationComponent } from '../track-duration/track-duration.component';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';
import { VolumeControlComponent } from '../volume-control/volume-control.component';
import { TrackDuration } from '../interfaces/track.interface';

@Component({
  selector: 'app-track-control-bars',
  imports: [TrackDurationComponent, PlayerControlsComponent, VolumeControlComponent],
  template: `
    <div class="flex flex-col">
      <!-- Player Controls -->
      <app-player-controls class="mb-6 w-full max-w-md" [(isMuted)]="isMuted" 
          [(hasUserAction)]="hasUserAction" [(currentTrackIndex)]="currentTrackIndex"
          [numTracks]="numTracks()" [(isPlaying)]="isPlaying"
      />

      <!-- Current Track Duration and Custom Slider -->
      <app-track-duration class="relative mb-4 w-full max-w-md" 
          [trackDuration]="trackDuration()" (updateProgress)="updateProgress.emit($event)" />

      <!-- Volume Control -->
      <app-volume-control class="relative mb-4 w-full max-w-md" [(volume)]="volume" />
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackControlBarsComponent {
  volume = model.required<number>();
  trackDuration = input.required<TrackDuration>();
  isMuted = model.required<boolean>();
  currentTrackIndex = model.required<number>();
  hasUserAction = model.required<boolean>();
  isPlaying = model.required<boolean>();
  numTracks = input.required<number>();

  updateProgress = output<number>();
}

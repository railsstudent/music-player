import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { TrackDurationComponent } from '../track-duration/track-duration.component';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';
import { VolumeControlComponent } from '../volume-control/volume-control.component';
import { TrackDuration } from '../interfaces/track.interface';

@Component({
  selector: 'app-track-control-bars',
  imports: [TrackDurationComponent, PlayerControlsComponent, VolumeControlComponent],
  templateUrl: './track-control-bars.component.html',
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

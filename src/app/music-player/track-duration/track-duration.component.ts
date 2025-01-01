import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrackDuration } from '../interfaces/track.interface';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

@Component({
  selector: 'app-track-duration',
  imports: [FormsModule],
  templateUrl: './track-duration.component.html',
  styleUrl: '../volume-control/volume-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackDurationComponent {
  trackDuration = input.required<TrackDuration>();

  currentTime = computed(() => this.trackDuration().currentTime);
  duration = computed(() => this.trackDuration().duration);
  displayCurrentTime = computed(() => formatTime(this.currentTime()));
  displayDuration = computed(() => formatTime(this.duration()));

  updateProgress = output<number>();
}

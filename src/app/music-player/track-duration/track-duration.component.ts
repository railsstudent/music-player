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
  template: `<div class="flex items-center justify-between">
    <span class="text-sm text-gray-400">{{ displayCurrentTime() }}</span>
    <div class="relative flex-1 mx-2">
      <input type="range" min="0" max="100" [ngModel]="trackDuration().progress" 
        (ngModelChange)="updateProgress.emit($event)"
        class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb" />
    </div>
    <span class="text-sm text-gray-400">{{ displayDuration() }}</span>
  </div>`,
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

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Track } from './interfaces/track.interface';

@Component({
  selector: 'app-track-info',
  template: `
    <div class="text-center mb-4">
      @let t = track();
      <h2 class="text-2xl font-bold">{{ t?.title ?? '' }}</h2>
      <p class="text-gray-400">{{ t?.artist ?? '' }}</p>
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackInfoComponent {
  track = input<Track | undefined>(undefined);
}

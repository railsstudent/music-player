import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Track } from '../interfaces/track.interface';

@Component({
  selector: 'app-track-info',
  template: `
    <div class="text-center">
      @let t = track();
      <h2 class="text-2xl font-bold">{{ t?.title || '' }}</h2>
      <p class="text-gray-400">{{ t?.artist || '' }}</p>
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackInfoComponent {
  track = input.required<Track | undefined>()
}

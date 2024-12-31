import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, model, viewChild } from '@angular/core';
import { Track } from './interfaces/track.interface';

@Component({
  selector: 'app-track-list',
  templateUrl: './track-list.component.html',
  styleUrl: './track-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackListComponent {
  trackListContainer = viewChild.required('trackListContainer', { read: ElementRef });
  filteredTracks = input.required<Track[]>({ alias: 'tracks' });
  currentTrackIndex = model.required<number>();

  constructor() {
    effect(() => {
      if (this.selectedTrack()) {
        this.selectedTrack().scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  selectedTrack = computed(() => {
    const container = this.trackListContainer().nativeElement;
    return container.children[this.currentTrackIndex()];
  });
}

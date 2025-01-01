import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, model, viewChild } from '@angular/core';
import { Track } from '../interfaces/track.interface';

@Component({
  selector: 'app-track-list',
  template: `
    <h3 class="text-xl font-semibold mb-2 text-center">Track List</h3>
    <div class="h-[200px] rounded-md border border-gray-700 p-4 overflow-y-auto custom-scrollbar"
        #trackListContainer>
        @for (track of filteredTracks(); track track.title) {
            <div class="p-2 cursor-pointer hover:bg-gray-700 rounded-md"
                [class.bg-gray-700]="$index === currentTrackIndex()" (click)="currentTrackIndex.set($index)">
                <p class="font-medium">{{ track.title }}</p>
                <p class="text-sm text-gray-400">{{ track.artist }}</p>
            </div>
        }
        @empty {
            <p class="text-gray-400">No tracks found</p>
        }
    </div>`,
  styleUrl: './track-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackListComponent {
  trackListContainer = viewChild.required<ElementRef>('trackListContainer');
  filteredTracks = input.required<Track[]>({ alias: 'tracks' });
  currentTrackIndex = model.required<number>();

  selectedTrack = computed(() => {
    const container = this.trackListContainer().nativeElement;
    return container.children[this.currentTrackIndex()];
  })

  constructor() {
    effect(() => {
      if (this.selectedTrack()) {
        this.selectedTrack().scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
}

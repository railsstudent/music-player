import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-music-player-filter-bar',
  imports: [FormsModule],
  template: `
    <div>
      <input type="text" placeholder="Search tracks..." [(ngModel)]="searchQuery"
          class="w-full p-2 rounded bg-gray-700 text-white" />
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicPlayerFilterBarComponent {
  searchQuery = model('')
}

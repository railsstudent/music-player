import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-music-player-filter-bar',
  imports: [FormsModule],
  templateUrl: './music-player-filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicPlayerFilterBarComponent {
  searchQuery = model('')
}

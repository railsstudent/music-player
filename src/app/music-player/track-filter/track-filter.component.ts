import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track-filter',
  imports: [FormsModule],
  template: `
    <div>
      <input type="text" placeholder="Search tracks..." [(ngModel)]="searchQuery"
        class="w-full p-2 rounded bg-gray-700 text-white" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackFilterComponent {
  searchQuery = model.required<string>();
}

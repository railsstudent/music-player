import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error',
  template: `
    @if (error()) {
      <div class="bg-red-500 p-4 rounded">
        <div class="flex items-center">
          <span class="material-icons mr-2">error_outline</span>
          <div>
            <h4 class="font-bold">Error</h4>
            <p>{{ error() }}</p>
          </div>
        </div>
      </div>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent {
  error = input<string | null>(null)
}

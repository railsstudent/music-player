import { ChangeDetectionStrategy, Component, computed, effect, input, linkedSignal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-progress-bar',
  imports: [FormsModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  currentTime = input(0);
  duration = input(0);
  progress = model.required<number>();

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

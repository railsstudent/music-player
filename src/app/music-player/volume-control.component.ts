import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-volume-control',
  imports: [FormsModule],
  templateUrl: './volume-control.component.html',
  styleUrl: './volume-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeControlComponent {
  volume = model(100);
  
  increaseVolume() {
    const newVolume = Math.min((this.volume() || 50) + 10, 100);
    this.volume.set(newVolume);
  }

  decreaseVolume() {
    const newVolume = Math.max((this.volume() || 50) - 10, 0);
    this.volume.set(newVolume);
  }
}

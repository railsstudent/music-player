import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicPlayerFilterBarComponent } from './music-player-filter-bar.component';

describe('MusicPlayerFilterBarComponent', () => {
  let component: MusicPlayerFilterBarComponent;
  let fixture: ComponentFixture<MusicPlayerFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicPlayerFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicPlayerFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

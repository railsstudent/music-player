import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackDurationComponent } from './track-duration.component';

describe('TrackDurationComponent', () => {
  let component: TrackDurationComponent;
  let fixture: ComponentFixture<TrackDurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackDurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

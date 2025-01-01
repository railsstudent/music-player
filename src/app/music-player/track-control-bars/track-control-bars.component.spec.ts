import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackControlBarsComponent } from './track-control-bars.component';

describe('TrackControlBarsComponent', () => {
  let component: TrackControlBarsComponent;
  let fixture: ComponentFixture<TrackControlBarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackControlBarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackControlBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

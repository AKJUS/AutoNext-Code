import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningMessageComponent } from './warning-message.component';

describe('WarningMessageComponent', () => {
  let component: WarningMessageComponent;
  let fixture: ComponentFixture<WarningMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarningMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

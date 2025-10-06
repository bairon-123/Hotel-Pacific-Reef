import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionistaCheckinPage } from './recepcionista-checkin.page';

describe('RecepcionistaCheckinPage', () => {
  let component: RecepcionistaCheckinPage;
  let fixture: ComponentFixture<RecepcionistaCheckinPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionistaCheckinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

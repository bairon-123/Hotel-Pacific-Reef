import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionistaReservasPage } from './recepcionista-reservas.page';

describe('RecepcionistaReservasPage', () => {
  let component: RecepcionistaReservasPage;
  let fixture: ComponentFixture<RecepcionistaReservasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionistaReservasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

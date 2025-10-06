import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionistaHabitacionesPage } from './recepcionista-habitaciones.page';

describe('RecepcionistaHabitacionesPage', () => {
  let component: RecepcionistaHabitacionesPage;
  let fixture: ComponentFixture<RecepcionistaHabitacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionistaHabitacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

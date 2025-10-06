import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionistaPagosPage } from './recepcionista-pagos.page';

describe('RecepcionistaPagosPage', () => {
  let component: RecepcionistaPagosPage;
  let fixture: ComponentFixture<RecepcionistaPagosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionistaPagosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionistaPage } from './recepcionista.page';

describe('RecepcionistaPage', () => {
  let component: RecepcionistaPage;
  let fixture: ComponentFixture<RecepcionistaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionistaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

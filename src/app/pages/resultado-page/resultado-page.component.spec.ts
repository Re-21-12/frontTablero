import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoPageComponent } from './resultado-page.component';

describe('ResultadoPageComponent', () => {
  let component: ResultadoPageComponent;
  let fixture: ComponentFixture<ResultadoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

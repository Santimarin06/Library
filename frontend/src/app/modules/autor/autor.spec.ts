import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Autor } from './autor';

describe('Autor', () => {
  let component: Autor;
  let fixture: ComponentFixture<Autor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Autor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Autor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Assign } from './assign';

describe('Assign', () => {
  let component: Assign;
  let fixture: ComponentFixture<Assign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assign],
    }).compileComponents();

    fixture = TestBed.createComponent(Assign);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

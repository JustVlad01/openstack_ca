import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarManagementComponent } from './car-management.component';

describe('CarManagementComponent', () => {
  let component: CarManagementComponent;
  let fixture: ComponentFixture<CarManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

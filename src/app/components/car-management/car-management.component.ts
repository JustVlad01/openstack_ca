import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService, Car } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-car-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './car-management.component.html',
  styleUrls: ['./car-management.component.css'],
})
export class CarManagementComponent implements OnInit {
  cars: Car[] = [];
  carForm: FormGroup;
  editingCarId: string | null = null;

  constructor(private fb: FormBuilder, private carService: CarService) {
    this.carForm = this.fb.group({
      brand: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      model: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      year: ['', [Validators.required, Validators.min(1870), Validators.max(new Date().getFullYear())]],
      mileage: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(params: { sortBy?: string; order?: string } = {}): void {
    this.carService.getCars(params).subscribe((cars: Car[]) => {
      this.cars = cars;
    });
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (value) {
      const [field, order] = value.split('-');
      this.loadCars({ sortBy: field, order });
    } else {
      this.loadCars(); // Reload without sorting if no value is selected
    }
  }

  submitCar(): void {
    if (this.carForm.valid) {
      const car: Car = this.carForm.value;
      if (this.editingCarId) {
        this.carService.updateCar(this.editingCarId, car).subscribe(() => {
          this.loadCars();
          this.resetForm();
        });
      } else {
        this.carService.createCar(car).subscribe(() => {
          this.loadCars();
          this.resetForm();
        });
      }
    }
  }

  editCar(car: Car): void {
    this.editingCarId = car._id || null;
    this.carForm.patchValue(car);
  }

  deleteCar(id: string): void {
    this.carService.deleteCar(id).subscribe(() => this.loadCars());
  }

  resetForm(): void {
    this.carForm.reset();
    this.editingCarId = null;
  }
}

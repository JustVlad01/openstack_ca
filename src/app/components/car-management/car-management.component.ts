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
  displayedCars: Car[] = [];
  carForm: FormGroup;
  editingCarId: string | null = null;

  // Pagination properties
  currentPage: number = 1;
  carsPerPage: number = 7;

  // Expose Math object for template
  Math = Math;

  // Search property
  searchQuery: string = '';

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
      this.filterAndPaginateCars();
    });
  }

  filterAndPaginateCars(): void {
    const filteredCars = this.cars.filter(car =>
      car.brand.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    const startIndex = (this.currentPage - 1) * this.carsPerPage;
    const endIndex = startIndex + this.carsPerPage;
    this.displayedCars = filteredCars.slice(startIndex, endIndex);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (value) {
      const [field, order] = value.split('-');
      this.loadCars({ sortBy: field, order });
    } else {
      this.loadCars();
    }
  }

  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.currentPage = 1; // Reset to the first page
    this.filterAndPaginateCars();
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
    this.carService.deleteCar(id).subscribe(() => {
      this.loadCars();
    });
  }

  resetForm(): void {
    this.carForm.reset();
    this.editingCarId = null;
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage * this.carsPerPage < this.cars.length) {
      this.currentPage++;
      this.filterAndPaginateCars();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterAndPaginateCars();
    }
  }
}

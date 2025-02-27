import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CarService, Car } from '../../services/car.service';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-car-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './car-management.component.html',
  styleUrls: ['./car-management.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class CarManagementComponent implements OnInit {
  cars: Car[] = [];
  displayedCars: Car[] = [];
  carForm: FormGroup;
  editingCarId: string | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Pagination properties
  currentPage: number = 1;
  carsPerPage: number = 7;

  // Expose Math object for template
  Math = Math;

  // Search property
  searchQuery: string = '';

  // Categories
  categories: string[] = [];
  selectedCategory: string = 'all';
  categorizedCars: { [category: string]: Car[] } = {};

  constructor(
    private fb: FormBuilder, 
    private carService: CarService,
    private authService: AuthService
  ) {
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
      this.categorizeCarsByBrand();
      this.filterAndPaginateCars();
    });
  }

  categorizeCarsByBrand(): void {
    // Extract unique brands for categories
    this.categories = [...new Set(this.cars.map(car => car.brand))].sort();
    
    // Group cars by brand
    this.categorizedCars = {};
    this.categories.forEach(category => {
      this.categorizedCars[category] = this.cars.filter(car => car.brand === category);
    });
  }

  filterAndPaginateCars(): void {
    let filteredCars = this.cars.filter(car =>
      car.brand.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    
    // Apply category filter if not showing all
    if (this.selectedCategory !== 'all') {
      filteredCars = filteredCars.filter(car => car.brand === this.selectedCategory);
    }
    
    const startIndex = (this.currentPage - 1) * this.carsPerPage;
    const endIndex = startIndex + this.carsPerPage;
    this.displayedCars = filteredCars.slice(startIndex, endIndex);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page
    this.filterAndPaginateCars();
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
      
      // Only allow admins to update cars
      if (this.editingCarId && this.isAdmin()) {
        this.carService.updateCar(this.editingCarId, car, this.selectedFile || undefined).subscribe(() => {
          this.loadCars();
          this.resetForm();
        });
      } else if (!this.editingCarId) {
        // Both users and admins can add new cars
        this.carService.createCar(car, this.selectedFile || undefined).subscribe(() => {
          this.loadCars();
          this.resetForm();
        });
      }
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  editCar(car: Car): void {
    // Only allow admins to edit cars
    if (this.isAdmin()) {
      this.editingCarId = car._id || null;
      this.carForm.patchValue(car);
      
      // Set image preview if car has an image
      if (car.imageUrl) {
        this.imagePreview = car.imageUrl;
      } else {
        this.imagePreview = null;
      }
      this.selectedFile = null;
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  deleteCar(id: string): void {
    // Only allow admins to delete cars
    if (this.isAdmin()) {
      this.carService.deleteCar(id).subscribe(() => {
        this.loadCars();
      });
    }
  }

  resetForm(): void {
    this.carForm.reset();
    this.editingCarId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  // Handle image loading errors
  handleImageError(car: Car): void {
    console.log('Image failed to load for car:', car);
    
    // If the image URL contains an S3 URL, try to refresh it
    if (car.imageUrl && car.imageUrl.includes('s3')) {
      const s3KeyMatch = car.imageUrl.match(/car-images\/[^?]+/);
      if (s3KeyMatch && s3KeyMatch[0]) {
        const s3Key = s3KeyMatch[0];
        console.log('Attempting to refresh image URL with key:', s3Key);
        
        // Try to refresh the image URL
        this.carService.refreshImageUrl(s3Key)
          .pipe(
            catchError(error => {
              console.error('Failed to refresh image URL:', error);
              // Set to empty string to show "No Image Available"
              car.imageUrl = '';
              return [];
            })
          )
          .subscribe(response => {
            if (response && response.imageUrl) {
              console.log('Image URL refreshed successfully');
              car.imageUrl = response.imageUrl;
            } else {
              // If no valid response, set to empty string to show "No Image Available"
              car.imageUrl = '';
            }
          });
      } else {
        // If we can't extract the S3 key, set to empty string
        car.imageUrl = '';
      }
    } else {
      // If not an S3 URL or other issue, set to empty string
      car.imageUrl = '';
    }
  }

  // Role-based access control methods
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isUser(): boolean {
    return this.authService.isUser();
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

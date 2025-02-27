import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Car {
  _id?: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private apiUrl = 'http://localhost:3000/api/v1/cars';
  private uploadUrl = 'http://localhost:3000/api/v1/upload';

  constructor(private http: HttpClient) {}

  getCars(params: { sortBy?: string; order?: string } = {}): Observable<Car[]> {
    let query = `${this.apiUrl}`;
    const queryParams = [];

    if (params.sortBy) queryParams.push(`sortBy=${params.sortBy}`);
    if (params.order) queryParams.push(`order=${params.order}`);

    if (queryParams.length) {
      query += `?${queryParams.join('&')}`;
    }

    return this.http.get<Car[]>(query).pipe(
      map(cars => {
        // For each car with an imageUrl, refresh the signed URL
        cars.forEach(car => {
          if (car.imageUrl && car.imageUrl.includes('s3')) {
            // Extract the s3Key from the URL if available
            const s3KeyMatch = car.imageUrl.match(/car-images\/[^?]+/);
            if (s3KeyMatch && s3KeyMatch[0]) {
              const s3Key = s3KeyMatch[0];
              // Refresh the signed URL
              this.refreshImageUrl(s3Key).subscribe(
                response => {
                  car.imageUrl = response.imageUrl;
                },
                error => {
                  console.error('Failed to refresh image URL:', error);
                }
              );
            }
          }
        });
        return cars;
      })
    );
  }

  // Add a method to refresh image URLs
  refreshImageUrl(s3Key: string): Observable<any> {
    return this.http.get(`${this.uploadUrl}/refresh?key=${s3Key}`);
  }

  createCar(car: Car, imageFile?: File): Observable<Car> {
    // If there's no image file, just create the car
    if (!imageFile) {
      return this.http.post<Car>(this.apiUrl, car);
    }

    // First upload the image
    return this.uploadImage(imageFile).pipe(
      switchMap((response: any) => {
        // Add the image URL to the car object
        car.imageUrl = response.imageUrl;
        // Then create the car with the image URL
        return this.http.post<Car>(this.apiUrl, car);
      })
    );
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(this.uploadUrl, formData);
  }

  updateCar(id: string, car: Car, imageFile?: File): Observable<Car> {
    // If there's no image file, just update the car
    if (!imageFile) {
      return this.http.put<Car>(`${this.apiUrl}/${id}`, car);
    }

    // First upload the image
    return this.uploadImage(imageFile).pipe(
      switchMap((response: any) => {
        // Add the image URL to the car object
        car.imageUrl = response.imageUrl;
        // Then update the car with the image URL
        return this.http.put<Car>(`${this.apiUrl}/${id}`, car);
      })
    );
  }

  deleteCar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

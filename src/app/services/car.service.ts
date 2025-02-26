import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Car {
  _id?: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private apiUrl = 'http://localhost:3000/api/v1/cars'; 

  constructor(private http: HttpClient) {}

  getCars(params: { sortBy?: string; order?: string } = {}): Observable<Car[]> {
    let query = `${this.apiUrl}`;
    const queryParams = [];

    if (params.sortBy) queryParams.push(`sortBy=${params.sortBy}`);
    if (params.order) queryParams.push(`order=${params.order}`);

    if (queryParams.length) {
      query += `?${queryParams.join('&')}`;
    }

    return this.http.get<Car[]>(query);
  }

  createCar(car: Car): Observable<Car> {
    return this.http.post<Car>(this.apiUrl, car);
  }

  updateCar(id: string, car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/${id}`, car);
  }

  deleteCar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

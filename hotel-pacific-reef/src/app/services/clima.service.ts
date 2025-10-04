import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

export interface ClimaAhora {
  temperature: number;
  humidity: number;
  time?: string;
}

@Injectable({ providedIn: 'root' })
export class ClimaService {
  constructor(private http: HttpClient) {}

  /** Obtiene clima actual desde Open-Meteo (sin backend) */
  getAhora(lat: number, lon: number): Observable<ClimaAhora> {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m&timezone=auto`;

    return this.http.get<any>(url).pipe(
      map(res => ({
        temperature: res?.current?.temperature_2m,
        humidity: res?.current?.relative_humidity_2m,
        time: res?.current?.time
      })),
      catchError(err => {
        console.error('ClimaService error:', err);
        return throwError(() => new Error('No se pudo cargar el clima.'));
      })
    );
  }
}

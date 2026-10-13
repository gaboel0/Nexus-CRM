import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { MOCK_ACTIVITIES, MOCK_CUSTOMERS, MOCK_DEALS } from '../mocks/mock-data';
import { Activity, Customer, Deal } from '../models/crm.models';

/** Fonte de dados mockada. Retorna Observables para facilitar a troca por HttpClient depois. */
@Injectable({ providedIn: 'root' })
export class CrmDataService {
  private readonly latency = 300;

  getCustomers(): Observable<Customer[]> {
    return of(MOCK_CUSTOMERS).pipe(delay(this.latency));
  }

  getDeals(): Observable<Deal[]> {
    return of(MOCK_DEALS).pipe(delay(this.latency));
  }

  getActivities(): Observable<Activity[]> {
    return of(MOCK_ACTIVITIES).pipe(delay(this.latency));
  }
}

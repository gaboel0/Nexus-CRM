import { TestBed } from '@angular/core/testing';
import { MOCK_ACTIVITIES, MOCK_CUSTOMERS, MOCK_DEALS } from '../mocks/mock-data';
import { CrmDataService } from './crm-data.service';

describe('CrmDataService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  afterEach(() => vi.useRealTimers());

  it('entrega clientes, negócios e atividades mockados após a latência simulada', () => {
    const service = TestBed.inject(CrmDataService);
    const customers = vi.fn();
    const deals = vi.fn();
    const activities = vi.fn();

    service.getCustomers().subscribe(customers);
    service.getDeals().subscribe(deals);
    service.getActivities().subscribe(activities);
    expect(customers).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(customers).toHaveBeenCalledWith(MOCK_CUSTOMERS);
    expect(deals).toHaveBeenCalledWith(MOCK_DEALS);
    expect(activities).toHaveBeenCalledWith(MOCK_ACTIVITIES);
  });
});

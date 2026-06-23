import { ServicePrice } from '../entities/service-price.model';

export const IServicePriceRepositoryToken = 'IServicePriceRepository';

export interface IServicePriceRepository {
  findByServiceId(serviceId: string): Promise<ServicePrice[]>;
  findByServiceAndType(serviceId: string, priceType: string): Promise<ServicePrice | null>;
  save(price: ServicePrice): Promise<ServicePrice>;
  deleteByServiceAndType(serviceId: string, priceType: string): Promise<void>;
}

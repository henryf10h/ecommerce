import type { Product } from '../../domain/entities/Product.js';
import type { Order } from '../../domain/entities/Order.js';
import type { Payment } from '../../domain/entities/Payment.js';
import type { ProductId, OrderId, PaymentId } from '../../domain/value-objects/ids.js';
import type { OrderStatus } from '../../domain/entities/Order.js';

export interface ProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findAll(): Promise<Product[]>;
}

export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  updateStatus(id: OrderId, status: OrderStatus): Promise<void>;
}

export interface PaymentRepository {
  findById(id: PaymentId): Promise<Payment | null>;
  save(payment: Payment): Promise<void>;
  updateStatus(id: PaymentId, status: string): Promise<void>;
}

export const VERSION = '0.0.0';

// Domain
export { Money, ProductId, OrderId, PaymentId } from './domain/index.js';
export type { Branded } from './domain/index.js';
export { Product, Order, LineItem, Payment, Settlement } from './domain/index.js';
export type { OrderStatus, PaymentStatus } from './domain/index.js';
export { OrderPlaced, PaymentConfirmed } from './domain/index.js';
export type { DomainEvent } from './domain/index.js';

// Application
export { PricingService, OrderService } from './application/index.js';
export type { ProductRepository, OrderRepository, PaymentRepository } from './application/index.js';

// Errors
export { ValidationError, NotFoundError, InsufficientFundsError } from './errors.js';
export type { DomainError } from './errors.js';

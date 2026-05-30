export { Money } from './value-objects/Money.js';
export { ProductId, OrderId, PaymentId } from './value-objects/ids.js';
export type { Branded } from './value-objects/ids.js';

export { Product } from './entities/Product.js';
export { Order, LineItem } from './entities/Order.js';
export type { OrderStatus } from './entities/Order.js';
export { Payment, Settlement } from './entities/Payment.js';
export type { PaymentStatus } from './entities/Payment.js';

export { OrderPlaced, PaymentConfirmed } from './events.js';
export type { DomainEvent } from './events.js';

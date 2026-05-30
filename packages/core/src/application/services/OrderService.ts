import { Order, LineItem } from '../../domain/entities/Order.js';
import { OrderPlaced } from '../../domain/events.js';
import { OrderId } from '../../domain/value-objects/ids.js';

export const OrderService = {
  createOrder(items: LineItem[]): { order: Order; event: OrderPlaced } {
    const id = OrderId(crypto.randomUUID());
    const order = new Order({ id, items });
    const event = new OrderPlaced(order.id, order.total);
    return { order, event };
  },
};

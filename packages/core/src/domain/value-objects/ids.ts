export type Branded<T, B extends string> = T & { __brand: B };

export type ProductId = Branded<string, 'ProductId'>;
export type OrderId = Branded<string, 'OrderId'>;
export type PaymentId = Branded<string, 'PaymentId'>;

export function ProductId(value: string): ProductId {
  return value as ProductId;
}

export function OrderId(value: string): OrderId {
  return value as OrderId;
}

export function PaymentId(value: string): PaymentId {
  return value as PaymentId;
}

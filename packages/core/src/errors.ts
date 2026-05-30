export type DomainError =
  | { type: 'validation'; message: string; field?: string }
  | { type: 'not-found'; message: string; entity: string; id: string }
  | { type: 'insufficient-funds'; message: string; balance: bigint; required: bigint };

export function ValidationError(message: string, field?: string): DomainError {
  return field !== undefined
    ? { type: 'validation', message, field }
    : { type: 'validation', message };
}

export function NotFoundError(entity: string, id: string): DomainError {
  return {
    type: 'not-found',
    message: `${entity} with id ${id} not found`,
    entity,
    id,
  };
}

export function InsufficientFundsError(
  balance: bigint,
  required: bigint,
): DomainError {
  return {
    type: 'insufficient-funds',
    message: `Insufficient funds: balance ${Number(balance) / 1_000_000} USDC, required ${Number(required) / 1_000_000} USDC`,
    balance,
    required,
  };
}

// Types and calculation utilities for Driver Payment records

export interface DriverPayment {
  id: number;
  sno: number | null;
  roNum: string;
  inNo: string;
  lrNo: number | null;
  date: string;
  from: string;
  to: string;
  consignee: string;
  consigner: string;
  vehicleNo: string;
  vehicleType: string;
  driverNo: string;
  perTonCost: number;
  tonne: number;
  addAmt: number;
  hire: number;       // Calculated: perTonCost * tonne + addAmt
  cost: number;
  advance: number;
  advanceDate: string;
  deducAmt: number;
  balance: number;    // Calculated: cost - advance - deducAmt
  balanceDate: string;
  profit: number;     // Calculated: hire - cost
  margin: number;     // Calculated: (profit / hire) * 100
  podStatus: string;
  remarks: string;
  placedBy: string;
}

// Fields the user can enter/edit (everything except calculated fields + id)
export type DriverPaymentInput = Omit<DriverPayment, 'id' | 'hire' | 'balance' | 'profit' | 'margin'>;

// Calculated field names
export const CALCULATED_FIELDS = ['hire', 'balance', 'profit', 'margin'] as const;

/***************************  CALCULATION UTILITIES  ***************************/

/** HIRE = perTonCost × tonne + addAmt */
export function calcHire(perTonCost: number, tonne: number, addAmt: number): number {
  return perTonCost * tonne + (addAmt || 0);
}

/** BALANCE = cost − advance − deducAmt */
export function calcBalance(cost: number, advance: number, deducAmt: number): number {
  return (cost || 0) - (advance || 0) - (deducAmt || 0);
}

/** PROFIT = hire − cost */
export function calcProfit(hire: number, cost: number): number {
  return hire - (cost || 0);
}

/** MARGIN = (profit / hire) × 100 */
export function calcMargin(profit: number, hire: number): number {
  if (!hire || hire === 0) return 0;
  return (profit / hire) * 100;
}

/** Apply all calculations to a payment record */
export function applyCalculations<T extends Partial<DriverPayment>>(
  payment: T
): T & { hire: number; balance: number; profit: number; margin: number } {
  const hire = calcHire(payment.perTonCost || 0, payment.tonne || 0, payment.addAmt || 0);
  const profit = calcProfit(hire, payment.cost || 0);
  const balance = calcBalance(payment.cost || 0, payment.advance || 0, payment.deducAmt || 0);
  const margin = calcMargin(profit, hire);

  return {
    ...payment,
    hire,
    balance,
    profit,
    margin
  };
}

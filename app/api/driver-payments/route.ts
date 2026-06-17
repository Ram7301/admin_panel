import { NextResponse } from 'next/server';
import { driverPayments } from '@/data/driverPayments';
import { applyCalculations } from '@/types/driverPayment';
import type { DriverPayment } from '@/types/driverPayment';

// In-memory store (mutable copy of the initial data)
let payments: DriverPayment[] = [...driverPayments];

/** Expose the payments array so the [id] route can access it */
export function getPayments() {
  return payments;
}

export function setPayments(updated: DriverPayment[]) {
  payments = updated;
}

/***************************  GET /api/driver-payments  ***************************/

export async function GET() {
  return NextResponse.json({
    success: true,
    data: payments,
    total: payments.length
  });
}

/***************************  POST /api/driver-payments  ***************************/

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generate next id
    const maxId = payments.reduce((max, p) => Math.max(max, p.id), 0);
    const newPayment: DriverPayment = applyCalculations({
      id: maxId + 1,
      sno: maxId + 1,
      roNum: body.roNum ?? '',
      inNo: body.inNo ?? '',
      lrNo: body.lrNo ?? null,
      date: body.date ?? '',
      from: body.from ?? '',
      to: body.to ?? '',
      consignee: body.consignee ?? '',
      consigner: body.consigner ?? '',
      vehicleNo: body.vehicleNo ?? '',
      vehicleType: body.vehicleType ?? '',
      driverNo: body.driverNo ?? '',
      perTonCost: Number(body.perTonCost) || 0,
      tonne: Number(body.tonne) || 0,
      addAmt: Number(body.addAmt) || 0,
      cost: Number(body.cost) || 0,
      advance: Number(body.advance) || 0,
      advanceDate: body.advanceDate ?? '',
      deducAmt: Number(body.deducAmt) || 0,
      balanceDate: body.balanceDate ?? '',
      podStatus: body.podStatus ?? '',
      remarks: body.remarks ?? '',
      placedBy: body.placedBy ?? ''
    });

    payments.push(newPayment);

    return NextResponse.json({ success: true, data: newPayment }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getPayments, setPayments } from '../route';
import { applyCalculations } from '@/types/driverPayment';

/***************************  GET /api/driver-payments/[id]  ***************************/

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payments = getPayments();
  const payment = payments.find((p) => p.id === Number(id));

  if (!payment) {
    return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: payment });
}

/***************************  PUT /api/driver-payments/[id]  ***************************/

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payments = getPayments();
  const index = payments.findIndex((p) => p.id === Number(id));

  if (index === -1) {
    return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const existing = payments[index];

    // Merge editable fields, then recalculate
    const updated = applyCalculations({
      ...existing,
      sno: body.sno !== undefined ? body.sno : existing.sno,
      roNum: body.roNum !== undefined ? body.roNum : existing.roNum,
      inNo: body.inNo !== undefined ? body.inNo : existing.inNo,
      lrNo: body.lrNo !== undefined ? body.lrNo : existing.lrNo,
      date: body.date !== undefined ? body.date : existing.date,
      from: body.from !== undefined ? body.from : existing.from,
      to: body.to !== undefined ? body.to : existing.to,
      consignee: body.consignee !== undefined ? body.consignee : existing.consignee,
      consigner: body.consigner !== undefined ? body.consigner : existing.consigner,
      vehicleNo: body.vehicleNo !== undefined ? body.vehicleNo : existing.vehicleNo,
      vehicleType: body.vehicleType !== undefined ? body.vehicleType : existing.vehicleType,
      driverNo: body.driverNo !== undefined ? body.driverNo : existing.driverNo,
      perTonCost: body.perTonCost !== undefined ? Number(body.perTonCost) : existing.perTonCost,
      tonne: body.tonne !== undefined ? Number(body.tonne) : existing.tonne,
      addAmt: body.addAmt !== undefined ? Number(body.addAmt) : existing.addAmt,
      cost: body.cost !== undefined ? Number(body.cost) : existing.cost,
      advance: body.advance !== undefined ? Number(body.advance) : existing.advance,
      advanceDate: body.advanceDate !== undefined ? body.advanceDate : existing.advanceDate,
      deducAmt: body.deducAmt !== undefined ? Number(body.deducAmt) : existing.deducAmt,
      balanceDate: body.balanceDate !== undefined ? body.balanceDate : existing.balanceDate,
      podStatus: body.podStatus !== undefined ? body.podStatus : existing.podStatus,
      remarks: body.remarks !== undefined ? body.remarks : existing.remarks,
      placedBy: body.placedBy !== undefined ? body.placedBy : existing.placedBy
    });

    payments[index] = updated;
    setPayments(payments);

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}

/***************************  DELETE /api/driver-payments/[id]  ***************************/

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payments = getPayments();
  const index = payments.findIndex((p) => p.id === Number(id));

  if (index === -1) {
    return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
  }

  payments.splice(index, 1);
  setPayments(payments);

  return NextResponse.json({ success: true, message: 'Payment deleted' });
}

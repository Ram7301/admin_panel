'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';

// @mui
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import { alpha, useTheme } from '@mui/material/styles';

// @tabler
import { IconX, IconCalculator } from '@tabler/icons-react';

// @project
import type { DriverPayment } from '@/types/driverPayment';
import { calcHire, calcBalance, calcProfit, calcMargin } from '@/types/driverPayment';

/***************************  TYPES  ***************************/

interface PaymentSidePanelProps {
  open: boolean;
  onClose: () => void;
  payment: DriverPayment | null; // null = create mode
  onSave: (data: Partial<DriverPayment>) => Promise<void>;
  saving?: boolean;
}

const VEHICLE_TYPES = ['6W', '10W', '12W', '14W', '16W'];
const POD_STATUSES = ['', 'COLLECTED', 'PENDING', 'NOT SEND'];

/***************************  COMPONENT  ***************************/

export default function PaymentSidePanel({ open, onClose, payment, onSave, saving }: PaymentSidePanelProps) {
  const theme = useTheme();
  const isEdit = !!payment;

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<Partial<DriverPayment>>({
    defaultValues: getDefaults(payment)
  });

  // Reset form when payment changes
  useEffect(() => {
    reset(getDefaults(payment));
  }, [payment, reset]);

  // Watch fields for live calculation
  const perTonCost = watch('perTonCost') || 0;
  const tonne = watch('tonne') || 0;
  const addAmt = watch('addAmt') || 0;
  const cost = watch('cost') || 0;
  const advance = watch('advance') || 0;
  const deducAmt = watch('deducAmt') || 0;

  // Live calculated values
  const liveCalc = useMemo(() => {
    const hire = calcHire(Number(perTonCost), Number(tonne), Number(addAmt));
    const profit = calcProfit(hire, Number(cost));
    const balance = calcBalance(Number(cost), Number(advance), Number(deducAmt));
    const margin = calcMargin(profit, hire);
    return { hire, profit, balance, margin };
  }, [perTonCost, tonne, addAmt, cost, advance, deducAmt]);

  const onSubmit = async (data: Partial<DriverPayment>) => {
    await onSave(data);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 480 },
            p: 0,
            bgcolor: 'background.default'
          }
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isEdit ? `Edit Payment #${payment.sno || payment.id}` : 'New Payment'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </Box>

      {/* Live Calculations Banner */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: alpha(theme.palette.success.main, 0.06),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
          <IconCalculator size={16} color={theme.palette.success.main} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main', textTransform: 'uppercase' }}>
            Auto-Calculated
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
          <Chip
            label={`Hire: ₹${liveCalc.hire.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Profit: ₹${liveCalc.profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            size="small"
            color={liveCalc.profit >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
          <Chip
            label={`Balance: ₹${liveCalc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            size="small"
            color={liveCalc.balance >= 0 ? 'info' : 'error'}
            variant="outlined"
          />
          <Chip
            label={`Margin: ${liveCalc.margin.toFixed(2)}%`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ p: 3, flex: 1, overflow: 'auto' }}
      >
        <Stack spacing={2.5}>
          {/* Trip Info */}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Trip Information
          </Typography>

          <Stack direction="row" spacing={2}>
            {/* <Controller
              name="sno"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ''} label="S.No" size="small" type="number" fullWidth />
              )}
            /> */}
            <Controller
              name="lrNo"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ''} label="LR No" size="small" type="number" fullWidth />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Controller
              name="roNum"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="RO Number" size="small" fullWidth />
              )}
            />
            <Controller
              name="inNo"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Invoice No" size="small" fullWidth />
              )}
            />
          </Stack>

          <Controller
            name="date"
            control={control}
            rules={{ required: 'Date is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date"
                size="small"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.date}
                helperText={errors.date?.message}
              />
            )}
          />

          <Stack direction="row" spacing={2}>
            <Controller
              name="from"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="From" size="small" fullWidth />
              )}
            />
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="To" size="small" fullWidth />
              )}
            />
          </Stack>

          <Divider />

          {/* Consignment */}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Consignment
          </Typography>

          <Controller
            name="consignee"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Consignee" size="small" fullWidth />
            )}
          />
          <Controller
            name="consigner"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Consigner" size="small" fullWidth />
            )}
          />

          <Divider />

          {/* Vehicle & Driver */}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Vehicle & Driver
          </Typography>

          <Stack direction="row" spacing={2}>
            <Controller
              name="vehicleNo"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Vehicle No" size="small" fullWidth />
              )}
            />
            <Controller
              name="vehicleType"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Vehicle Type" size="small" fullWidth select>
                  {VEHICLE_TYPES.map((vt) => (
                    <MenuItem key={vt} value={vt}>{vt}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>

          <Controller
            name="driverNo"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Driver Phone" size="small" fullWidth />
            )}
          />

          <Divider />

          {/* Cost & Payment */}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Cost & Payment
          </Typography>

          <Stack direction="row" spacing={2}>
            <Controller
              name="perTonCost"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Per Ton Cost (₹)" size="small" type="number" fullWidth />
              )}
            />
            <Controller
              name="tonne"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Tonne" size="small" type="number" fullWidth
                  slotProps={{ htmlInput: { step: '0.01' } }}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Controller
              name="addAmt"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Add Amount (₹)" size="small" type="number" fullWidth />
              )}
            />
            <Controller
              name="cost"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Driver Cost (₹)" size="small" type="number" fullWidth />
              )}
            />
          </Stack>

          <Divider />

          {/* Advance & Balance */}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Advance & Balance
          </Typography>

          <Stack direction="row" spacing={2}>
            <Controller
              name="advance"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Advance (₹)" size="small" type="number" fullWidth />
              )}
            />
            <Controller
              name="advanceDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Advance Date"
                  size="small"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Controller
              name="deducAmt"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Deduction (₹)" size="small" type="number" fullWidth />
              )}
            />
            <Controller
              name="balanceDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Balance Date"
                  size="small"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Stack>

          <Divider />

          {/* Status & Remarks */}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Status
          </Typography>

          <Stack direction="row" spacing={2}>
            <Controller
              name="podStatus"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="POD Status" size="small" fullWidth select>
                  {POD_STATUSES.map((s) => (
                    <MenuItem key={s || 'none'} value={s}>{s || '— None —'}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="placedBy"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Placed By" size="small" fullWidth />
              )}
            />
          </Stack>

          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Remarks" size="small" fullWidth multiline rows={2} />
            )}
          />
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ mt: 4, mb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={saving}
            sx={{ py: 1.2 }}
          >
            {saving ? 'Saving...' : isEdit ? 'Update Payment' : 'Create Payment'}
          </Button>
          <Button variant="outlined" fullWidth onClick={onClose} sx={{ py: 1.2 }}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

/***************************  HELPERS  ***************************/

function formatDateForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  if (dateStr.includes(' ')) {
    return dateStr.split(' ')[0];
  }
  return dateStr;
}

function getDefaults(payment: DriverPayment | null): Partial<DriverPayment> {
  if (payment) {
    return {
      ...payment,
      date: formatDateForInput(payment.date),
      advanceDate: formatDateForInput(payment.advanceDate),
      balanceDate: formatDateForInput(payment.balanceDate)
    };
  }
  return {
    sno: null,
    roNum: '',
    inNo: '',
    lrNo: null,
    date: new Date().toISOString().split('T')[0],
    from: 'Coimbatore',
    to: '',
    consignee: '',
    consigner: '',
    vehicleNo: '',
    vehicleType: '10W',
    driverNo: '',
    perTonCost: 0,
    tonne: 0,
    addAmt: 0,
    cost: 0,
    advance: 0,
    advanceDate: '',
    deducAmt: 0,
    balanceDate: '',
    podStatus: '',
    remarks: '',
    placedBy: ''
  };
}

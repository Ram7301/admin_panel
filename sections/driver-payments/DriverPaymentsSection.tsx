'use client';

import { useState, useCallback, useMemo } from 'react';

// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { alpha, useTheme } from '@mui/material/styles';
import {
  DataGrid,
  Toolbar,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  QuickFilter,
  QuickFilterControl,
  type GridColDef,
  type GridRenderCellParams
} from '@mui/x-data-grid';

// @tabler
import { IconPlus, IconEdit, IconTrash, IconTruck } from '@tabler/icons-react';

// @project
import { useDriverPayments } from '@/hooks/useDriverPayments';
import type { DriverPayment } from '@/types/driverPayment';
import PaymentSidePanel from './PaymentSidePanel';
import { useSnackbar } from 'notistack';

/***************************  COMPONENT  ***************************/

export default function DriverPaymentsSection() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { payments, isLoading, createPayment, updatePayment, deletePayment } = useDriverPayments();

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<DriverPayment | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  // Summary stats
  const stats = useMemo(() => {
    const withHire = payments.filter((p) => p.hire > 0);
    return {
      totalHire: withHire.reduce((sum, p) => sum + p.hire, 0),
      totalCost: withHire.reduce((sum, p) => sum + p.cost, 0),
      totalProfit: withHire.reduce((sum, p) => sum + p.profit, 0),
      avgMargin: withHire.length > 0 ? withHire.reduce((sum, p) => sum + p.margin, 0) / withHire.length : 0,
      totalEntries: payments.length,
      collected: payments.filter((p) => p.podStatus === 'COLLECTED').length
    };
  }, [payments]);

  const handleEdit = useCallback((payment: DriverPayment) => {
    setSelectedPayment(payment);
    setPanelOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedPayment(null);
    setPanelOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
    setSelectedPayment(null);
  }, []);

  const handleSave = useCallback(
    async (data: Partial<DriverPayment>) => {
      setSaving(true);
      try {
        if (selectedPayment) {
          await updatePayment(selectedPayment.id, data);
          enqueueSnackbar('Payment updated successfully', { variant: 'success' });
        } else {
          await createPayment(data);
          enqueueSnackbar('Payment added successfully', { variant: 'success' });
        }
        handleClose();
      } catch (error) {
        enqueueSnackbar('Failed to save payment', { variant: 'error' });
      } finally {
        setSaving(false);
      }
    },
    [selectedPayment, updatePayment, createPayment, handleClose, enqueueSnackbar]
  );

  const handleDelete = useCallback((id: number) => {
    setPaymentToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (paymentToDelete === null) return;
    try {
      await deletePayment(paymentToDelete);
      enqueueSnackbar('Payment deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete payment', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  }, [deletePayment, paymentToDelete, enqueueSnackbar]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setPaymentToDelete(null);
  }, []);

  // Custom toolbar rendered inside the DataGrid
  // Must be a stable component reference — useMemo preserves identity across renders
  const CustomToolbar = useMemo(
    () =>
      function PaymentsToolbar() {
        return (
          <Toolbar
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              height: 'auto',
              minHeight: 'auto',
              flex: 'none'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <IconTruck size={22} color={theme.palette.primary.main} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Driver Payments
              </Typography>
              <Chip label={`${payments.length} records`} size="small" variant="outlined" />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
              <QuickFilter debounceMs={300} defaultExpanded>
                <QuickFilterControl
                  placeholder="Search..."
                  size="small"
                />
              </QuickFilter>
              {/* <GridToolbarColumnsButton />
              <GridToolbarFilterButton />*/}
              <GridToolbarExport />
              <Button
                variant="contained"
                size="small"
                startIcon={<IconPlus size={16} />}
                onClick={handleCreate}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add Payment
              </Button>
            </Stack>
          </Toolbar>
        );
      },
    [theme, payments.length, handleCreate]
  );

  // Column definitions
  const columns: GridColDef<DriverPayment>[] = useMemo(
    () => [
      { field: 'id', headerName: 'ID', minWidth: 50 },
      { field: 'roNum', headerName: 'RO No.', minWidth: 120 },
      { field: 'inNo', headerName: 'Inv No.', minWidth: 120 },
      { field: 'lrNo', headerName: 'LR', minWidth: 60 },
      {
        field: 'date',
        headerName: 'Date',
        minWidth: 105,
        renderCell: (params: GridRenderCellParams<DriverPayment>) => {
          if (!params.value) return '—';
          const d = new Date(params.value as string);
          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        }
      },
      { field: 'from', headerName: 'From', minWidth: 110 },
      { field: 'to', headerName: 'To', minWidth: 120 },
      { field: 'consignee', headerName: 'Consignee', minWidth: 170, flex: 1 },
      { field: 'consigner', headerName: 'Consigner', minWidth: 170, flex: 1 },
      { field: 'vehicleNo', headerName: 'Vehicle No', minWidth: 120 },
      { field: 'driverNo', headerName: 'Driver No', minWidth: 100 },
      { field: 'vehicleType', headerName: 'Type', minWidth: 70 },
      {
        field: 'perTonCost',
        headerName: 'Per Ton Cost',
        minWidth: 130,
        type: 'number',
        renderCell: (params: GridRenderCellParams<DriverPayment>) =>
          params.value ? `₹${Number(params.value).toLocaleString('en-IN')}` : '—'
      },
      {
        field: 'tonne',
        headerName: 'Tons',
        width: 70,
        type: 'number'
      },
      {
        field: 'hire',
        headerName: 'Hire',
        width: 110,
        type: 'number',
        cellClassName: 'calculated-cell',
        renderCell: (params: GridRenderCellParams<DriverPayment>) =>
          params.value ? (
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', height: '100%', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
              ₹{Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </Typography>
          ) : '—'
      },
      {
        field: 'cost',
        headerName: 'Cost',
        width: 100,
        type: 'number',
        renderCell: (params: GridRenderCellParams<DriverPayment>) =>
          params.value ? `₹${Number(params.value).toLocaleString('en-IN')}` : '—'
      },
      {
        field: 'advance',
        headerName: 'Advance',
        width: 100,
        type: 'number',
        renderCell: (params: GridRenderCellParams<DriverPayment>) =>
          params.value ? `₹${Number(params.value).toLocaleString('en-IN')}` : '—'
      },
      {
        field: 'deducAmt',
        headerName: 'Deducted',
        width: 100,
        type: 'number',
        renderCell: (params: GridRenderCellParams<DriverPayment>) =>
          params.value ? `₹${Number(params.value).toLocaleString('en-IN')}` : '—'
      },
      {
        field: 'balance',
        headerName: 'Balance',
        width: 100,
        type: 'number',
        cellClassName: 'calculated-cell',
        renderCell: (params: GridRenderCellParams<DriverPayment>) => {
          const val = Number(params.value);
          if (!val && val !== 0) return '—';
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: val < 0 ? 'error.main' : val === 0 ? 'text.disabled' : 'info.main', height: '100%', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}
            >
              ₹{val.toLocaleString('en-IN')}
            </Typography>
          );
        }
      },
      {
        field: 'profit',
        headerName: 'Profit',
        width: 100,
        type: 'number',
        cellClassName: 'calculated-cell',
        renderCell: (params: GridRenderCellParams<DriverPayment>) => {
          const val = Number(params.value);
          if (!val) return '—';
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: val >= 0 ? 'success.main' : 'error.main', height: '100%', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}
            >
              ₹{val.toLocaleString('en-IN')}
            </Typography>
          );
        }
      },
      {
        field: 'margin',
        headerName: 'Margin',
        width: 85,
        type: 'number',
        cellClassName: 'calculated-cell',
        renderCell: (params: GridRenderCellParams<DriverPayment>) => {
          const val = Number(params.value);
          if (!val) return '—';
          return (
            <Chip
              label={`${val.toFixed(1)}%`}
              size="small"
              color={val >= 20 ? 'success' : val >= 15 ? 'warning' : 'error'}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.75rem', height: '40px' }}
            />
          );
        }
      },
      {
        field: 'podStatus',
        headerName: 'POD',
        width: 110,
        renderCell: (params: GridRenderCellParams<DriverPayment>) => {
          if (!params.value) return '—';
          return (
            <Chip
              label={params.value as string}
              size="small"
              color={params.value === 'COLLECTED' ? 'success' : 'default'}
              variant="filled"
              sx={{ fontSize: '0.7rem', height: '40px' }}
            />
          );
        }
      },
      { field: 'placedBy', headerName: 'By', width: 80 },
      {
        field: 'actions',
        headerName: '',
        width: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<DriverPayment>) => (
          <Stack direction="row" spacing={0.5} sx={{ height: '100%', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary">
                <IconEdit size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
                <IconTrash size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [handleEdit, handleDelete]
  );

  return (
    <Box>
      {/* Summary Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
        <StatCard label="Total Hire" value={`₹${stats.totalHire.toLocaleString('en-IN')}`} color={theme.palette.primary.main} />
        <StatCard label="Total Cost" value={`₹${stats.totalCost.toLocaleString('en-IN')}`} color={theme.palette.info.main} />
        <StatCard label="Total Profit" value={`₹${stats.totalProfit.toLocaleString('en-IN')}`} color={theme.palette.success.main} />
        <StatCard label="Avg Margin" value={`${stats.avgMargin.toFixed(1)}%`} color={theme.palette.warning.main} />
        <StatCard label="Entries" value={String(stats.totalEntries)} color={theme.palette.text.secondary} />
        <StatCard label="POD Collected" value={String(stats.collected)} color={theme.palette.success.main} />
      </Stack>

      {/* DataGrid with Custom Toolbar */}
      <Card
        variant="outlined"
        elevation={3}
        sx={{
          '& .calculated-cell': {
            bgcolor: alpha(theme.palette.primary.main, 0.03)
          }
        }}
      >
        <DataGrid
          rows={payments}
          columns={columns}
          loading={isLoading}
          showToolbar
          slots={{ toolbar: CustomToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } }
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          onRowDoubleClick={(params) => handleEdit(params.row as DriverPayment)}
          sx={{
            border: 0,
            height: 'calc(100vh - 250px)',
            '& .MuiDataGrid-toolbar': {
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              borderBottom: `1px solid ${theme.palette.divider}`
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: `2px solid ${theme.palette.divider}`
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.82rem'
            }
          }}
        />
      </Card>

      {/* Side Panel */}
      <PaymentSidePanel
        open={panelOpen}
        onClose={handleClose}
        payment={selectedPayment}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/***************************  STAT CARD  ***************************/

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card
      variant="outlined"
      sx={{
        px: 2.5,
        py: 1.5,
        minWidth: 140,
        flex: '1 1 auto',
        borderLeft: `3px solid ${color}`
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color }}>
        {value}
      </Typography>
    </Card>
  );
}

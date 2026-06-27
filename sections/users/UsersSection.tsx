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
import Avatar from '@mui/material/Avatar';
import { alpha, useTheme } from '@mui/material/styles';
import {
  DataGrid,
  Toolbar,
  GridToolbarExport,
  QuickFilter,
  QuickFilterControl,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';

// @tabler
import { IconPlus, IconEdit, IconTrash, IconUsers } from '@tabler/icons-react';

// @project
import { useUsers } from '@/hooks/useUsers';
import type { User, CreateUserInput, UpdateUserInput } from '@/types/user';
import UserSidePanel from './UserSidePanel';
import { useSnackbar } from 'notistack';

/***************************  COMPONENT  ***************************/

export default function UsersSection() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Summary stats
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      inactiveUsers: users.filter((u) => !u.isActive).length,
      verifiedEmails: users.filter((u) => u.isEmailVerified).length,
    };
  }, [users]);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setPanelOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedUser(null);
    setPanelOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
    setSelectedUser(null);
  }, []);

  const handleSave = useCallback(
    async (data: CreateUserInput | UpdateUserInput) => {
      setSaving(true);
      try {
        if (selectedUser) {
          const result = await updateUser(selectedUser.userId, data as UpdateUserInput);
          if (result.success) {
            enqueueSnackbar('User updated successfully', { variant: 'success' });
            handleClose();
          } else {
            enqueueSnackbar(result.message || 'Failed to update user', { variant: 'error' });
          }
        } else {
          const result = await createUser(data as CreateUserInput);
          if (result.success) {
            enqueueSnackbar('User created successfully', { variant: 'success' });
            handleClose();
          } else {
            enqueueSnackbar(result.message || 'Failed to create user', { variant: 'error' });
          }
        }
      } catch (error) {
        enqueueSnackbar('An error occurred', { variant: 'error' });
      } finally {
        setSaving(false);
      }
    },
    [selectedUser, updateUser, createUser, handleClose, enqueueSnackbar]
  );

  const handleDelete = useCallback((id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (userToDelete === null) return;
    try {
      const result = await deleteUser(userToDelete);
      if (result.success) {
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
      } else {
        enqueueSnackbar(result.message || 'Failed to delete user', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [deleteUser, userToDelete, enqueueSnackbar]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  // Custom toolbar
  const CustomToolbar = useMemo(
    () =>
      function UsersToolbar() {
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
              flex: 'none',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <IconUsers size={22} color={theme.palette.primary.main} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Users
              </Typography>
              <Chip label={`${users.length} users`} size="small" variant="outlined" />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
              <QuickFilter debounceMs={300} defaultExpanded>
                <QuickFilterControl placeholder="Search users..." size="small" />
              </QuickFilter>
              <GridToolbarExport />
              <Button
                variant="contained"
                size="small"
                startIcon={<IconPlus size={16} />}
                onClick={handleCreate}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add User
              </Button>
            </Stack>
          </Toolbar>
        );
      },
    [theme, users.length, handleCreate]
  );

  // Column definitions
  const columns: GridColDef<User>[] = useMemo(
    () => [
      { field: 'userId', headerName: 'ID', width: 70 },
      {
        field: 'name',
        headerName: 'Name',
        minWidth: 220,
        flex: 1,
        valueGetter: (_value: unknown, row: User) =>
          `${row.firstName}${row.lastName ? ' ' + row.lastName : ''}`,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', height: '100%' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.8rem',
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              {params.row.firstName?.charAt(0).toUpperCase()}
              {params.row.lastName?.charAt(0).toUpperCase() ?? ''}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {params.row.firstName} {params.row.lastName}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
        minWidth: 220,
        flex: 1,
      },
      {
        field: 'phoneNumber',
        headerName: 'Phone',
        minWidth: 140,
        renderCell: (params: GridRenderCellParams<User>) => params.value || '—',
      },
      {
        field: 'role',
        headerName: 'Role',
        width: 110,
        renderCell: (params: GridRenderCellParams<User>) => {
          const role = params.value as string;
          const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
            Admin: 'error',
           'Super Admin': 'info',
            User: 'default',
          };
          return (
            <Chip
              label={role}
              size="small"
              color={colorMap[role] ?? 'default'}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.75rem', height: '28px' }}
            />
          );
        },
      },
      {
        field: 'isActive',
        headerName: 'Status',
        width: 100,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            size="small"
            color={params.value ? 'success' : 'default'}
            variant="filled"
            sx={{ fontSize: '0.7rem', height: '28px' }}
          />
        ),
      },
      {
        field: 'isEmailVerified',
        headerName: 'Verified',
        width: 100,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Chip
            label={params.value ? 'Yes' : 'No'}
            size="small"
            color={params.value ? 'info' : 'default'}
            variant={params.value ? 'filled' : 'outlined'}
            sx={{ fontSize: '0.7rem', height: '28px' }}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Joined',
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<User>) => {
          if (!params.value) return '—';
          const d = new Date(params.value as string);
          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        },
      },
      {
        field: 'lastLoginAt',
        headerName: 'Last Login',
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<User>) => {
          if (!params.value) return '—';
          const d = new Date(params.value as string);
          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        },
      },
      {
        field: 'actions',
        headerName: '',
        width: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ height: '100%', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}
          >
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary">
                <IconEdit size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(params.row.userId)} color="error">
                <IconTrash size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [handleEdit, handleDelete, theme]
  );

  return (
    <Box>
      {/* Summary Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
        <StatCard label="Total Users" value={String(stats.totalUsers)} color={theme.palette.primary.main} />
        <StatCard label="Active" value={String(stats.activeUsers)} color={theme.palette.success.main} />
        <StatCard label="Inactive" value={String(stats.inactiveUsers)} color={theme.palette.text.secondary} />
        <StatCard label="Verified" value={String(stats.verifiedEmails)} color={theme.palette.info.main} />
      </Stack>

      {/* DataGrid with Custom Toolbar */}
      <Card
        variant="outlined"
        elevation={3}
      >
        <DataGrid
          rows={users}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.userId}
          showToolbar
          slots={{ toolbar: CustomToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          onRowDoubleClick={(params) => handleEdit(params.row as User)}
          sx={{
            border: 0,
            height: 'calc(100vh - 250px)',
            '& .MuiDataGrid-toolbar': {
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.82rem',
            },
          }}
        />
      </Card>

      {/* Side Panel */}
      <UserSidePanel
        open={panelOpen}
        onClose={handleClose}
        user={selectedUser}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
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
        borderLeft: `3px solid ${color}`,
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

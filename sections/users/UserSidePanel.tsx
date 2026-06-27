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
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { alpha, useTheme } from '@mui/material/styles';

// @tabler
import { IconX } from '@tabler/icons-react';

// @project
import type { User } from '@/types/user';
import type { CreateUserInput, UpdateUserInput } from '@/types/user';

/***************************  TYPES  ***************************/

interface UserSidePanelProps {
  open: boolean;
  onClose: () => void;
  user: User | null; // null = create mode
  onSave: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  saving?: boolean;
}

const ROLES = ['User', 'Admin', 'Super Admin'];

/***************************  COMPONENT  ***************************/

export default function UserSidePanel({ open, onClose, user, onSave, saving }: UserSidePanelProps) {
  const theme = useTheme();
  const isEdit = !!user;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateUserInput & UpdateUserInput>({
    defaultValues: getDefaults(user),
  });

  // Reset form when user changes
  useEffect(() => {
    reset(getDefaults(user));
  }, [user, reset]);

  const onSubmit = async (data: CreateUserInput & UpdateUserInput) => {
    if (isEdit) {
      // Only send changed fields for update
      const updateData: UpdateUserInput = {};
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.email) updateData.email = data.email;
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
      if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
      if (data.role) updateData.role = data.role;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isEmailVerified !== undefined) updateData.isEmailVerified = data.isEmailVerified;
      await onSave(updateData);
    } else {
      await onSave(data);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 440 },
            p: 0,
            bgcolor: 'background.default',
          },
        },
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
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isEdit ? `Edit User #${user.userId}` : 'New User'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ p: 3, flex: 1, overflow: 'auto' }}
      >
        <Stack spacing={2.5}>
          {/* Personal Info */}
          <Typography
            variant="subtitle2"
            sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}
          >
            Personal Information
          </Typography>

          <Stack direction="row" spacing={2}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  size="small"
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Last Name" size="small" fullWidth />
              )}
            />
          </Stack>

          <Controller
            name="email"
            control={control}
            rules={{
              required: !isEdit ? 'Email is required' : false,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                size="small"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Phone Number" size="small" fullWidth />
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date of Birth"
                size="small"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />

          {/* Password (only for create) */}
          {!isEdit && (
            <>
              <Divider />
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}
              >
                Credentials
              </Typography>

              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    size="small"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </>
          )}

          <Divider />

          {/* Role & Status */}
          <Typography
            variant="subtitle2"
            sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}
          >
            Role & Status
          </Typography>

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Role" size="small" fullWidth select>
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {isEdit && (
            <Stack direction="row" spacing={2}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="success"
                      />
                    }
                    label="Active"
                  />
                )}
              />
              <Controller
                name="isEmailVerified"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="info"
                      />
                    }
                    label="Email Verified"
                  />
                )}
              />
            </Stack>
          )}
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
            {saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
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

function getDefaults(user: User | null): CreateUserInput & UpdateUserInput {
  if (user) {
    return {
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      email: user.email,
      password: '',
      phoneNumber: user.phoneNumber ?? '',
      dateOfBirth: '',
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    };
  }
  return {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateOfBirth: '',
    role: 'User',
    isActive: true,
    isEmailVerified: false,
  };
}

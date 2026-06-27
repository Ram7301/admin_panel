// Types for User management — aligned with admin_server UserController DTOs

/** Matches UserResponseDto from the server (used in list) */
export interface User {
  userId: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/** Matches UserDetailDto from the server (used in get-by-id) */
export interface UserDetail extends User {
  dateOfBirth: string | null;
  profileImage: string | null;
  updatedAt: string | null;
}

/** Matches CreateUserDto from the server */
export interface CreateUserInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profileImage?: string;
  role?: string;
}

/** Matches UpdateUserDto from the server */
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profileImage?: string;
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

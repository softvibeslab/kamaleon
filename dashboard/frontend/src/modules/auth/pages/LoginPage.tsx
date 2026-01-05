// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Login Page
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../store/auth.store';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email invalido'),
  password: z
    .string()
    .min(8, 'Minimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) return;

    const result = await login(data);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
      }
    }
  };

  const getRemainingLockoutTime = (): string => {
    if (!lockoutUntil) return '';
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
    return `${remaining} minuto${remaining !== 1 ? 's' : ''}`;
  };

  return (
    <Box
      data-testid="login-page"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Kamaleon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dashboard de Administracion
            </Typography>
          </Box>

          {error && !isLocked && (
            <Alert severity="error" sx={{ mb: 2 }} data-testid="login-error">
              {error}
            </Alert>
          )}

          {isLocked && (
            <Alert severity="warning" sx={{ mb: 2 }} data-testid="account-locked">
              Cuenta bloqueada por {getRemainingLockoutTime()} debido a multiples
              intentos fallidos.
            </Alert>
          )}

          {attempts > 0 && attempts < MAX_LOGIN_ATTEMPTS && !isLocked && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Intentos restantes: {MAX_LOGIN_ATTEMPTS - attempts}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form">
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLocked || isLoading}
              autoComplete="email"
              autoFocus
              data-testid="email-input"
            />

            <TextField
              {...register('password')}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLocked || isLoading}
              autoComplete="current-password"
              data-testid="password-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLocked || isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLocked || isLoading}
              sx={{ mt: 3, mb: 2 }}
              data-testid="login-button"
            >
              {isLoading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

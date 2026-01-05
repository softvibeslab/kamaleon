// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Logout Button
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'contained';
  showLabel?: boolean;
}

export const LogoutButton = ({
  variant = 'icon',
  showLabel = true,
}: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip title="Cerrar sesion">
        <IconButton
          onClick={handleLogout}
          disabled={isLoggingOut}
          color="inherit"
          data-testid="logout-icon-button"
        >
          {isLoggingOut ? <CircularProgress size={24} /> : <LogoutIcon />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant={variant === 'contained' ? 'contained' : 'text'}
      startIcon={isLoggingOut ? <CircularProgress size={20} /> : <LogoutIcon />}
      data-testid="logout-button"
    >
      {showLabel && 'Cerrar sesion'}
    </Button>
  );
};

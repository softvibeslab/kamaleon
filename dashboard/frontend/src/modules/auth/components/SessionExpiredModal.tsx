// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Session Expired Modal
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useSession } from '../hooks/useSession';

interface SessionExpiredModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal shown when session is about to expire
 * Allows user to extend session or logout
 */
export const SessionExpiredModal = ({ open, onClose }: SessionExpiredModalProps) => {
  const { extendSession, endSession, formatTimeRemaining } = useSession();

  const handleExtend = async () => {
    const success = await extendSession();
    if (success) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await endSession();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="session-expired-dialog-title"
      data-testid="session-expired-modal"
    >
      <DialogTitle id="session-expired-dialog-title">
        Sesion por expirar
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tu sesion expirara en {formatTimeRemaining()}. ¿Deseas extender tu sesion?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} color="inherit" data-testid="logout-button">
          Cerrar sesion
        </Button>
        <Button
          onClick={handleExtend}
          variant="contained"
          autoFocus
          data-testid="extend-session-button"
        >
          Extender sesion
        </Button>
      </DialogActions>
    </Dialog>
  );
};

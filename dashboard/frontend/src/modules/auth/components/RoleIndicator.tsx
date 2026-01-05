// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Role Indicator
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { Chip, Tooltip } from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Code as DeveloperIcon,
  Visibility as ViewerIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth.types';

const roleConfig: Record<
  UserRole,
  { label: string; color: 'primary' | 'secondary' | 'default'; icon: React.ReactElement }
> = {
  Admin: {
    label: 'Administrador',
    color: 'primary',
    icon: <AdminIcon fontSize="small" />,
  },
  Developer: {
    label: 'Desarrollador',
    color: 'secondary',
    icon: <DeveloperIcon fontSize="small" />,
  },
  Viewer: {
    label: 'Visualizador',
    color: 'default',
    icon: <ViewerIcon fontSize="small" />,
  },
};

interface RoleIndicatorProps {
  showLabel?: boolean;
  size?: 'small' | 'medium';
}

export const RoleIndicator = ({
  showLabel = true,
  size = 'small',
}: RoleIndicatorProps) => {
  const { userRole, userName } = useAuth();

  if (!userRole) return null;

  const config = roleConfig[userRole];

  return (
    <Tooltip title={`${userName} - ${config.label}`}>
      <Chip
        icon={config.icon}
        label={showLabel ? config.label : undefined}
        color={config.color}
        size={size}
        variant="outlined"
        data-testid="role-indicator"
      />
    </Tooltip>
  );
};

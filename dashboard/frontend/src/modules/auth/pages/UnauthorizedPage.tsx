// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Unauthorized Page
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      data-testid="unauthorized-page"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          <LockIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />

          <Typography variant="h4" component="h1" gutterBottom>
            Acceso Denegado
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            No tienes permisos para acceder a esta seccion.
            Contacta a tu administrador si crees que esto es un error.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard"
          >
            Volver al Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

// ════════════════════════════════════════════════════════════════
//                    UI Component: Loading Spinner
//                    Agent: @dashboard-ui
// ════════════════════════════════════════════════════════════════

import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
  'data-testid'?: string;
}

export const LoadingSpinner = ({
  size = 40,
  fullScreen = false,
  'data-testid': testId = 'loading-spinner',
}: LoadingSpinnerProps) => {
  if (fullScreen) {
    return (
      <Box
        data-testid={testId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  return <CircularProgress size={size} data-testid={testId} />;
};

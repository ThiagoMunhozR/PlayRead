import { Box, Paper, Typography, IconButton, Rating } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';

export interface RatingBoxProps {
  value: number;
  onChange: (value: number) => void;
  isLoading?: boolean;
}

export const RatingBox: React.FC<RatingBoxProps> = ({ value, onChange, isLoading = false }) => (
  <Box component={Paper} elevation={0} sx={{ p: 2, borderRadius: 2, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '2px solid', borderColor: 'divider' }}>
    <Typography variant="body1" mb={1} align="center">Avaliação</Typography>
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <IconButton
        aria-label="Diminuir meia estrela"
        onClick={() => onChange(Math.max(0, (value || 0) - 0.25))}
        disabled={isLoading || (value || 0) <= 0}
        sx={{
          color: 'white',
          opacity: 0.5,
          p: 0.2,
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          '&:hover': { background: 'none', opacity: 0.8 },
          '&:focus': { background: 'none', boxShadow: 'none', outline: 'none' },
          '&:active': { background: 'none', boxShadow: 'none', outline: 'none' },
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Rating
        precision={0.25}
        value={value || 0}
        onChange={(_, v) => onChange(v ?? 0)}
        disabled={isLoading}
        size="large"
      />
      <IconButton
        aria-label="Aumentar meia estrela"
        onClick={() => onChange(Math.min(5, (value || 0) + 0.25))}
        disabled={isLoading || (value || 0) >= 5}
        sx={{
          color: 'white',
          opacity: 0.5,
          p: 0.2,
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          '&:hover': { background: 'none', opacity: 0.8 },
          '&:focus': { background: 'none', boxShadow: 'none', outline: 'none' },
          '&:active': { background: 'none', boxShadow: 'none', outline: 'none' },
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({ loading, children, ...props }) => {
  return (
    <MuiButton
      disabled={loading}
      {...props}
    >
      {loading ? <CircularProgress size={24} /> : children}
    </MuiButton>
  );
};

export default Button; 
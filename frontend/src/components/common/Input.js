import React from 'react';
import { TextField } from '@mui/material';

const Input = ({ error, ...props }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      margin="normal"
      error={!!error}
      helperText={error}
      {...props}
    />
  );
};

export default Input; 
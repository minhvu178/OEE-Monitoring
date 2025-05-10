import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          OEE Monitoring System
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;

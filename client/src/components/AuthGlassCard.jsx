import React from 'react';
import { Box } from '@chakra-ui/react';

/** Auth form panel: explicit glass styles (Chakra Box `variant` is theme-backed but easy to miss). */
const AuthGlassCard = ({ children, ...props }) => (
  <Box variant="glass" {...props}>
    {children}
  </Box>
);

export default AuthGlassCard;

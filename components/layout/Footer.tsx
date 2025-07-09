import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import NextLink from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Nook
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modern property management for the digital age.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Box>
              <Link
                component={NextLink}
                href="/legal/privacy-policy"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Privacy Policy
              </Link>
              <Link
                component={NextLink}
                href="/legal/terms-of-service"
                color="inherit"
                sx={{ display: 'block' }}
              >
                Terms of Service
              </Link>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@nook.app
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: (555) 123-4567
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} Nook. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 
import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';

interface LegalDocumentProps {
  title: string;
  content: string;
  lastUpdated: string;
}

const LegalDocument: React.FC<LegalDocumentProps> = ({ title, content, lastUpdated }) => {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Last updated: {lastUpdated}
          </Typography>
        </Box>

        <Box sx={{ typography: 'body1' }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => router.back()}
          >
            ← Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Nook. All rights reserved.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LegalDocument; 
import { Box, Container, Typography, Button, Divider, Paper } from '@mui/material';
import { WaterDrop } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using HydroMonitor, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service. Continued use of the service after any changes to these terms constitutes acceptance of the updated terms.',
  },
  {
    title: 'Description of Service',
    body: 'HydroMonitor provides smart water monitoring and management for buildings, including real-time usage tracking, leak and offline-device alerts, billing and payment processing, and analytics and reporting. We may add, modify, or discontinue features at any time with or without notice.',
  },
  {
    title: 'Accounts and Responsibilities',
    body: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to provide accurate and current information when creating or managing an account, and to notify us promptly of any unauthorized use.',
  },
  {
    title: 'Billing and Payments',
    body: 'Water charges are calculated based on metered usage at the rate set by your property manager. Payments are processed by our payment provider, Paystack, and are subject to their terms. Failure to pay billed amounts on time may result in restrictions on the service, at the discretion of the property manager.',
  },
  {
    title: 'Device and Usage Data',
    body: 'Water meters connected to the service transmit usage readings to your account. Usage data is used to generate bills, reports, and analytics. By connecting a meter you consent to the collection of this data as described in our Privacy Policy.',
  },
  {
    title: 'Acceptable Use',
    body: 'You agree not to misuse the service, including attempting to access other users\' data, interfering with the operation of meters or servers, reselling the service without authorization, or using the service for any unlawful purpose.',
  },
  {
    title: 'Third-Party Services',
    body: 'The service relies on third-party providers including Google Firebase (authentication, database, and messaging) and Paystack (payment processing). Your use of these integrated services is also subject to their respective terms and policies.',
  },
  {
    title: 'Disclaimer of Warranties',
    body: 'The service is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or that usage readings will always be accurate.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the maximum extent permitted by law, HydroMonitor and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including water loss, billing disputes, or device failures.',
  },
  {
    title: 'Termination',
    body: 'We may suspend or terminate your access to the service for violations of these terms, unlawful conduct, or prolonged inactivity. You may stop using the service at any time, and outstanding billed amounts will remain due.',
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these terms from time to time. The current version will always be available at this page, and material changes will be communicated through the app.',
  },
  {
    title: 'Contact Us',
    body: 'If you have questions about these terms, contact us at support@hydromonitor.app.',
  },
];

export function TermsOfServicePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,128,237,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="md" sx={{ py: 6, position: 'relative' }}>
        <Button component={Link} to="/" sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}>
          ← Back to Home
        </Button>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <WaterDrop sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HydroMonitor
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Terms of Service
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Last updated: August 2026
          </Typography>
          <Typography variant="body1" paragraph>
            These terms govern your use of the HydroMonitor mobile app and web application. Please
            read them carefully. By using the service you agree to these terms and to our Privacy
            Policy.
          </Typography>
          {sections.map((section, index) => (
            <Box key={section.title}>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {index + 1}. {section.title}
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 0 }}>
                {section.body}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}

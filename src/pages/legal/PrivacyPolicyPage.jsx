import { Box, Container, Typography, Button, Divider, Paper } from '@mui/material';
import { WaterDrop } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect the information you provide when you create or manage an account, including your name, email address, phone number, and billing address. Water meters connected to our service transmit usage readings (water consumption data) to your account. When you make a payment through the app, the payment details are collected and processed by our payment provider, Paystack, and are not stored on our servers.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to operate the service: displaying real-time water usage, generating bills and invoices, processing payments, sending account and device notifications (including low-usage, leak, and offline-device alerts), and providing customer support. Usage data is aggregated to produce analytics and reports for you and, where applicable, the property manager of the building you are located in.',
  },
  {
    title: 'Sharing of Information',
    body: 'We do not sell or rent your personal information. Where you are a tenant, your water usage and billing information are shared with the property manager (building admin) responsible for your building so they can manage billing and respond to alerts. Payment processing is handled by Paystack; their privacy policy applies to payment data they process. Service infrastructure is provided by Google Firebase (Firebase Authentication, Realtime Database, and Cloud Messaging), which processes data in accordance with Google\'s privacy terms.',
  },
  {
    title: 'Data Retention and Security',
    body: 'We retain your account and usage records for as long as your account is active, and as long as required to support billing and dispute resolution. All data is transmitted over encrypted connections (HTTPS/TLS) and stored in Firebase\'s secure infrastructure with access controlled through authentication and database security rules.',
  },
  {
    title: 'Your Choices',
    body: 'You may update or correct your account information at any time through your profile page. You can control push notifications through your device settings and through the notification preferences in the app. To request deletion of your account or data, contact us using the details below.',
  },
  {
    title: 'Children\'s Privacy',
    body: 'The service is not directed to children under 16, and we do not knowingly collect personal information from children.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this policy from time to time. The current version will always be available at this page, and material changes will be communicated through the app.',
  },
  {
    title: 'Contact Us',
    body: 'If you have questions about this privacy policy or your data, contact us at support@hydromonitor.app.',
  },
];

export function PrivacyPolicyPage() {
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
            Privacy Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Last updated: August 2026
          </Typography>
          <Typography variant="body1" paragraph>
            This policy explains what information HydroMonitor collects through its mobile app and web
            application, how it is used, and the choices you have over your data. By using the service
            you agree to the practices described here.
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

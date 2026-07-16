import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0A1A2B',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ServicesSection />
        <DashboardPreview />
        <BenefitsSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </motion.div>
    </Box>
  );
}

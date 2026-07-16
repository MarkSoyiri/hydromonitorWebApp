import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';

function AnimatedCounter({ target, suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const duration = 2000;
          const step = 16;
          const increment = target / (duration / step);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, step);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
      {suffix}
    </span>
  );
}

const BENEFITS = [
  { value: 99.9, suffix: '%', decimals: 1, label: 'System Availability', sub: 'Enterprise-grade reliability' },
  { value: 24, suffix: '/7', decimals: 0, label: 'Real-Time Monitoring', sub: 'Never miss a reading' },
  { value: 1, suffix: 's', decimals: 0, label: 'Alert Delivery', sub: 'Instant leak notifications' },
  { value: 100, suffix: '+', decimals: 0, label: 'Buildings Supported', sub: 'Scale without limits' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function BenefitsSection() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        background: 'linear-gradient(180deg, #0A1A2B 0%, #0D2137 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(47,128,237,0.04), transparent)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="overline"
            sx={{
              color: '#5FA4FF',
              fontWeight: 700,
              letterSpacing: '0.12em',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'block',
              mb: 1.5,
            }}
          >
            WHY HYDROMONITOR
          </Typography>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              mb: 8,
              letterSpacing: '-0.02em',
            }}
          >
            Trusted by property managers
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {BENEFITS.map((benefit) => (
            <Grid item xs={6} md={3} key={benefit.label}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2rem', md: '2.75rem', lg: '3.25rem' },
                      background: 'linear-gradient(135deg, #5FA4FF 0%, #00B4D8 50%, #4FC3F7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1,
                      mb: 0.5,
                    }}
                  >
                    <AnimatedCounter
                      target={benefit.value}
                      suffix={benefit.suffix}
                      decimals={benefit.decimals}
                    />
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: { xs: '0.85rem', md: '1rem' },
                      mb: 0.25,
                    }}
                  >
                    {benefit.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {benefit.sub}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

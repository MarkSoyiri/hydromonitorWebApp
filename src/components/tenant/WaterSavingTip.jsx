import { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Lightbulb, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const tips = [
  'Fix leaking taps immediately — a drip can waste 20L per day.',
  'Take shorter showers to save up to 50L per minute.',
  'Use a broom instead of a hose to clean driveways.',
  'Collect rainwater for gardening and washing.',
  'Run washing machines and dishwashers only when full.',
  'Install low-flow showerheads to reduce water use by 40%.',
  'Water plants early morning or late evening to reduce evaporation.',
  'Check for toilet leaks by adding food colouring to the tank.',
  'Turn off the tap while brushing your teeth.',
  'Use mulch in gardens to retain soil moisture.',
];

export function WaterSavingTip() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % tips.length);
        setShow(true);
      }, 300);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{
      p: 2.5, borderRadius: 3,
      background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
        <Lightbulb sx={{ fontSize: 80 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, position: 'relative', zIndex: 1 }}>
        <Lightbulb sx={{ fontSize: 24, mt: 0.3 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, letterSpacing: 1 }}>
            WATER SAVING TIP
          </Typography>
          <AnimatePresence mode="wait">
            {show && (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, lineHeight: 1.5 }}>
                  {tips[index]}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}

import { createTheme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { lightShadows, darkShadows } from './shadows';
import { typography } from './typography';
import { getComponents } from './components';

export const createAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: isDark ? darkPalette : lightPalette,
    typography,
    shape: { borderRadius: 12 },
    shadows: isDark ? darkShadows : lightShadows,
    components: getComponents(mode),
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
  });
};

export { lightPalette, darkPalette, typography };

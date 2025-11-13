/**
 * Argon Theme Configuration - PhysioCapture
 * Inspirado no Argon Dashboard com cores customizadas
 * Desenvolvido por Core Hive
 */

export const argonTheme = {
  // Paleta de cores principal mantendo o esquema teal/green do PhysioCapture
  colors: {
    primary: {
      main: '#009688',
      light: '#4DB6AC',
      dark: '#00796B',
      gradient: 'linear-gradient(310deg, #009688 0%, #4DB6AC 100%)',
    },
    secondary: {
      main: '#66BB6A',
      light: '#81C784',
      dark: '#43A047',
      gradient: 'linear-gradient(310deg, #66BB6A 0%, #81C784 100%)',
    },
    info: {
      main: '#00BCD4',
      light: '#4DD0E1',
      dark: '#0097A7',
      gradient: 'linear-gradient(310deg, #00BCD4 0%, #4DD0E1 100%)',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
      gradient: 'linear-gradient(310deg, #4CAF50 0%, #81C784 100%)',
    },
    warning: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#F57C00',
      gradient: 'linear-gradient(310deg, #FFA726 0%, #FFB74D 100%)',
    },
    error: {
      main: '#EF5350',
      light: '#FF8099',
      dark: '#C62828',
      gradient: 'linear-gradient(310deg, #EF5350 0%, #FF8099 100%)',
    },
    dark: {
      main: '#2C3E50',
      light: '#34495E',
      dark: '#1A252F',
      gradient: 'linear-gradient(310deg, #2C3E50 0%, #34495E 100%)',
    },
    light: {
      main: '#F5F7FA',
      light: '#FAFBFC',
      dark: '#E8EAED',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
      disabled: '#B0BEC5',
      white: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
      dark: '#1A1F2E',
    },
    grey: {
      50: '#FAFBFC',
      100: '#F5F7FA',
      200: '#E8EAED',
      300: '#D5D9DD',
      400: '#B0B7C3',
      500: '#7F8C8D',
      600: '#5A6C7D',
      700: '#34495E',
      800: '#2C3E50',
      900: '#1A252F',
    },
  },

  // Gradientes inspirados no Argon
  gradients: {
    primary: 'linear-gradient(310deg, #009688 0%, #4DB6AC 100%)',
    secondary: 'linear-gradient(310deg, #66BB6A 0%, #81C784 100%)',
    info: 'linear-gradient(310deg, #00BCD4 0%, #4DD0E1 100%)',
    success: 'linear-gradient(310deg, #4CAF50 0%, #81C784 100%)',
    warning: 'linear-gradient(310deg, #FFA726 0%, #FFB74D 100%)',
    error: 'linear-gradient(310deg, #EF5350 0%, #FF8099 100%)',
    dark: 'linear-gradient(310deg, #2C3E50 0%, #34495E 100%)',
    light: 'linear-gradient(310deg, #F5F7FA 0%, #FAFBFC 100%)',
  },

  // Shadows do Argon Dashboard
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Colored shadows (Argon style)
    primary: '0 4px 20px 0 rgba(0, 150, 136, 0.14), 0 7px 10px -5px rgba(0, 150, 136, 0.4)',
    secondary: '0 4px 20px 0 rgba(102, 187, 106, 0.14), 0 7px 10px -5px rgba(102, 187, 106, 0.4)',
    info: '0 4px 20px 0 rgba(0, 188, 212, 0.14), 0 7px 10px -5px rgba(0, 188, 212, 0.4)',
    success: '0 4px 20px 0 rgba(76, 175, 80, 0.14), 0 7px 10px -5px rgba(76, 175, 80, 0.4)',
    warning: '0 4px 20px 0 rgba(255, 167, 38, 0.14), 0 7px 10px -5px rgba(255, 167, 38, 0.4)',
    error: '0 4px 20px 0 rgba(239, 83, 80, 0.14), 0 7px 10px -5px rgba(239, 83, 80, 0.4)',
  },

  // Bordas arredondadas do Argon
  borderRadius: {
    none: '0',
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Espaçamentos
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Monaco, Courier, monospace',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Transições
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Utilitários para gerar classes CSS
export const getGradientClass = (color: keyof typeof argonTheme.gradients) => {
  return `bg-gradient-to-br from-${color}-500 to-${color}-700`;
};

export const getShadowClass = (shadow: keyof typeof argonTheme.shadows) => {
  return `shadow-${shadow}`;
};

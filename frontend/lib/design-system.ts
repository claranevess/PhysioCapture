/**
 * PhysioCapture Design System
 * Desenvolvido por Core Hive
 * 
 * Sistema de design inspirado em DataPharma Dashboard
 * Clean, profissional, com ícones coloridos em círculos
 */

export const designTokens = {
  // Paleta de Cores - Estilo DataPharma
  colors: {
    // Teal/Turquoise (Cor Principal - como na imagem)
    primary: {
      50: '#E0F2F1',
      100: '#B2DFDB',
      200: '#80CBC4',
      300: '#4DB6AC',
      400: '#26A69A',
      500: '#009688',  // Teal principal
      600: '#00897B',
      700: '#00796B',
      800: '#00695C',
      900: '#004D40',
    },
    
    // Cores Secundárias - Verde (como os cards na imagem)
    secondary: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },

    // Coral/Salmão (como na imagem)
    accent: {
      50: '#FFE0E5',
      100: '#FFB3C1',
      200: '#FF8099',
      300: '#FF4D70',
      400: '#FF2652',
      500: '#FF0033',
      600: '#F5002E',
      700: '#E60026',
      800: '#D8001F',
      900: '#C20012',
    },

    // Roxo/Violeta (como na imagem)
    purple: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC',
      500: '#9C27B0',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },

    // Laranja/Amarelo (como na imagem)
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFC107',
      600: '#FFB300',
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
    },

    // Azul (complementar)
    info: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },

    // Background e Superfícies (clean como na imagem)
    background: {
      default: '#F5F7FA',  // Cinza muito claro
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
    },

    // Gradientes sutis (apenas para header, se necessário)
    gradients: {
      teal: 'linear-gradient(135deg, #4DB6AC 0%, #009688 100%)',
      green: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
      purple: 'linear-gradient(135deg, #BA68C8 0%, #9C27B0 100%)',
      coral: 'linear-gradient(135deg, #FF8099 0%, #FF0033 100%)',
      blue: 'linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)',
    },

    // Cores Neutras (leves como na imagem)
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },

    // Cores de Status
    status: {
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      info: '#2196F3',
    },

    // Text Colors
    text: {
      primary: '#2C3E50',      // Azul escuro suave
      secondary: '#7F8C8D',    // Cinza médio
      disabled: '#BDC3C7',     // Cinza claro
      inverse: '#FFFFFF',
    },

    // Border Colors (sutis como na imagem)
    border: {
      light: '#ECEFF1',
      default: '#CFD8DC',
      dark: '#B0BEC5',
    },
  },

  // Tipografia (mais leve que antes)
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "'Poppins', sans-serif",
      mono: "'Roboto Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Espaçamento
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
  },

  // Bordas (mais arredondadas como na imagem)
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    full: '9999px',
  },

  // Sombras (MUITO sutis como na imagem)
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    base: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
  },

  // Transições
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
    timing: 'ease-in-out',
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Utilitários para aplicar o Design System
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = designTokens.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return '';
  }
  
  return value;
};

export const getGradient = (type: keyof typeof designTokens.colors.gradients): string => {
  return designTokens.colors.gradients[type];
};

// Classes CSS prontas para uso
export const cssClasses = {
  card: {
    base: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300',
    elevated: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300',
    gradient: 'rounded-xl shadow-lg hover:shadow-xl transition-all duration-300',
  },
  button: {
    primary: 'bg-gradient-to-r from-[#14B8B8] to-[#26C2C2] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
    secondary: 'bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
    accent: 'bg-gradient-to-r from-[#FF9800] to-[#FFB74D] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
    outline: 'border-2 border-[#14B8B8] text-[#14B8B8] font-semibold rounded-lg hover:bg-[#14B8B8] hover:text-white transition-all duration-300',
  },
  input: {
    base: 'w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#14B8B8] focus:ring-4 focus:ring-[#14B8B8]/10 transition-all duration-300',
  },
  badge: {
    primary: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E6F7F7] text-[#0D7676]',
    secondary: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E8F5E9] text-[#1B5E20]',
    accent: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FFF3E0] text-[#E65100]',
  },
  text: {
    heading: 'font-bold text-gray-900 leading-tight',
    body: 'text-gray-700 leading-relaxed',
    muted: 'text-gray-500 text-sm',
  },
};

export default designTokens;

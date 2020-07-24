const theme = {
  borderRadius: '8px',
  colors: {
    blue: {
      lightest: '#E2EAFF',
      light: '#5987FF',
      base: '#1E5DFF',
      dark: '#0034BB',
      darkest: '#001959',
    },
    purple: {
      lightest: '#EBE2FF',
      light: '#7D45FF',
      base: '#540AFF',
      dark: '#3E00CE',
      darkest: '#1B0059',
    },
    red: {
      lightest: '#FAE1E8',
      light: '#E15D81',
      base: '#D82B5B',
      dark: '#A91F45',
      darkest: '#460D1D',
    },
    mono: {
      white: '#FFFFFF',
      black: '#00030A',
      100: '#FFFFFF',
      200: '#FCFCFC',
      300: '#F4F4F4',
      400: '#E3E3E3',
      500: '#C4C4C4',
      600: '#929296',
      700: '#737377',
      800: '#48494E',
      900: '#292B31',
      1000: '#191D29',
      1100: '#080D1A',
      1200: '#00030A',
    },
  },
  font: 'sofia-pro, sans-serif',
  shadow: {
    light: '0px 0px 5px 0px rgba(0,0,0,0.3)',
    strong: '0px 1px 13px 2px rgba(0,0,0,0.5)',
  },
  type: {
    size: {
      button: '18px',
      componentTitle: '28px',
      input: '18px',
      label: '16px',
      paragraph: '18px',
      header: '28px',
      title: '36px',
    },
    weight: {
      button: 900,
      componentTitle: 900,
      input: 400,
      label: 800,
      paragraph: 400,
      header: 800,
      title: 800,
    },
  },
  zIndex: {
    dropdown: 90,
    onboarding: 100,
    modal: 110,
  },
};

export default theme;

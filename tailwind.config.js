/** @type {import('tailwindcss').Config} */
// "Neighbourhood vintage shop": paper, ink, terracotta, wax red, olive, kraft.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Few, small radii: paper corners are nearly square, buttons 12px. No 24px-on-everything.
    borderRadius: { none: '0', sm: '3px', DEFAULT: '4px', md: '5px', lg: '8px', xl: '12px', '2xl': '6px', '3xl': '8px', full: '9999px' },
    extend: {
      colors: {
        bg: '#F4EEE3', // paper
        card: '#FBF8F2',
        ink: { DEFAULT: '#2B2420', soft: '#62564E' },
        line: '#E3D9C8',
        primary: { DEFAULT: '#B84A24', hover: '#9C3D1C', dark: '#7A3015', soft: '#F1DCD0' }, // terracotta
        escrow: { DEFAULT: '#8E1F1F', dark: '#8E1F1F', soft: '#F0D9D4' }, // wax red
        ok: { DEFAULT: '#4A5D3A', dark: '#4A5D3A', soft: '#E3E7D6' }, // olive
        kraft: { DEFAULT: '#C9A877', dark: '#76562A', soft: '#EADCC2' },
        bad: '#A4161A',
        // warm replacements for the default neutrals still used across the app
        gray: { 50: '#F7F2E9', 100: '#EFE8DA', 200: '#E3D9C8', 300: '#CFC3AF', 400: '#8F8374', 500: '#6E625A' },
        red: { 50: '#F6E3DE' },
        green: { 50: '#E3E7D6' },
        blue: { 50: '#EADCC2', 400: '#C9A877', 500: '#76562A', 700: '#5E441F' },
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
        display: ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
        hand: ['"Amatic SC"', 'cursive'],
        mono: ['"Courier New"', 'ui-monospace', 'monospace'],
      },
      // Small, hard-edged paper shadows instead of big blurry ones.
      boxShadow: { soft: '0 1px 0 rgba(43,36,32,.08), 0 2px 5px rgba(43,36,32,.12)', lift: '0 1px 0 rgba(43,36,32,.1), 0 4px 8px rgba(43,36,32,.16)' },
    },
  },
  plugins: [],
};

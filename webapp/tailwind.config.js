module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#4DABF7',
      },
      fontFamily: {
        'roboto-mono': ['"Roboto Mono"', 'monospace'],
        'red-hat-mono': ['"Red Hat Mono"', 'monospace'],
        'inconsolata': ['"Inconsolata"', 'monospace'],
      },
    },
  },
  plugins: [],
};

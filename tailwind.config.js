/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // Semantic naming for our fonts
        brand: ['IndieFlower', 'cursive'],
        body: ['SpaceGrotesk', 'system-ui', 'sans-serif'],
        book: ['EBGaramond', 'serif'],
      },
    },
  },
  plugins: [],
};

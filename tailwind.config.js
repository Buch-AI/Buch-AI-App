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
      boxShadow: {
        'custom': '2px 2px 0px 0px rgba(0, 0, 0, 0.6)',
        'custom-focused': '4px 4px 0px 0px rgba(0, 0, 0, 0.6)',
        'custom-dark': '2px 2px 0px 0px rgba(255, 255, 255, 0.6)',
        'custom-focused-dark': '4px 4px 0px 0px rgba(255, 255, 255, 0.6)',
      },
    },
  },
  plugins: [],
};

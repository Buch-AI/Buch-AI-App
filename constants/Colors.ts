/**
 * Below are the colors that are used in the app.
 * The colors are defined in the light and dark mode.
 * There are many other ways to style your app.
 * For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/),
 * [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#7cb490';
const tintColorDark = '#ffffff'; // TODO: Change this to the dark mode tint color.

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8F1E9',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#493736',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

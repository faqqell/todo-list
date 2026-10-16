export interface AppTheme {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  muted: string;
  subtle: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  low: string;
  medium: string;
  high: string;
  success: string;
  danger: string;
  shadow: string;
}

export const themes: Record<'light' | 'dark', AppTheme> = {
  light: {
    background: '#F5F7F4',
    surface: '#FFFFFF',
    surfaceRaised: '#EEF2EE',
    text: '#202B25',
    muted: '#77847C',
    subtle: '#A3ADA6',
    border: '#E3E9E4',
    accent: '#D95F48',
    accentSoft: '#FBEAE5',
    accentText: '#B54431',
    low: '#39816D',
    medium: '#B87520',
    high: '#C94E42',
    success: '#39816D',
    danger: '#C94E42',
    shadow: '#25382D',
  },
  dark: {
    background: '#151D19',
    surface: '#202A25',
    surfaceRaised: '#29352F',
    text: '#F0F4F0',
    muted: '#A0AEA5',
    subtle: '#74847A',
    border: '#34433A',
    accent: '#F07B62',
    accentSoft: '#432D28',
    accentText: '#FF9B84',
    low: '#78B59F',
    medium: '#E6B465',
    high: '#F07B72',
    success: '#78B59F',
    danger: '#F07B72',
    shadow: '#000000',
  },
};
import localFont from 'next/font/local'

export const intelOneDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/intelone-display-light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/intelone-display-regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/intelone-display-medium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-intel-one-display',
  display: 'swap',
  preload: true,
}) 
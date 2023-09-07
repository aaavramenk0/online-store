import localFont from 'next/font/local'


export const causten = localFont({
  src: [
    {
      path: '../../public/fonts/Causten-Black.ttf',
      weight: '900',
      style: 'normal'
    },
    {
      path: '../../public/fonts/Causten-Extra-Bold.ttf',
      weight: '800',
      style: 'normal'
    },
    {
      path: '../../public/fonts/Causten-Bold.ttf',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../../public/fonts/Causten-Semi-Bold.ttf',
      weight: '600',
      style: 'normal'
    },
    {
      path: '../../public/fonts/Causten-Medium.ttf',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../../public/fonts/Causten-Regular.ttf',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-causten',
  display: 'swap'
})

export const coreSans = localFont({
  src: [
    {
      path: '../../public/fonts/Core-Sans-Bold.otf',
      style: 'normal',
      weight: '700',
    }
  ],
	variable: '--font-core-sans',
	display:'swap'
})
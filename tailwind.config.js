/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'urbanist': 'Urbanist',
        'urbanist-bold': 'Urbanist-Bold',
        'urbanist-medium': 'Urbanist-Medium',
        'urbanist-light': 'Urbanist-Light',
        "urbanist-regular": "Urbanist-Regular",
        'blocklyn-grunge': 'Blocklyn-Grunge',
        'blocklyn-condensed': 'Blocklyn-Condensed', 
        'sofia': 'SofiaPro-Regular',
        'sofia-medium': 'SofiaPro-Medium',
        'sofia-bold': 'SofiaPro-Bold',
        'sofia-light': 'SofiaPro-Light',
        'sofia-regular': 'SofiaPro-Regular',
        'sofia-semibold': 'SofiaPro-SemiBold',
        'sofia-black': 'SofiaPro-Black',
      },
      fontSize: {
        'title': '28px',
        'paragraph': '18px',
        'headline': '32px',
        'base': '16px',
        'small': '11px',
      },
      colors: {
        dark: '#5D5C5C',
        primary: '#1C274C',
        secondary: '#D9D9D9',
        textdark: '#424242',
        
        'orange-light': '#FBD2B5',
        'gray-light': '#F5F5F5',
        'orange-gradient': {
          from: '#F17922',
          to: '#FA6345',
        },
        yellow: '#FFCC00',
        white: '#FFFFFF',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};

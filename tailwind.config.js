/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // The Portal - Pastel Kawaii Color Palette
                'portal-pink': '#FFD1DC',
                'portal-cream': '#FFF5E1',
                'portal-purple': '#E0BBE4',
                'portal-sky': '#B2E2F2',
                // Darker variants for text/accents
                'portal-pink-dark': '#FFB3C6',
                'portal-purple-dark': '#C9A0D3',
            },
            borderRadius: {
                'squishy': '1.5rem', // rounded-3xl equivalent
            },
            fontFamily: {
                sans: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
            },
            animation: {
                'bounce-slow': 'bounce 1.5s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
};

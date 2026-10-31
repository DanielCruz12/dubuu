import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-sans)'],
  			display: ['var(--font-display)'],
  			label: ['var(--font-label)'],
  		},
  		colors: {
  			coast: {
				DEFAULT: '#0080FF',
				deep: '#0059B3',
				50: '#F0F7FF',
				100: '#DBECFF',
				200: '#B3D6FF',
				300: '#75B8FF',
				400: '#3396FF',
				500: '#0080FF',
				600: '#006ED9',
				700: '#0059B3',
				800: '#00408C',
				900: '#002B66',
			},
  			volcanic: {
  				DEFAULT: '#1F5B45',
  				50: '#EAF3EF',
  				100: '#CBE2D6',
  				200: '#9FC7B2',
  				300: '#6DA98A',
  				400: '#3F8C67',
  				500: '#2A7350',
  				600: '#1F5B45',
  				700: '#174534',
  				800: '#0F2E22',
  				900: '#081711',
  			},
  			sand: {
  				DEFAULT: '#C9A24B',
  				50: '#FBF6EA',
  				100: '#F5E9C9',
  				200: '#EBD397',
  				300: '#E0BD66',
  				400: '#D6AB4E',
  				500: '#C9A24B',
  				600: '#A9813A',
  				700: '#7F612C',
  				800: '#54401D',
  				900: '#2A200F',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					gridTemplateRows: '0fr'
  				},
  				to: {
  					gridTemplateRows: '1fr'
  				}
  			},
  			'accordion-up': {
  				from: {
  					gridTemplateRows: '1fr'
  				},
  				to: {
  					gridTemplateRows: '0fr'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

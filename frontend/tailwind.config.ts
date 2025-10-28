import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			// Matcha Midnight Theme Colors
  			midnight: {
  				DEFAULT: '#0f1729', // Main Background
  				blue: '#0f1729',
  			},
  			slate: {
  				dark: '#1e293b', // Surface/Cards
  				gray: '#334155', // Borders/Dividers
  				medium: '#94a3b8', // Secondary Text
  			},
  			matcha: {
  				orange: '#F39C12', // Primary Accent
  				white: '#FFFFFF', // Accent Text
  				offwhite: '#f1f5f9', // Primary Text
  			},
  			// Updated primary to use orange accent
  			primary: {
  				'50': '#fef6e7',
  				'100': '#fdecc4',
  				'200': '#fbd89d',
  				'300': '#f9c476',
  				'400': '#f7b359',
  				'500': '#F39C12', // Main orange accent
  				'600': '#e08e0b',
  				'700': '#c27d08',
  				'800': '#a46c06',
  				'900': '#7a5003',
  				'950': '#4d3202',
  				DEFAULT: '#F39C12',
  				foreground: '#FFFFFF'
  			},
  			// Updated secondary for dark theme
  			secondary: {
  				'50': '#f1f5f9', // Off-white for primary text
  				'100': '#e2e8f0',
  				'200': '#cbd5e1',
  				'300': '#94a3b8', // Medium slate for secondary text
  				'400': '#64748b',
  				'500': '#475569',
  				'600': '#334155', // Slate gray for borders
  				'700': '#1e293b', // Dark slate for surfaces
  				'800': '#0f172a',
  				'900': '#0f1729', // Midnight blue for background
  				'950': '#020617',
  				DEFAULT: '#1e293b',
  				foreground: '#f1f5f9'
  			},
  			orange: {
  				'50': '#fef6e7',
  				'100': '#fdecc4',
  				'200': '#fbd89d',
  				'300': '#f9c476',
  				'400': '#f7b359',
  				'500': '#F39C12',
  				'600': '#e08e0b',
  				'700': '#c27d08',
  				'800': '#a46c06',
  				'900': '#7a5003',
  				'950': '#4d3202'
  			},
  			pink: {
  				'50': '#fdf2f8',
  				'100': '#fce7f3',
  				'200': '#fbcfe8',
  				'300': '#f9a8d4',
  				'400': '#f472b6',
  				'500': '#ec4899',
  				'600': '#db2777',
  				'700': '#be185d',
  				'800': '#9d174d',
  				'900': '#831843',
  				'950': '#500724'
  			},
  			red: {
  				'50': '#fef2f2',
  				'100': '#fee2e2',
  				'200': '#fecaca',
  				'300': '#fca5a5',
  				'400': '#f87171',
  				'500': '#ef4444',
  				'600': '#dc2626',
  				'700': '#b91c1c',
  				'800': '#991b1b',
  				'900': '#7f1d1d',
  				'950': '#450a0a'
  			},
  			green: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d',
  				'950': '#052e16'
  			},
  			background: '#0f1729',
  			foreground: '#f1f5f9',
  			card: {
  				DEFAULT: '#1e293b',
  				foreground: '#f1f5f9'
  			},
  			popover: {
  				DEFAULT: '#1e293b',
  				foreground: '#f1f5f9'
  			},
  			muted: {
  				DEFAULT: '#334155',
  				foreground: '#94a3b8'
  			},
  			accent: {
  				DEFAULT: '#F39C12',
  				foreground: '#FFFFFF'
  			},
  			destructive: {
  				DEFAULT: '#ef4444',
  				foreground: '#FFFFFF'
  			},
  			border: '#334155',
  			input: '#1e293b',
  			ring: '#F39C12',
  			chart: {
  				'1': '#F39C12',
  				'2': '#94a3b8',
  				'3': '#ec4899',
  				'4': '#22c55e',
  				'5': '#ef4444'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Poppins',
  				'system-ui',
  				'sans-serif'
  			],
  			body: [
  				'Open Sans',
  				'system-ui',
  				'sans-serif'
  			],
  			heading: [
  				'Montserrat',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'slide-down': 'slideDown 0.3s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			'pulse-slow': 'pulse 3s infinite',
  			'bounce-slow': 'bounce 2s infinite',
  			'spin-slow': 'spin 3s linear infinite',
  			blob: 'blob 7s infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideDown: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(-20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			scaleIn: {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.9)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			blob: {
  				'0%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				},
  				'33%': {
  					transform: 'translate(30px, -50px) scale(1.1)'
  				},
  				'66%': {
  					transform: 'translate(-20px, 20px) scale(0.9)'
  				},
  				'100%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				}
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'hero-pattern': 'url("/images/hero-pattern.svg")'
  		},
  		boxShadow: {
  			glow: '0 0 20px rgba(239, 68, 68, 0.3)',
  			'glow-lg': '0 0 40px rgba(239, 68, 68, 0.4)'
  		},
  		animationDelay: {
  			'2000': '2s',
  			'4000': '4s'
  		},
  		borderRadius: {
  			'none': '0px',
  			'sm': '0.125rem',
  			'DEFAULT': '0.25rem',
  			'md': '0.375rem',
  			'lg': '0.5rem',
  			'xl': '0.75rem',
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  			'full': '9999px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
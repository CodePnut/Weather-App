# Weather Wonderland

A beautiful, gamified weather app built with Next.js, TailwindCSS, and shadcn/ui components. This application shows current weather and forecasts with a gamified experience where users earn points and achievements for checking the weather and interacting with the app.

## Features

- Current weather conditions and 7-day forecast
- Beautiful animations based on weather conditions
- Dark/light theme toggle
- Achievements and points system
- Weather stats tracking
- City search functionality
- Responsive design that works on mobile and desktop

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/weather-wonderland.git
cd weather-wonderland
```

2. Install dependencies

```bash
npm install --legacy-peer-deps
# or
yarn install
# or
pnpm install
```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Replace the placeholder API key with your OpenWeatherMap API key (get one at [OpenWeatherMap](https://openweathermap.org/api))

```bash
cp .env.example .env.local
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Integration

The app uses the OpenWeatherMap API to fetch real weather data. If you don't provide an API key, the app will fall back to using mock data.

### API Service

The weather service is located in `lib/weather-service.ts` and handles:

- Fetching current weather conditions
- Fetching and processing the forecast data
- Fallback to mock data when API keys aren't provided

## Project Structure

```
/
├── app/                    # Next.js app directory (App Router)
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Home page component
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── weather-dashboard.tsx   # Main weather dashboard
│   ├── weather-animation.tsx   # Weather animations
│   ├── weather-forecast.tsx    # Forecast component
│   └── weather-stats.tsx       # Statistics component
├── lib/                    # Utility functions and services
│   ├── utils.ts            # General utilities
│   └── weather-service.ts  # Weather API service
├── public/                 # Static assets
├── styles/                 # Additional styles
└── ...config files
```

## Game Mechanics

The app includes gamification elements:

- Points for checking weather and interacting with the app
- Achievements for reaching milestones (streaks, points)
- Level progression based on accumulated points

## Customization

You can customize the app by:

- Modifying the UI components in `components/ui`
- Changing the theme in `tailwind.config.js`
- Adding new achievements or game mechanics in `components/weather-dashboard.tsx`

## Deployment

This is a Next.js project, so it can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/weather-wonderland)

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [OpenWeatherMap API](https://openweathermap.org/api) - Weather data
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## Future Enhancements

Possible future enhancements could include:

- Adding more achievements
- Implementing user accounts to save progress
- Adding historical weather data visualization
- Supporting multiple locations/favorites

## License

This project is licensed under the MIT License.

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
   - Copy `.env.local.example` to `.env.local`
   - Replace the placeholder API key with your OpenWeatherMap API key (get one at [OpenWeatherMap](https://openweathermap.org/api))

```bash
cp .env.local.example .env.local
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

The app uses the OpenWeatherMap API to fetch real weather data. If you don't provide an API key, the app will automatically fall back to using enhanced mock data with realistic variations.

### API Service

The weather service is located in `lib/weather-service.ts` and handles:

- Fetching current weather conditions
- Fetching and processing the forecast data
- Handling API errors and retry logic
- Fallback to sophisticated mock data when API keys aren't provided or are invalid

### API Troubleshooting

If you encounter issues with the weather data:

1. Visit the `/api-debug` page in the app to diagnose API connectivity issues
2. Run the API test script to check direct API access: `node scripts/test-api.js`
3. Verify that your API key is correctly set in `.env.local`
4. Check that you're using a valid API key from OpenWeatherMap

The app includes safeguards to handle API failures gracefully:

- Caching prevention to ensure fresh data
- Automatic retries for failed API calls
- Detailed error logging
- Fallback to mock data when necessary

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
- Enhanced weather alerts and notifications
- More detailed weather statistics

## Troubleshooting

### Common Issues

1. **Weather data not updating**

   - Check your OpenWeatherMap API key in `.env.local`
   - Visit the `/api-debug` page to diagnose API issues
   - Clear your browser cache or use incognito mode to test

2. **Search not working**

   - Make sure you're entering a valid city name
   - The city search autocomplete supports cities in the predefined list
   - Try using the location button for geolocation-based weather

3. **Visual glitches**
   - Try toggling between light and dark mode
   - Ensure you're using a modern browser
   - Clear your browser cache

### Debug Tools

The app includes several debugging tools:

- API Debug Page (`/api-debug`) - Test API connectivity directly
- Console logging - Check browser console for detailed logs
- API Test Script - Run `node scripts/test-api.js` for direct API testing

## License

This project is licensed under the MIT License.

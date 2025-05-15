# CarValueAI - Bulgarian Car Valuation Platform

A sophisticated car valuation web application specialized in the Bulgarian automotive market, providing comprehensive pricing insights with advanced market analytics.

## Features

- **Multi-language Support**: Full English and Bulgarian language integration across the entire application
- **Three-Tier Pricing System**:
  - Regular Plan (€15.99): Current market valuation
  - Premium Plan (€29.99): Comprehensive analysis with trends and forecasts
  - Business Plan (€49.99): Complete market analysis for professional use
- **Advanced Market Analytics**: Real-time market data integration with historical trend analysis
- **Responsive Design**: Fully responsive layout for mobile, tablet, and desktop
- **User Authentication**: Secure login and registration system
- **Admin Dashboard**: Comprehensive analytics and management interface
- **BMW Test Valuation**: Specialized valuation for BMW 530d station wagon
- **Interactive Visualization**: Dynamic charts for market trends and price comparisons
- **Guided Onboarding**: User-friendly walkthroughs for first-time users

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **State Management**: React Query for server state
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **Visualization**: Recharts for data visualization
- **Animations**: Framer Motion for UI animations
- **Tours**: React Joyride for guided tours

## Installation

1. Clone the repository:
```bash
git clone https://github.com/DimitrovHr/car-value-ai.git
cd car-value-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_session_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: Reusable UI components
  - `/src/pages`: Application pages
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions and constants
  - `/src/context`: React context providers
- `/server`: Backend Express application
  - `/auth.ts`: Authentication logic
  - `/routes.ts`: API routes
  - `/storage.ts`: Database operations
  - `/marketDataService.ts`: Market data processing
- `/shared`: Shared code between client and server
  - `/schema.ts`: Database schema and validation

## License

Copyright © 2025 DimitrovHr
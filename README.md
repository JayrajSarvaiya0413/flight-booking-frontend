# Thena Flight Booking Frontend

A modern, responsive web application for booking flights built with React, Remix, and Tailwind CSS.

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Remix](https://img.shields.io/badge/Remix-000000?style=for-the-badge&logo=remix&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## 🌟 Features

- **Intuitive Flight Search**: Search for flights with filters for origin, destination, dates, passengers, and cabin class
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **User Authentication**: Secure login and registration with Supabase Auth
- **Booking Management**: View and manage your flight bookings
- **Passenger Information**: Add and edit passenger details
- **Payment Processing**: Simulated payment flow for bookings
- **Booking Confirmation**: Email confirmations and booking details

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API (see [backend repository](https://github.com/yourusername/backend-app))

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
API_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🌐 Deployment

### Deploying to Vercel (Free Tier)

This repository includes configuration for easy deployment to Vercel:

1. Fork or clone this repository to your GitHub account
2. Sign up for a [Vercel account](https://vercel.com)
3. Import your GitHub repository
4. Configure the following environment variables:
   - `API_URL`: Your backend API URL
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
5. Deploy!

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) or the visual guide in [VERCEL_DEPLOYMENT_VISUAL_GUIDE.md](VERCEL_DEPLOYMENT_VISUAL_GUIDE.md).

### Alternative Deployment Options

- **Netlify**: Similar to Vercel with a free tier
- **GitHub Pages**: Free for static sites
- **AWS Amplify**: More complex but highly scalable

## 📁 Project Structure

```
/app
  /components      # Reusable UI components
  /routes          # Application routes
  /styles          # Global styles
  /utils           # Utility functions
  /hooks           # Custom React hooks
  /services        # API service functions
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🔧 Configuration

### Supabase Authentication

This project uses Supabase for authentication. Configure your Supabase project with:

1. Enable Email/Password authentication
2. Set up email templates for verification and password reset
3. Configure redirect URLs for authentication flows

### API Connection

The application connects to the backend API using the `API_URL` environment variable. Make sure your backend is running and accessible.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/) - UI library
- [Remix](https://remix.run/) - Web framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Supabase](https://supabase.com/) - Authentication and database
- [Vercel](https://vercel.com/) - Deployment platform

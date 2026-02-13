# Salon Owner Dashboard

A modern, feature-rich dashboard application for salon and barber shop owners to manage their business operations efficiently.

## 📋 Project Overview

**Salon Owner Dashboard** is a comprehensive web application built with Next.js and React that provides salon/barber shop owners with tools to manage all aspects of their business in one centralized platform. The dashboard offers an intuitive interface with real-time data management, analytics, and operational insights.

### Key Features

- **📊 Dashboard** - Overview of key metrics and business performance
- **👥 Staff Management** - Manage barbers/stylists with attendance tracking
- **📅 Appointments** - Book, track, and manage client appointments
- **⏱️ Time Slots** - Create and manage service time slots
- **📝 Attendance Tracking** - Monitor staff attendance and working hours
- **👤 Client Management** - Maintain client profiles and visit history
- **🔧 Services** - Define and manage salon services
- **💰 Payments** - Track payments and financial transactions
- **📢 Offers & Promotions** - Create and manage special offers
- **📈 Analytics** - View detailed business analytics and insights
- **💬 WhatsApp Integration** - Send messages and notifications via WhatsApp
- **⚙️ Settings** - Configure application preferences

## 🏗️ Tech Stack

### Frontend Framework
- **Next.js 16.1.6** - React meta-framework for production
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe development

### UI Components & Styling
- **Radix UI** - Unstyled, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Shadcn/ui** - High-quality React components built with Radix UI and Tailwind CSS

### Form & State Management
- **React Hook Form** - Performant forms with flexible validation
- **Zod** - TypeScript-first schema validation
- **Next-themes** - Dark/light mode theme provider

### UI Enhancements
- **Embla Carousel** - Carousel component library
- **Sonner** - Toast notification system
- **Date-fns** - Modern date utility library

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - JavaScript linting
- **PostCSS** - CSS transformation tool

## 📂 Project Structure

```
salon-owner-dashboard/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Main dashboard page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── app-sidebar.tsx      # Sidebar navigation
│   ├── theme-provider.tsx   # Theme configuration
│   ├── pages/               # Page components
│   │   ├── dashboard.tsx
│   │   ├── appointments.tsx
│   │   ├── attendance.tsx
│   │   ├── clients.tsx
│   │   ├── payments.tsx
│   │   ├── staff.tsx
│   │   ├── services.tsx
│   │   ├── offers.tsx
│   │   ├── analytics.tsx
│   │   ├── slots.tsx
│   │   ├── whatsapp.tsx
│   │   └── settings.tsx
│   └── ui/                  # UI component library
│       ├── button.tsx
│       ├── card.tsx
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       └── [other UI components...]
├── lib/                     # Utility functions and data
│   ├── data.ts             # Mock data for testing
│   ├── store.ts            # State management
│   └── utils.ts            # Helper functions
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx      # Mobile detection hook
│   └── use-toast.ts        # Toast notification hook
├── styles/                  # Global stylesheets
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
└── components.json         # Component configuration

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   cd "salon-owner-dashboard (1)"
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   Or with npm:
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```
   Or with npm:
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🎨 Theming

The application supports dark and light modes using `next-themes`. The theme configuration is managed in [components/theme-provider.tsx](components/theme-provider.tsx).

## 📱 Responsive Design

The dashboard is fully responsive and mobile-friendly, featuring:
- Adaptive sidebar navigation
- Mobile menu support via the `use-mobile` hook
- Responsive grid layouts using Tailwind CSS

## 🗂️ Data Management

The application uses mock data stored in [lib/data.ts](lib/data.ts) for development and testing. The data structure includes:

- **Barber/Staff** - Employee information and attendance
- **Appointments** - Booking and service records
- **Clients** - Customer profiles and visit history
- **Services** - Available salon services
- **Payments** - Transaction records
- **Offers** - Promotional offers

## 🔌 Component Architecture

### UI Components
All UI components are built using Radix UI primitives and styled with Tailwind CSS. Components are located in [components/ui/](components/ui/).

### Page Components
Each feature is implemented as a separate page component in [components/pages/](components/pages/), making the application modular and maintainable.

### Custom Hooks
- `use-mobile` - Detect mobile screen size
- `use-toast` - Trigger toast notifications

## 🎯 Key Features Breakdown

### Dashboard
Provides a high-level overview of business metrics including today's appointments, staff status, revenue, and client information.

### Appointments & Slots
Manage appointment scheduling with time slot availability, client information, and service selection.

### Staff Management
Track staff members, their roles, attendance status, performance metrics, and revenue contributions.

### Client Management
Maintain comprehensive client profiles with visit history, preferences, and spending data.

### Analytics
Detailed insights into business performance with charts and metrics.

### Payments
Track all financial transactions and payment statuses.

### Settings
Configure application preferences and business settings.

## 🔐 Security Considerations

- Built with TypeScript for type safety
- Form validation using React Hook Form and Zod
- No sensitive data exposed in mock data
- Ready for backend integration

## 🚢 Deployment

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

The application can be deployed to:
- Vercel (recommended for Next.js)
- AWS
- Google Cloud
- Any Node.js hosting platform

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [TypeScript](https://www.typescriptlang.org)

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows the existing style
- TypeScript types are properly defined
- Components are properly documented

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions, please refer to the project structure and documentation.

---

**Last Updated:** February 2026

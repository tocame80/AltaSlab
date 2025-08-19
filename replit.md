# Overview

This is a React-based SPA (Single Page Application) for "АЛЬТА СЛЭБ" - a Russian building materials company specializing in SPC (Stone Plastic Composite) wall and ceiling panels. The application serves as a product catalog and company showcase, featuring product collections, material calculators, installation guides, and contact forms. The site features a modular architecture where key functionality is accessible both as standalone pages and as tabs within product details. The site is built with a modern tech stack including React, TypeScript, Tailwind CSS, and shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (January 2025)

## Hero Image Organization (January 19, 2025)
- Implemented organized file storage structure with dedicated `/hero/` folder for hero images
- Created specialized API endpoints: `/api/hero-images/upload` and `/api/hero-images/set-acl`
- Updated admin panel to use organized storage system
- All hero images now automatically stored in `/objects/hero/` path for better file management
- Hero component successfully displays 5 images with proper error handling and fallbacks

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **Component Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **State Management**: TanStack React Query for server state and local React state for UI state
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture  
- **Server**: Express.js with TypeScript running on Node.js
- **API Structure**: RESTful API with `/api` prefix routing
- **Storage Interface**: Abstracted storage layer with in-memory implementation for users
- **Object Storage**: Organized cloud storage with dedicated folders (`/hero/` for hero images, `/uploads/` for general files)
- **Session Management**: Express sessions with PostgreSQL session store
- **Development Mode**: Vite middleware integration for hot module replacement

## Design System
- **Typography**: Inter font family with custom font loading
- **Color Scheme**: Neutral-based palette with accent colors defined via CSS custom properties
- **Component Variants**: Class Variance Authority (CVA) for consistent component styling
- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities
- **Animation**: Tailwind CSS animations with custom keyframes

## Data Management
- **Product Catalog**: Static data structure for SPC panel collections (concrete, fabric, matte, marble)
- **Accessories**: Static data for installation accessories and tools
- **Filtering/Sorting**: Client-side product filtering by collection, color, surface, size
- **Calculator Logic**: Material calculation based on room area and panel specifications

## User Interface Features
- **Product Showcase**: Grid-based catalog with favorites functionality
- **Hero Image Slider**: Automated slideshow with 5-second intervals, manual navigation controls, and organized cloud storage
- **Material Calculator**: Interactive tool for estimating required materials (standalone page + product tab)
- **Contact Forms**: Comprehensive contact page with form validation (accessible via mail icon in header)
- **Certificates Section**: Document downloads and quality certifications (standalone page + product tab)
- **FAQ System**: Expandable questions and answers (standalone page + product tab)
- **Video Instructions**: Tutorial and demonstration videos (standalone page + product tab)
- **Admin Panel**: Full content management system for hero images, certificates, videos, and catalog data
- **Modular Architecture**: Key features accessible both as standalone pages from header navigation and as tabs within product details
- **Responsive Navigation**: Mobile-friendly header with collapsible menu and direct access to all modules
- **Scroll Management**: Back-to-top functionality and smooth scrolling

# External Dependencies

## UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework with animation and typography plugins
- **class-variance-authority**: Type-safe component variants
- **clsx & tailwind-merge**: Conditional className utilities
- **lucide-react**: Modern icon library

## Development and Build Tools
- **vite**: Fast build tool with HMR and optimized bundling
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment
- **typescript**: Type checking and enhanced developer experience

## Database and ORM
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **drizzle-kit**: Database migrations and schema management
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-zod**: Schema validation integration

## Server and API
- **express**: Web server framework
- **connect-pg-simple**: PostgreSQL session store
- **wouter**: Lightweight routing for React

## Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling and validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **embla-carousel-react**: Carousel/slider functionality
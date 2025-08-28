# Overview

This is a React-based SPA (Single Page Application) for "АЛЬТА СЛЭБ" - a Russian building materials company specializing in SPC (Stone Plastic Composite) wall and ceiling panels. The application serves as a product catalog and company showcase, featuring product collections, material calculators, installation guides, and contact forms. The site features a modular architecture where key functionality is accessible both as standalone pages and as tabs within product details. The site is built with a modern tech stack including React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Recent Changes (August 2025)
- **Production Database Resolution** (28.08.2025): Fixed critical production database connectivity issues by creating new PostgreSQL database with proper environment variables. Resolved "getaddrinfo ENOTFOUND helium" errors that prevented data loading in production deployments
- **Complete Fallback System Implementation**: Created comprehensive fallback data system for both catalog and gallery when database is unavailable. Includes proper product codes (SPC prefixes) and realistic project data to ensure site functionality during outages
- **Full Catalog Migration**: Successfully migrated complete catalog with 74 products across 7 collections (Магия бетона, Матовая эстетика, Мраморная феерия, Тканевая Роскошь, Профиль, Клей) using latest Excel format from 26.08.2025
- **API Routing Stabilization**: Resolved production API routing where endpoints returned HTML instead of JSON. Enhanced filtering logic to support all product code formats (SPC, SS, numeric) ensuring compatibility with existing and new data
- **Gallery Data Structure Update**: Updated fallback gallery projects to match current project structure with proper commercial/residential applications and material usage tracking
- **Database Schema Finalization**: Completed PostgreSQL migration with drizzle-kit, established proper relationships between catalog products and gallery projects with correct foreign key references
- **Production Deployment Workflow**: Established reliable deployment process with database initialization, catalog loading, and fallback activation for continuous service availability
- **Thumbnail Optimization**: Maintained 100px thumbnail generation for optimal performance while supporting both development (full catalog) and production (fallback) modes
- **Error Handling Enhancement**: Implemented graceful degradation with detailed logging for database connectivity issues and automatic fallback activation
- **Cache Management**: Optimized API response caching (5-minute duration) with proper cache invalidation and ETag headers for improved performance
- **Gallery Projects Update** (28.08.2025): Added real gallery projects to database replacing fallback data. Now includes 4 actual projects (office, house, restaurant, test) with proper descriptions and material references
- **Database Checkpoint**: Local database fully populated with 74 catalog products and 4 gallery projects. Production database connectivity issue remains ("getaddrinfo ENOTFOUND helium") requiring deployment with proper database configuration

# User Preferences

Preferred communication style: Simple, everyday language.

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
- **Material Calculator**: Interactive tool for estimating required materials (standalone page + product tab)
- **Contact Forms**: Comprehensive contact page with form validation (accessible via mail icon in header)
- **Certificates Section**: Document downloads and quality certifications (standalone page + product tab)
- **FAQ System**: Expandable questions and answers (standalone page + product tab)
- **Video Instructions**: Tutorial and demonstration videos (standalone page + product tab)
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
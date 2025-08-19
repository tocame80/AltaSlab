# Overview

This is a React-based SPA (Single Page Application) for "АЛЬТА СЛЭБ" - a Russian building materials company specializing in SPC (Stone Plastic Composite) wall and ceiling panels. The application serves as a product catalog and company showcase, featuring product collections, material calculators, installation guides, and contact forms. The site features a modular architecture where key functionality is accessible both as standalone pages and as tabs within product details. The site is built with a modern tech stack including React, TypeScript, Tailwind CSS, and shadcn/ui components.

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
- **Hero Images**: Local asset storage in `client/src/assets/hero/` with TypeScript mapping
- **Image Assets**: Local file system storage with Vite asset processing for products and hero images
- **Filtering/Sorting**: Client-side product filtering by collection, color, surface, size
- **Calculator Logic**: Material calculation based on room area and panel specifications

## User Interface Features
- **Hero Section**: Automatic image slider with local asset management and smooth transitions
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

# Hero Images Management

## Local Asset Storage System
The application uses a local file system for hero images instead of cloud storage for better performance and simpler management.

### File Structure
```
client/src/assets/hero/
├── README.md              # Documentation
├── ИНСТРУКЦИЯ.md         # Russian instructions
├── imageMap.ts           # TypeScript mapping file
├── placeholder-hero.jpg  # Default fallback image
├── hero-1.jpg           # Example hero image
└── hero-2.jpg           # Additional hero images...
```

### Adding New Hero Images
1. **Add Image File**: Place image in `client/src/assets/hero/` directory
2. **Update imageMap.ts**: 
   - Add import statement: `import hero2 from './hero-2.jpg';`
   - Add to heroImages array with metadata (id, title, sortOrder, isActive)
3. **Auto-Reload**: Changes are automatically reflected in the hero slider

### Image Specifications
- **Format**: JPG, PNG, or WebP
- **Aspect Ratio**: 4:3 (1920x1440px recommended)
- **Size**: Under 500KB for optimal loading
- **Quality**: 80-90% JPEG compression recommended

### Management Features
- **Activation/Deactivation**: Set `isActive: false` to hide images
- **Sorting**: Use `sortOrder` property to control display order
- **Automatic Slider**: 5-second auto-advance when multiple images exist
- **Navigation Controls**: Arrow buttons and dot indicators for manual control
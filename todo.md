# RegRisk Platform - Development TODO

## Phase 1: Design System & Setup
- [x] Configure Tailwind CSS with elegant color palette (deep blues, grays, accent colors)
- [x] Set up global typography and design tokens in index.css
- [x] Create reusable component library structure
- [x] Set up Google Fonts for professional typography

## Phase 2: Database Schema
- [x] Create properties table (address, type, year_built, epc_rating, etc.)
- [x] Create compliance_requirements table (regulation type, deadline, status)
- [x] Create compliance_violations table (property, violation type, severity, date)
- [x] Create capex_items table (property, cost estimate, priority, timeline)
- [x] Create regulatory_forecasts table (prediction type, impact, timeline)
- [x] Create user_portfolios table (user ownership of properties)
- [x] Create audit_logs table for tracking changes
- [x] Run migrations with pnpm db:push

## Phase 3: Authentication & Core Layout
- [x] Implement OAuth login flow (already built in template)
- [x] Create DashboardLayout with sidebar navigation (via App.tsx routing)
- [x] Build main navigation structure (Dashboard, Assets, Forecasting, Capex, Reports)
- [ ] Create user profile and settings pages
- [x] Implement role-based access control (admin/user)

## Phase 4: Portfolio Dashboard
- [x] Design dashboard layout with key metrics cards
- [x] Build risk scoring algorithm (high/medium/low classification)
- [x] Create portfolio overview card (total assets, compliance status)
- [x] Build regulatory risk distribution chart (pie/bar chart)
- [x] Create financial exposure visualization (estimated capex by year)
- [x] Build non-lettable assets alert card
- [x] Implement regulatory deadlines timeline
- [x] Add quick action buttons for common tasks

## Phase 5: Asset Management & Compliance Scanner
- [x] Build asset list page with filtering and search
- [ ] Create add/edit property form with all required fields
- [ ] Implement property detail view with compliance status
- [ ] Build compliance scanner that evaluates properties against regulations
- [ ] Create violation flag system with severity levels
- [ ] Build EPC rating risk assessment
- [ ] Implement fire safety compliance checker
- [ ] Add building safety regulation exposure evaluator
- [ ] Create planning restrictions tracker

## Phase 6: Regulatory Forecasting & Capex Planning
- [x] Build forecasting module showing future regulation impacts
- [x] Create scenario modeling (retrofit vs. sell vs. reposition)
- [ ] Implement capex cost estimator
- [ ] Build investment prioritization algorithm (risk + ROI)
- [x] Create capex timeline view (5-year forecast)
- [ ] Build upgrade requirement calculator
- [ ] Implement retrofit cost benchmarking

## Phase 7: Compliance Timeline & Reporting
- [x] Build compliance timeline view (past, current, future)
- [ ] Create violation history tracker
- [ ] Implement regulatory deadline calendar
- [ ] Build PDF export functionality for compliance reports
- [ ] Create capex budget export feature
- [ ] Implement portfolio summary report generation
- [ ] Add data filtering for custom reports

## Phase 8: Polish & Testing
- [ ] Add loading states and skeleton screens
- [ ] Implement error handling and user feedback
- [ ] Create sample portfolio data for demo
- [ ] Write vitest tests for all core algorithms
- [ ] Test compliance scanner accuracy
- [ ] Verify risk scoring calculations
- [ ] Responsive design testing across devices
- [ ] Performance optimization and caching
- [ ] Accessibility audit and fixes

## Phase 9: Deployment
- [ ] Final QA and bug fixes
- [ ] Create checkpoint for deployment
- [ ] Deploy to production

## Phase 8b: Typography & Sample Data
- [x] Update typography to sleek modern fonts (Inter only for clean, modern look)
- [x] Create seed data script with realistic UK commercial properties
- [x] Generate fake portfolio with 8-12 properties across UK regions
- [x] Include realistic EPC ratings, compliance status, and retrofit costs
- [x] Populate dashboard with real numbers and metrics


## Phase 9: Advanced USP Features (New)

### AI Risk Scoring & Predictive Analytics
- [x] Extend database schema with predictive metrics table
- [x] Build AI-powered dynamic risk scoring algorithm combining EPC, age, location, regulatory trajectory
- [x] Create predictive analytics page showing which properties will become non-lettable first
- [x] Implement retrofit prioritization recommendations
- [x] Add risk trend charts and forecasting visualizations

### Retrofit ROI Optimizer
- [x] Build ROI calculation engine for capex projects
- [x] Create capex ranking by ROI, payback period, and compliance urgency
- [x] Implement financing scenario modeling
- [x] Add ROI comparison charts and investment timeline
- [x] Build capex optimization recommendations page

### Regulatory Impact Simulator
- [x] Create "what-if" scenario builder UI
- [x] Implement scenario modeling engine (EPC tightening, net zero deadlines, etc.)
- [x] Build impact analysis showing affected properties and costs
- [x] Add scenario comparison and export functionality
- [x] Create scenario history/saved scenarios feature

### Peer Benchmarking
- [x] Build anonymized market data aggregation system
- [x] Create peer comparison dashboard showing portfolio vs market averages
- [x] Implement EPC distribution, compliance rates, capex spend benchmarks
- [x] Add competitive positioning insights and recommendations
- [x] Build benchmark trend analysis

### Compliance Timeline Automation
- [x] Extend database with compliance task scheduling
- [x] Build Gantt chart visualization for regulatory deadlines
- [x] Implement critical path analysis for compliance dependencies
- [x] Create automated calendar export (iCal format)
- [x] Add timeline alerts and notifications

### Tenant Communication Hub
- [x] Build tenant letter template generator
- [x] Create compliance communication templates
- [x] Implement bulk tenant notification system
- [x] Add FAQ generator for common compliance questions
- [x] Build communication history and tracking


## Phase 12: Property Details, PDF Export & EPC API Integration

### Property Detail Modals
- [x] Create PropertyDetailModal component with tabs (Overview, Compliance, Violations, Capex, Timeline)
- [x] Build compliance history timeline within modal
- [x] Add violation details with severity and remediation steps
- [x] Implement capex breakdown and retrofit recommendations
- [x] Add tenant information and contact details
- [x] Integrate modal into Assets page and Dashboard

### PDF Export Functionality
- [x] Install PDF generation library (pdfkit or similar)
- [x] Create PDF template for compliance reports
- [x] Build PDF template for capex budgets
- [x] Implement scenario analysis PDF export
- [x] Add logo, branding, and professional formatting
- [x] Create bulk export for multiple properties

### EPC API Integration
- [x] Research and integrate EPC Register API for real property data
- [x] Build property lookup by address/postcode
- [x] Auto-populate EPC ratings from official registry
- [x] Implement data sync for compliance status updates
- [x] Create background job for periodic data refresh
- [x] Add error handling for API failures


## Phase 13: Temporary Share Links

### Share Link System
- [x] Extend database schema with share_links table (token, expiry, permissions)
- [x] Create share link generation API endpoint
- [x] Build share link management UI in Dashboard
- [x] Implement public share link page (no login required)
- [x] Add expiry time options (24h, 7d, 30d, custom)
- [x] Create view-only access mode for shared links
- [x] Add link revocation functionality
- [x] Implement access tracking for shared links


## Phase 14: Fix Public Share Link Routing
- [x] Fix public share link routing to bypass authentication
- [x] Ensure /share/:token route works without login
- [x] Test share link access from public URL


## Phase 15: Premium Design Overhaul

### Typography & Logo
- [ ] Update font stack to premium choices (Geist or similar for modern feel)
- [ ] Design modern RegRisk logo (sleek, minimal, professional)
- [ ] Improve color palette for sophistication and contrast
- [ ] Update all heading and body text styles

### Navigation Redesign
- [ ] Redesign DashboardNav with dropdown menu or boxed tabs
- [ ] Improve navigation styling to look more polished
- [ ] Fix text overlap issues in header
- [ ] Add hover states and transitions

### Dashboard Layout
- [ ] Fix header layout to prevent text overlap
- [ ] Improve metric card spacing and alignment
- [ ] Add subtle shadows and borders for depth
- [ ] Refine component styling throughout

### Overall Polish
- [ ] Update all page layouts for consistency
- [ ] Add modern micro-interactions and transitions
- [ ] Improve spacing and visual hierarchy
- [ ] Ensure responsive design looks premium on all devices


## Phase 16: Design Consistency & Property Management

### Apply Premium Design to All Pages
- [x] Refine Assets page layout with premium card styling
- [ ] Refine Analytics page with better chart styling
- [ ] Refine ROI Optimizer page layout
- [ ] Refine Forecasting page with improved visualizations
- [ ] Refine Simulator page layout
- [ ] Refine Benchmarking page styling
- [ ] Refine Timeline page with Gantt chart improvements
- [ ] Refine Capex Planning page layout
- [ ] Refine Reports page styling
- [ ] Refine Communications page layout

### Property Add/Edit Modals
- [x] Create PropertyFormModal component with form validation
- [x] Implement add property functionality
- [x] Implement edit property functionality
- [x] Add form fields for EPC rating, property type, address, etc.
- [x] Integrate modals into Assets page
- [x] Add delete property functionality
- [x] Write vitest tests for property CRUD operations
- [x] Test form validation and error handling


## Phase 17: Premium Design Overhaul (Stripe/Sortable Standard)

### Logo & Branding Redesign
- [x] Create elegant RegRisk logo (modern, minimal, professional)
- [x] Design logo variations (full, icon-only, light/dark modes)
- [x] Update favicon with new logo
- [x] Implement logo in header with proper sizing and spacing

### Navigation Redesign
- [x] Replace "Pages" dropdown with elegant navigation menu
- [x] Create navigation items with icons (Dashboard, Assets, Analytics, etc.)
- [x] Add hover effects and smooth transitions
- [x] Implement mobile-responsive navigation drawer
- [x] Add breadcrumb navigation for better UX

### Design System Enhancement
- [x] Refine color palette with more sophisticated gradients
- [x] Update button styles with better hover/active states
- [x] Improve card styling with subtle shadows and borders
- [x] Add micro-interactions and smooth animations
- [x] Ensure consistent spacing and typography across all pages

### Apply Premium Design to All Pages
- [ ] Refine Dashboard with enhanced metrics cards
- [ ] Refine Assets page with improved property cards
- [ ] Refine Analytics page with better chart styling
- [ ] Refine ROI Optimizer page layout
- [ ] Refine Forecasting page with improved visualizations
- [ ] Refine Simulator page layout
- [ ] Refine Benchmarking page styling
- [ ] Refine Timeline page with Gantt chart improvements
- [ ] Refine Capex Planning page layout
- [ ] Refine Reports page styling
- [ ] Refine Communications page layout
- [ ] Refine Share Links page styling


## Phase 18: Airtable-Inspired Landing Page Redesign

### Logo Redesign
- [ ] Create professional RegRisk logo with modern, sophisticated design
- [ ] Design logo mark (icon) and wordmark variations
- [ ] Ensure logo works in light and dark modes
- [ ] Update favicon with new logo

### Landing Page Redesign
- [ ] Create hero section with compelling headline and subheading
- [ ] Add animated feature showcase sections
- [ ] Build feature cards with icons and descriptions
- [ ] Create use case section showing real-world scenarios
- [ ] Add pricing/value proposition section
- [ ] Build testimonials section with investor quotes
- [ ] Create FAQ section addressing common questions
- [ ] Add comparison table vs competitors
- [ ] Improve overall visual hierarchy and spacing
- [ ] Add micro-interactions and smooth animations


## Phase 19: Landing Page Header & Hero Redesign
- [ ] Create professional RegRisk logo (not just "R" badge)
- [ ] Redesign header navigation with better styling
- [ ] Center hero section content and CTA button
- [ ] Improve hero text copy and typography
- [ ] Add hero background design (gradient or subtle pattern)
- [ ] Style CTA button with better design and hover effects
- [ ] Ensure responsive design for mobile


## Phase 20: Dashboard Layout Redesign
- [x] Fix header overlap issue with "RegRisk Regulatory Intelligence Home" text
- [x] Move navigation to left sidebar or dropdown menu
- [x] Condense dashboard layout for better space utilization
- [x] Improve dashboard card spacing and visual hierarchy


## Phase 21: Platform Optimization for Friends & Family Review

### Apply Sidebar Navigation to All Pages
- [x] Update Assets page to use sidebar layout
- [x] Update Analytics page to use sidebar layout
- [x] Update ROI Optimizer page to use sidebar layout
- [x] Update Forecasting page to use sidebar layout
- [x] Update Simulator page to use sidebar layout
- [x] Update Benchmarking page to use sidebar layout
- [x] Update Timeline page to use sidebar layout
- [x] Update Capex page to use sidebar layout
- [x] Update Reports page to use sidebar layout
- [x] Update Communications page to use sidebar layout
- [x] Update Share Links page to use sidebar layout

### Add Loading States & Skeleton Screens
- [x] Create skeleton loader components for cards and charts
- [x] Add loading states to all data-fetching pages
- [x] Show spinners during API calls
- [x] Improve perceived performance with visual feedback

### Implement Toast Notifications
- [x] Create toast notification component
- [x] Add success notifications for property CRUD operations
- [x] Add success notifications for report exports
- [x] Add error notifications for failed operations
- [x] Add info notifications for user actions

### Polish Landing Page
- [x] Add testimonials/social proof section
- [x] Add trust badges (security, compliance certifications)
- [x] Improve headline and value proposition copy
- [x] Add FAQ section with common questions
- [x] Improve CTA button visibility and messaging
- [x] Add case study or use case examples

### Final Testing & Checkpoint
- [x] Test all pages with sidebar navigation
- [x] Verify loading states appear correctly
- [x] Test toast notifications on all actions
- [x] Check responsive design on mobile
- [x] Verify landing page improvements
- [x] Save checkpoint with all improvements


## Phase 22: Competitive Analysis Implementation

### Landing Page Optimization
- [ ] Rewrite hero section: "Forecast Compliance Changes 6 Months Early"
- [ ] Add regulatory drivers section (EPC C deadline, Building Safety Act, MEES)
- [ ] Replace generic features with specific use cases
- [ ] Add specific buyer testimonials with metrics (£2M savings, 28% cost reduction)
- [ ] Create competitive comparison section (vs Yardi, AppFolio, compliance tools)
- [ ] Add FAQ addressing key buyer concerns

### Buyer Persona Messaging
- [ ] Create Portfolio Manager messaging (decision maker focus)
- [ ] Create Asset Manager messaging (day-to-day user focus)
- [ ] Create Finance Director messaging (budget controller focus)
- [ ] Add persona-specific CTAs and value propositions

### Feature Enhancements
- [ ] Enhance risk scoring dashboard with top 20% at-risk properties
- [ ] Add compliance forecasting visualization (predict EPC C failures)
- [ ] Create capex prioritization ranking (risk urgency + ROI)
- [ ] Add portfolio-level risk aggregation metrics

### Marketing Content
- [ ] Create blog post: "EPC C Deadline: Which UK Properties Are At Risk?"
- [ ] Create whitepaper: "Building Safety Act Compliance Guide"
- [ ] Create case study template with specific metrics
- [ ] Create ROI calculator for prospects

### Messaging Strategy
- [ ] Implement "See Compliance Risk Before It Happens" messaging
- [ ] Implement "Turn Compliance Into Competitive Advantage" messaging
- [ ] Implement "Built for UK Real Estate" messaging
- [ ] Implement "Reduce Capex Costs by 20-30%" messaging


## Phase 23: EPC Integration & Real Data MVP

### Database Schema
- [x] Update properties table with EPC data fields and risk scoring
- [x] Create compliance_events table for tracking
- [x] Run database migrations

### EPC API Integration
- [x] Build EPC Open Data API client service
- [x] Implement address-to-EPC lookup
- [x] Parse EPC response and extract key data
- [x] Handle API errors and fallbacks

### Risk Scoring Algorithm
- [x] Implement risk score calculation (0-100)
- [x] Calculate time to EPC C deadline
- [x] Estimate upgrade costs from EPC recommendations
- [x] Generate risk band (Low/Moderate/High/Critical)
- [x] Build compliance forecast (6m, 12m, 24m)

### tRPC Procedures
- [x] Create property.add with EPC auto-enrichment
- [x] Create property.list with real data
- [x] Create property.getById with full details
- [x] Create property.delete
- [x] Create property.lookupEPC
- [x] Create portfolio.summary with real metrics

### Add Property Form
- [x] Build address input with postcode validation
- [x] Add property type selector
- [x] Show EPC data preview after lookup
- [x] Display risk score after calculation

### Assets & Dashboard Update
- [x] Show real property list from database
- [x] Display EPC ratings with color coding
- [x] Show risk scores and bands
- [x] Calculate real portfolio metrics
- [x] Update dashboard charts with real data


## Phase 24: Messaging & Data Accuracy Update
- [ ] Audit landing page for inaccurate/misleading data
- [ ] Rewrite hero and features to focus on portfolio-level value (prioritisation, fines avoidance, time savings)
- [ ] Fix testimonials with realistic metrics
- [ ] Update ROI calculator with accurate savings model (avoided fines, sequencing savings, time savings)
- [ ] Fix pricing page messaging to emphasise portfolio decision-making
- [ ] Remove misleading per-property cost reduction claims
- [ ] Use realistic industry data throughout


## Phase 25: Landing Page Redesign & Feature Additions

### Deep Research
- [ ] Research ideal customer pain points in UK real estate compliance
- [ ] Identify what sells in PropTech/RegTech SaaS
- [ ] Analyze what's missing in the market
- [ ] Define core value props that differentiate RegRisk

### Landing Page Redesign
- [ ] Rewrite hero to lead with strategic value (ROI, risk overview, decision support)
- [ ] Streamline features - highlight 3-4 most important, not all 13
- [ ] Add pricing link to landing page top navigation
- [ ] Make landing page feel like a strategic tool, not just EPC checker

### Property Detail Page
- [ ] Create property detail view with full EPC breakdown
- [ ] Show improvement recommendations with costs
- [ ] Add visual energy rating chart
- [ ] Display risk score breakdown

### Demo Form Notifications
- [ ] Wire demo request form to email notification system
- [ ] Send notification to owner when demo is requested


## Phase 20: Major Rebrand - RegRisk to Veridia

### Brand Identity
- [x] Rename from RegRisk to Veridia across all files
- [x] New color palette (teal/emerald primary, warm neutrals)
- [x] New typography (Inter for clean Airtable-inspired look)
- [x] New logo design (modern, minimal)
- [x] Update VITE_APP_TITLE to Veridia

### Navigation Consolidation (13 → 5 sections)
- [x] Portfolio (Dashboard + Analytics + Benchmarking)
- [x] Properties (Assets + Property Detail + Capex)
- [x] Compliance (Forecasting + Timeline + Simulator)
- [x] Reports (Reports + Share Links + Communications)
- [x] Settings (Pricing + Profile)

### Landing Page Redesign
- [x] Airtable-inspired clean white aesthetic
- [x] Portfolio intelligence positioning (not just compliance)
- [x] Target: asset/portfolio managers and finance teams
- [x] Updated hero, features, testimonials, CTA sections
- [x] Demo request form
- [x] Pricing link in nav

### Dashboard Redesign
- [x] Clean, spacious Airtable-inspired layout
- [x] Better data visualization
- [x] Consolidated metrics

### Pricing Page Update
- [x] New brand colors and styling
- [x] Updated messaging for portfolio managers


## Phase 21: UX Fixes & Data Quality

### Landing Page Fixes
- [x] Fix pricing nav link to scroll to pricing section (not go to dashboard)
- [x] Strengthen hero headline - more compelling than "Know which properties to upgrade first"
- [x] Center-align the "Portfolio intelligence, not just compliance tracking" section and content below it
- [x] Research and add additional data sources beyond EPC (Land Registry, flood risk, planning, etc.)

### Sample Data Quality
- [x] Replace fake property data with real UK properties (Selfridges, actual postcodes)
- [x] Mix of retail, commercial, and residential properties
- [x] Remove all "property to delete" entries
- [x] Use realistic property names and addresses

### Restore Missing Features
- [x] Restore property detail modal with ROI analysis
- [x] Restore upgrade recommendations in property detail
- [x] Ensure clicking a property shows full details

### Chart Improvements
- [x] Fix 5-Year Capex Forecast chart - better x/y axis labels and numbering

## Phase 22: Data Integration, Design Polish & Residential Properties

### Flood, Planning & Land Registry Data
- [x] Research and integrate Environment Agency Flood Risk API
- [x] Add flood_risk, planning_status, land_registry fields to properties schema
- [x] Populate demo properties with real flood zone data
- [x] Add planning application and Land Registry data for demo properties
- [x] Auto-fetch flood risk when adding new property by postcode

### Data Formatting Fixes
- [x] Fix retrofit costs to use realistic rounded numbers (not £1208K)
- [x] Fix MEES compliant badge alignment (wonky layout)

### Residential Properties
- [x] Add residential properties to sample data (mix with commercial)

### Apply Veridia Design to All Inner Pages
- [x] Forecasting page - apply teal design
- [x] Simulator page - apply teal design
- [x] Reports page - apply teal design
- [x] Communications page - apply teal design
- [x] Timeline page - apply teal design
- [x] Analytics/Benchmarking page - apply teal design
- [x] Capex Planning page - apply teal design


## Phase 23: Major Feature Update

### Mobile Responsiveness
- [ ] Fix landing page for mobile devices
- [ ] Fix dashboard sidebar for mobile (collapsible hamburger menu)
- [ ] Fix property cards for mobile layout
- [ ] Fix all inner pages for mobile responsiveness

### Property Detail - Full Page View
- [ ] Replace small popup modal with full-page property detail view
- [ ] Ensure all data (flood, planning, land registry, capex, ROI) fits properly
- [ ] Add back navigation from detail page

### Cost Formatting Fixes
- [ ] Audit and fix ALL cost formatting across entire codebase (no more £102868K)
- [ ] Create shared formatCurrency utility function
- [ ] Apply consistent formatting to all pages

### Portfolio Valuations
- [ ] Add portfolio value fields to schema (currentValue, estimatedYield, capitalGrowth)
- [ ] Create Portfolio Valuations dashboard view
- [ ] Show current values, yield, capital growth alongside risk data
- [ ] Add portfolio total value summary

### Pre-Acquisition Due Diligence
- [ ] Build "Check Before You Buy" tool
- [ ] Enter postcode/address to get instant risk assessment
- [ ] Pull EPC, flood risk, planning data for any UK property
- [ ] Show risk score, estimated retrofit cost, compliance status

### Live Flood Risk API
- [ ] Integrate Environment Agency Flood Risk API for real-time data
- [ ] Auto-fetch flood data when adding new property by postcode

### Property Comparison
- [ ] Build side-by-side comparison view for 2-3 properties
- [ ] Compare risk, capex, ROI, flood risk, compliance status

### Board-Ready PDF Export
- [ ] Include flood, planning, Land Registry data in PDF reports
- [ ] Professional formatting suitable for board presentations


## Phase 25: Critical Fixes & Deal Screen Build

### 1. Audit Live Data Connections
- [ ] Audit all visible features for live vs dummy data
- [ ] Identify which features show placeholder/hardcoded data
- [ ] Mark dummy features with "Coming Soon" badge or hide them
- [ ] Document which APIs are connected and working

### 2. Connect Real APIs
- [ ] Connect UK EPC data API (https://epc.opendatacommunities.org/docs/api)
- [ ] Connect Environment Agency Flood Risk API (https://environment.data.gov.uk/flood-monitoring)
- [ ] Connect HM Land Registry API (https://use-land-property-data.service.gov.uk/datasets)
- [ ] Add data source and timestamp display for all data points

### 3. Build Deal Screen
- [x] Add "Deal Screen" to main navigation
- [x] Build input form (address/postcode, asset type, EPC rating, GIA, hold period)
- [x] Fetch live EPC data from government API
- [x] Calculate MEES compliance status
- [x] Estimate retrofit capex range (low/mid/high)
- [x] Fetch flood risk zone from Environment Agency
- [x] Calculate Stranded Asset Risk Score (0-100, color coded)
- [x] Generate underwriting flag (Proceed / Price In CapEx / High Risk)
- [x] Save reports to user account history

### 4. Build Deal Screen PDF Export
- [x] Generate properly formatted PDF with Veridia branding
- [x] Include all data fields and sources
- [x] Add legal disclaimer
- [x] Make PDF downloadable from deal screen

### 5. Build Early Access Signup Page
- [x] Create public page at /early-access (no login required)
- [x] Build signup form (name, email, company, role, portfolio size)
- [x] Save submissions to database
- [x] Send confirmation email to user
- [x] Send notification email to owner with details
- [x] Show "You're on the list" message after submission
- [x] Make page publicly shareable

### 6. Remove Fake Testimonials
- [x] Remove Sarah Chen, James Mitchell, Emma Richardson testimonials
- [x] Replace with "Currently in early access with UK property professionals"
- [x] Remove from all pages where they appear

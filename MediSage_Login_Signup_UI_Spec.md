# MediSage Login & Signup UI/UX Specification

## Objective

Redesign the Login and Signup pages so they match the premium dark theme
used throughout the MediSage dashboard. The experience should feel like
users are entering an AI-powered healthcare platform rather than a
generic authentication page.

------------------------------------------------------------------------

# Design Principles

-   Dark theme throughout
-   Modern AI SaaS aesthetic
-   Glassmorphism cards
-   Cyan/blue accent colors
-   Rounded corners (16px)
-   Smooth animations
-   Professional healthcare branding
-   Consistent with the dashboard UI

------------------------------------------------------------------------

# Color Palette

  Element                Color
  ---------------------- -----------
  Background             `#050B1A`
  Secondary Background   `#0B1220`
  Card                   `#111827`
  Primary Accent         `#22D3EE`
  Secondary Accent       `#3B82F6`
  Text                   `#F8FAFC`
  Muted Text             `#94A3B8`
  Success                `#10B981`
  Warning                `#F59E0B`
  Error                  `#EF4444`

------------------------------------------------------------------------

# Login Page Layout

## Recommended Layout

Use a **60/40 split-screen layout**.

### Left Panel

-   MediSage logo
-   Tagline
-   Product introduction
-   Feature highlights
-   Dashboard preview
-   Health score gauge
-   AI chatbot preview

### Right Panel

-   Login card
-   Email
-   Password
-   Remember me
-   Forgot password
-   Sign In button
-   Google Sign In
-   Create Account link

------------------------------------------------------------------------

# Hero Content

## Heading

> **Understand Your Health with AI**

## Description

Upload your blood reports, receive AI-powered analysis, predict health
risks, and chat with an intelligent healthcare assistant---all in one
secure platform.

------------------------------------------------------------------------

# Feature Highlights

-   AI Blood Report Analysis
-   Disease Risk Prediction
-   AI Health Assistant
-   Health Dashboard
-   Secure Cloud Storage
-   Health History Tracking

------------------------------------------------------------------------

# Dashboard Preview

Display a blurred or live preview of the actual MediSage dashboard
showing:

-   Health Score
-   Blood Pressure
-   HbA1c
-   Glucose
-   LDL
-   HDL
-   AI Assistant popup

This creates continuity between authentication and the application.

------------------------------------------------------------------------

# Login Form

Fields

-   Email
-   Password

Options

-   Remember Me
-   Forgot Password

Buttons

-   Sign In
-   Continue with Google

Footer

> Don't have an account? **Create Account**

------------------------------------------------------------------------

# Signup Page

## Heading

> **Create Your MediSage Account**

Subtitle

Start understanding your health with AI in minutes.

Fields

-   Full Name
-   Email
-   Password
-   Confirm Password

Buttons

-   Create Account
-   Continue with Google

Footer

Already have an account? **Sign In**

------------------------------------------------------------------------

# Signup Benefits

Display beside or above the form.

-   AI Health Analysis
-   Unlimited Report History
-   AI Medical Chat
-   Personalized Recommendations
-   Health Dashboard
-   Disease Risk Prediction

------------------------------------------------------------------------

# Password Strength Indicator

Show real-time strength.

Examples

-   Weak
-   Medium
-   Strong

Display a progress bar with color changes.

------------------------------------------------------------------------

# Trust Indicators

Below the form display badges such as:

-   Secure & Encrypted
-   AI Powered
-   Private Reports
-   Cloud Sync

Avoid claiming certifications (e.g., HIPAA compliant) unless they are
actually implemented.

------------------------------------------------------------------------

# Forgot Password

Use a dedicated screen.

Heading:

> Reset Your Password

Description:

Enter your registered email address and we'll send you a password reset
link.

------------------------------------------------------------------------

# Email Verification

After signup display:

> Verify Your Email

We've sent a verification link to your email address.

Please verify your account before signing in.

------------------------------------------------------------------------

# Animations

Use Framer Motion.

Recommended animations:

-   Fade In
-   Slide Up
-   Floating Dashboard Preview
-   Button Glow
-   Input Focus Glow
-   Hover Lift
-   Glass Shine
-   Smooth Page Transition

------------------------------------------------------------------------

# Responsive Design

## Desktop

-   Split layout
-   Dashboard preview
-   Large login card

## Tablet

-   Reduced preview
-   Centered form

## Mobile

-   Single column
-   Full-width form
-   Collapsible content
-   Optimized spacing

------------------------------------------------------------------------

# User Experience

The authentication flow should communicate:

1.  Professional healthcare platform
2.  AI-powered technology
3.  Security and privacy
4.  Ease of use
5.  Visual consistency with the dashboard

The transition from **Homepage → Login → Dashboard** should feel
seamless, making users feel they are interacting with one polished
product.

------------------------------------------------------------------------

# Optional Enhancements

-   Animated DNA helix in the background
-   Floating medical icons
-   Live health score gauge
-   Typing animation from the AI assistant
-   Dashboard screenshot carousel
-   Soft particle background
-   Glassmorphism effects
-   Gradient CTA buttons
-   Skeleton loading states

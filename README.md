# One Thought - A simple Next.js Blog Platform

A modern blogging system built with Next.js 15 (React 19), offering core WordPress-like functionality with full control and performance. Ideal for developers looking to deploy a ready-to-use blog with dynamic content management and SEO optimization.

## Features

- Write and manage blog posts
- Assign categories and tags to posts
- Media library for image uploads
- Footer with dynamic page links (e.g. Legal Notice, Privacy Policy)
- Contact form for user messages
- Cookie consent popup with optional Google Analytics tracking
- Configurable site title, description, logo, and email settings
- SEO and social media optimized (Open Graph, meta tags, dynamic titles)
- Fully functional immediately after deployment

## Setup Instructions

### 1. Create a Project on Vercel

- Sign in to [Vercel](https://vercel.com/)
- Create a new project from this repository

### 2. Create a Neon Serverless PostgreSQL Database

- Create a new Neon Postgres Serverless database
- Copy the connection strings and set them in your `.env.local`

### 3. Set Up Blob Storage

- Set up a Blob Storage
- Copy the token and set it in your `.env.local`
- Optional: specify a custom folder for blog media uploads

### 4. Configure Authentication with Clerk

- Sign in to [Clerk.dev](https://clerk.dev/)
- Create a project and copy the credentials to your `.env.local`

#### Customize the session token

- In the Clerk dashboard, go to:
  `Configure -> Session -> Customize session token`
- Enter the following JSON:

```json
{
  "public_metadata": "{{user.public_metadata}}"
}
```

#### Webhooks for User Creation and Deletion

- In the Clerk dashboard, under Configure -> Webhooks, add:

    - Event: user.created
    
        Endpoint: https://[your-domain]/api/webhooks/user-created

    - Event: user.deleted
    
        Endpoint: https://[your-domain]/api/webhooks/user-deleted

- Add the Signing Secrets to your .env.local

### Set Up Crypto Module for Encryption

- Run in terminal:
```
openssl rand -base64 32  # -> ENCRYPTION_KEY
openssl rand -base64 16  # -> ENCRYPTION_IV
```

- Add the values to your .env.local

### 5. Deploy the project
- Customize the install command: npm install --legacy-peer-deps
- Copy the keys from your .env.local into the envionment variables section
- Deploy and have fun!

# JITC Event Management System

## Overview

The JITC Event Management System is a comprehensive web application designed to streamline the process of organizing and managing events for JITC (Josephite IT Club). This platform allows organizers to create and manage events, while providing an intuitive interface for participants to register and track their registrations.

## Features

### For Attendees
- Browse upcoming and ongoing events
- View detailed event information including venue, date, time, and requirements
- Register for events with customized registration forms
- Registration confirmation system with review step
- Payment tracking for paid events

### For Administrators
- Secure admin dashboard with role-based permissions
- Create, edit, and manage events
- Define event segments and custom registration fields
- View and filter event registrations
- Export registration data to CSV for further analysis
- Manage admin accounts with proper permission controls

## Technology Stack

- **Frontend**: React.js with TypeScript
- **State Management**: React Context API
- **UI Framework**: Custom components with Tailwind CSS
- **Backend**: Supabase (Database, Authentication)
- **Hosting**: Vercel

## Installation and Setup

1. Clone the repository
   ```bash
   git clone https://github.com/helloimabid/jitc-event.git
   cd jitc-event/clubfolio
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Admin Roles and Permissions

The system has two types of admin roles:

### Super Admin
- Can create, edit, and delete events
- Can create both regular admins and super admins
- Can delete other admin accounts
- Can change passwords for any admin account
- Has access to all system features

### Regular Admin
- Can create, edit, and delete events
- Can only manage their own password
- Cannot create super admin accounts or delete other admin accounts
- Cannot reset passwords for other admin accounts

## Scripts

### Adding a Super Admin

To add a super admin account:

```bash
node scripts/add-super-admin.js
```

This will create a super admin with the configured username and password.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is developed by JITC developers.

## Credits

Developed and maintained by the JITC development team.

# Settings Management Frontend

## Overview
Frontend implementation for the system settings and user profile management with configuration options, security settings, and account management for Triple A Gamefarm.

## File Structure

```
app/admin/settings/
├── page.tsx                     # Main settings overview page
├── password/
│   └── page.tsx                 # Password change and security settings
├── profile/
│   └── page.tsx                 # User profile management
└── components/
    └── skeleton-loading.tsx     # Loading skeletons for settings pages
```

## Components

### Main Settings Pages

#### Settings Overview (`page.tsx`)
- **General Settings**: Farm information and basic configuration
- **Navigation**: Links to profile and password settings
- **Settings Cards**: Organized configuration sections
- **Form Management**: General farm data editing

#### Profile Settings (`profile/page.tsx`)
- **User Profile**: Personal information management
- **Avatar Upload**: Profile photo with preview
- **Contact Information**: Email, phone, address details
- **Bio Section**: Professional information editing
- **Save Functionality**: Profile update with toast notifications

#### Password Settings (`password/page.tsx`)
- **Security Settings**: Password change functionality
- **Current Password Verification**: Required for security
- **New Password Input**: With strength validation
- **Password Confirmation**: Match validation
- **Security Tips**: Best practices display

### Key Features
- **Profile Editing**: Update personal information and avatar
- **Password Management**: Secure password change with validation
- **General Settings**: Farm information and system configuration
- **Loading States**: Skeleton loaders for all settings sections
- **Toast Notifications**: Success/error messages for all actions

## Current Implementation

### Data Source
- Uses mock data with sample settings and profile information
- Simulated API calls with loading states
- Form validation with real-time feedback
- Success/error message handling

### Settings Navigation
- Uses `SettingsNav` component from `@/components/dashboard/settings-nav`
- Active state highlighting for current section
- Responsive navigation for mobile/desktop
- Breadcrumb support for settings hierarchy

### Form Implementation
- **Profile Form**: 
  - Avatar with upload placeholder
  - Name, email, phone inputs
  - Bio textarea for professional info
  - Save/cancel actions with validation

- **Password Form**:
  - Current password required for verification
  - New password with strength indicator
  - Confirm password with match validation
  - Security tips and best practices

- **General Settings Form**:
  - Farm name and contact information
  - Business details and configuration
  - Save functionality with toast feedback

## Styling

### Design System
- **Primary Color**: #3d6c58 (medium green)
- **Secondary**: #1f3f2c (dark green)
- **Accent**: #c7e8d3 (light green)
- **Status Colors**: Green (success), Red (error), Blue (info)
- **Non-rounded**: All components use sharp corners
- **Framework**: Tailwind CSS with shadcn/ui components

### Form Styling
- Consistent input field styling with focus states
- Error states with clear messaging and borders
- Disabled states during loading operations
- Hover states for interactive elements

### Layout Design
- Card-based layout for settings sections
- Consistent spacing and typography
- Responsive grid layouts for form fields
- Mobile-first responsive design

## State Management

### Local State
- **Profile Data**: User information and avatar
- **Password Data**: Current, new, and confirm passwords
- **General Settings**: Farm configuration data
- **Loading States**: Form submission and data fetching
- **Error States**: Validation and API error handling

### Form Validation
- Real-time validation for all form fields
- Password strength checking
- Required field validation
- Email format validation
- Password confirmation matching

### Toast System
```typescript
// Success messages
toast.success('Profile updated successfully')
toast.success('Password changed successfully')
toast.success('Settings saved successfully')

// Error messages
toast.error('Failed to update profile')
toast.error('Password change failed')
toast.error('Please check all required fields')
```

## Integration Points

### Current Mock Functions
Based on the actual implementation:
```typescript
// Profile management
handleUpdateProfile(data)       // Updates user profile
handleAvatarUpload(file)        // Uploads profile image
handleDeleteAvatar()            // Removes profile image

// Security settings
handleChangePassword(data)      // Updates password with validation
handleSecurityUpdate(settings)  // Updates security preferences

// General settings
handleUpdateGeneralSettings(data) // Updates farm configuration
handleSaveSettings()            // Saves all settings changes
```

### Component Structure
```typescript
// Profile page components
<Avatar> component for profile photo
<Input> components for form fields
<Button> components for actions
<Card> components for section grouping

// Password page components  
<Label> for form field descriptions
<Input> with type="password" for security
<div> for security tips and guidelines
```

## Settings Features

### User Profile Management
- **Personal Information**: Name, email, phone, address
- **Profile Photo**: Avatar upload with preview
- **Professional Bio**: Textarea for detailed information
- **Contact Details**: Multiple contact methods
- **Save/Cancel**: Form management with validation

### Security Settings
- **Password Change**: Secure password update workflow
- **Current Password**: Required verification step
- **Password Strength**: Visual strength indicator
- **Security Tips**: Best practices guidance
- **Session Management**: Login activity tracking

### General Configuration
- **Farm Information**: Business details and branding
- **Contact Settings**: Public contact information
- **System Preferences**: Application configuration
- **Notification Settings**: Email and alert preferences
- **Regional Settings**: Timezone and format preferences

## Responsive Design

### Breakpoints
- **Mobile**: Stacked form layout, simplified navigation
- **Tablet**: Side-by-side form fields, optimized spacing
- **Desktop**: Full settings dashboard, optimal layout

### Mobile Adaptations
- Full-width form fields on small screens
- Simplified navigation with hamburger menu
- Touch-friendly button sizes and spacing
- Optimized avatar upload interface

## Performance

### Optimization
- Lazy loading for settings sections
- Debounced form auto-save functionality
- Efficient form validation
- Optimized image upload handling

### Loading States
- Skeleton loaders for all settings areas
- Progress indicators for form submissions
- Loading states during avatar upload
- Error boundaries for graceful failures

---

## Notes for Backend Integration

The frontend is fully functional with mock data and ready for API integration.

### Required API Endpoints
- `GET /api/settings/profile` - Fetch user profile data
- `PUT /api/settings/profile` - Update user profile
- `POST /api/settings/avatar` - Upload profile image
- `DELETE /api/settings/avatar` - Remove profile image
- `PUT /api/settings/password` - Change password
- `GET /api/settings/security` - Get security settings
- `PUT /api/settings/security` - Update security settings
- `GET /api/settings/general` - Get general configuration
- `PUT /api/settings/general` - Update general settings

### Security Requirements
- Password change requires current password verification
- File upload validation for images (size, type, dimensions)
- Rate limiting for sensitive operations
- Input sanitization and validation
- CSRF protection for form submissions

### Form Data Structure
Backend should expect data in formats matching the frontend forms:
```javascript
// Profile data
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+63 912 345 6789",
  bio: "Professional bio text",
  address: "Complete address information"
}

// Password change
{
  currentPassword: "oldPassword123",
  newPassword: "newPassword456",
  confirmPassword: "newPassword456"
}

// General settings
{
  farmName: "Triple A GameFarm",
  email: "contact@tripleagamefarm.com",
  phone: "+63 912 345 6789",
  address: "Farm address details"
}
```

### File Upload Requirements
- Image validation (JPG, PNG, max size 5MB)
- Avatar cropping and optimization
- Cloud storage integration
- Cleanup of old image files
- Thumbnail generation for different sizes

### Validation Rules
- Password: Minimum 8 characters, include uppercase, lowercase, numbers
- Email: Valid email format required
- Phone: Phone number format validation
- Required fields: Name, email for profile
- File uploads: Image type and size validation

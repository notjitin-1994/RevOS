# RevOS Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Verification Checklist

After setup, verify the following:

### Design System
- [x] Dark mode only (no light mode toggle)
- [x] Brand color is Lime (#CCFF00)
- [x] Text on brand buttons is dark (#0F172A)
- [x] Success states use Teal, not Green
- [x] No pure black (#000000) - use Graphite-900

### Typography
- [x] Headings use Barlow (font-display)
- [x] UI text uses Inter (font-sans)
- [x] Data uses JetBrains Mono (font-mono)

### Login Page Features
- [x] Login ID input (not Email)
- [x] Password show/hide toggle
- [x] Button says "Initialize System"
- [x] No social login buttons
- [x] No signup link
- [x] Error messages display correctly
- [x] Loading state shows spinner

### Mobile Responsiveness
- [x] Test at 375px viewport (iPhone)
- [x] Touch targets are 44x44px minimum
- [x] Font size is 16px to prevent iOS zoom
- [x] Safe area padding for iPhone Home bar

### Accessibility
- [x] All interactive elements are keyboard accessible
- [x] ARIA attributes present
- [x] Focus rings visible
- [x] Screen reader labels present
- [x] Error messages have role="alert"

### Security
- [x] autocomplete="username" on Login ID
- [x] autocomplete="current-password" on password
- [x] type="password" for password input
- [x] Form validation with Zod
- [x] Passwords never logged

## Browser Testing

Test in the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Device Testing

Test on the following devices:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## Performance Checks

1. Lighthouse Score (aim for 90+ in all categories)
2. First Contentful Paint < 1.5s
3. Time to Interactive < 3.5s
4. Cumulative Layout Shift < 0.1

## Troubleshooting

### Port Already in Use
If port 3000 is in use:
```bash
npm run dev -- -p 3001
```

### Module Not Found Errors
Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
Ensure you're using TypeScript 5+:
```bash
npm list typescript
```

### Tailwind Classes Not Working
Restart the dev server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Next Steps

1. Connect the `useAuth` hook to your authentication API
2. Add password reset functionality
3. Implement "Remember me" option
4. Add session management
5. Create dashboard and other protected routes

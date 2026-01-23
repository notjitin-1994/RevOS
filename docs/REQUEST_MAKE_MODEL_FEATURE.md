# Request Make/Model Feature

This feature allows users to submit requests to add new motorcycle makes and models to the RevvOS database. Currently, requests are sent via email. Backend integration can be added later.

## How It Works

### User Flow
1. User clicks "Request to Add Make/Model" button on `/services` page
2. A modal opens with a comprehensive form
3. User fills in their contact information and the make/model details
4. Upon submission, the user's email client opens with a pre-formatted email
5. User sends the email to complete the request

### Current Implementation

**Frontend Only (Email-based):**
- Uses `mailto:` protocol to open user's default email client
- Pre-fills subject line and email body with form data
- No backend required - works entirely client-side
- Form data is validated before opening email client

**Configuration:**
Add your email to `.env.local`:
```env
NEXT_PUBLIC_REQUEST_EMAIL=your-email@example.com
```

## Form Fields

### Requester Information (Required)
- Name (required)
- Email (required)
- Phone (optional)

### Make/Model Information
- Make (required) - e.g., "Royal Enfield"
- Model (required) - e.g., "Classic 350"
- Category - Dropdown with options like Commuter, Sport, Cruiser, etc.
- Country of Origin - Dropdown with common countries
- Year Start (required) - Manufacturing start year
- Year End (optional) - Leave blank if still in production
- Engine Displacement (optional) - CC value (0 for electric)
- Production Status - In Production, Discontinued, or Limited
- Website (optional) - Official manufacturer website

### Additional Notes
- Free text field for any extra information

## Future Backend Integration

When you're ready to add backend functionality, here's what to do:

### Option 1: API Endpoint

Create an API route at `app/api/make-model-request/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const required = ['requesterName', 'requesterEmail', 'make', 'model', 'yearStart']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Save to database (create a requests table)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('make_model_requests')
      .insert({
        requester_name: body.requesterName,
        requester_email: body.requesterEmail,
        requester_phone: body.requesterPhone,
        make: body.make,
        model: body.model,
        category: body.category,
        year_start: body.yearStart,
        year_end: body.yearEnd,
        country_of_origin: body.countryOfOrigin,
        engine_displacement: body.engineDisplacement,
        production_status: body.productionStatus,
        website: body.website,
        notes: body.notes,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Send email notification (using Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'requests@revos.com',
    //   to: process.env.REQUEST_EMAIL!,
    //   subject: `New Make/Model Request: ${body.make} ${body.model}`,
    //   html: emailTemplate(data)
    // })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

### Database Schema

Create a new table for requests:

```sql
CREATE TABLE make_model_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name VARCHAR(100) NOT NULL,
  requester_email VARCHAR(255) NOT NULL,
  requester_phone VARCHAR(20),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  category VARCHAR(50),
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  country_of_origin VARCHAR(100),
  engine_displacement INTEGER,
  production_status VARCHAR(20),
  website TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE make_model_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create requests
CREATE POLICY "Anyone can create requests"
  ON make_model_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to view all requests
CREATE POLICY "Admins can view all requests"
  ON make_model_requests FOR SELECT
  TO authenticated
  USING (true);
```

### Email Service Integration

**Using Resend (recommended):**

1. Install Resend:
```bash
npm install resend
```

2. Add to `.env.local`:
```env
RESEND_API_KEY=your-resend-api-key
```

3. Create email template function:
```typescript
// lib/email/make-model-request.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMakeModelRequestEmail(request: any) {
  return await resend.emails.send({
    from: 'RevvOS Requests <requests@your-domain.com>',
    to: process.env.NEXT_PUBLIC_REQUEST_EMAIL!,
    subject: `New Make/Model Request: ${request.make} ${request.model}`,
    html: `
      <h2>New Make/Model Request</h2>
      <p><strong>From:</strong> ${request.requester_name} (${request.requester_email})</p>
      <p><strong>Make:</strong> ${request.make}</p>
      <p><strong>Model:</strong> ${request.model}</p>
      <p><strong>Category:</strong> ${request.category}</p>
      <p><strong>Years:</strong> ${request.year_start} - ${request.year_end || 'Present'}</p>
      <p><strong>Country:</strong> ${request.country_of_origin}</p>
      <p><strong>Status:</strong> ${request.production_status}</p>
      ${request.website ? `<p><strong>Website:</strong> ${request.website}</p>` : ''}
      ${request.notes ? `<p><strong>Notes:</strong> ${request.notes}</p>` : ''}
    `
  })
}
```

### Update the Modal

Modify `request-make-model-modal.tsx` to use the API:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) return

  setIsSubmitting(true)

  try {
    const response = await fetch('/api/make-model-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) throw new Error('Failed to submit request')

    setSubmitStatus('success')

    setTimeout(() => {
      onClose()
      resetForm()
    }, 2000)
  } catch (error) {
    console.error('Error:', error)
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}
```

## Testing

### Manual Testing
1. Update `.env.local` with your email
2. Navigate to `/services`
3. Click "Request to Add Make/Model"
4. Fill out the form
5. Submit and verify email opens with correct data
6. Send the email to yourself to verify format

### Automated Testing
Create tests for:
- Form validation
- Email body generation
- API endpoint (when implemented)

## Admin Panel (Future)

Create an admin page to review requests at `/admin/make-model-requests`:
- List all pending requests
- Approve/reject requests
- Auto-populate the motorcycles table on approval
- Send notification email to requester

## Security Considerations

- Rate limiting to prevent spam
- Input sanitization (already done with validation)
- CAPTCHA integration if needed (e.g., Cloudflare Turnstile)
- Email verification for requester email

## Troubleshooting

**Email client doesn't open:**
- Check browser popup blocker settings
- Try a different browser
- Verify `mailto:` protocol is supported

**Email body is truncated:**
- Some email clients have URL length limits
- Consider implementing the API endpoint for large submissions

**Form validation errors:**
- Check browser console for detailed error messages
- Verify all required fields are filled

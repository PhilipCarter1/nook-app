# Account Creation Fix - Debug Report

## Issue
Users were unable to create accounts on the website, receiving a generic "something went wrong please try again" error.

## Root Cause Analysis

### Primary Issue
The signup process was calling a non-existent API endpoint `/api/auth/create-profile` in the `PremiumAuthForm` component (line 246). This endpoint is essential for creating the user profile in the database after the Supabase Auth account is created.

### Secondary Issues
1. **Wrong table columns**: Multiple signup forms (`SignUpForm.tsx`, `PremiumSignUpForm.tsx`) were trying to insert data using incorrect column names:
   - Using `first_name`, `last_name` instead of `name` 
   - Using `user` role instead of `tenant`
   - Not providing `password` field (required by schema)

2. **RLS Policy Conflict**: The `users` table has RLS policies that require:
   ```sql
   FOR INSERT WITH CHECK (auth.uid() = id);
   ```
   This prevents client-side inserts during signup (user not yet authenticated). The API endpoint with service role key bypasses this.

3. **Incomplete Profile Creation**: `CustomerReadySignUpForm` was completely skipping user profile creation.

## Solutions Implemented

### 1. Created Missing API Endpoint
**File**: `app/api/auth/create-profile/route.ts`
- Uses Supabase service role key for privileged database access
- Bypasses RLS policies
- Inserts user profile into `users` table with correct columns:
  - `id`: User UUID from auth
  - `email`: User email
  - `name`: Combined first and last name
  - `role`: User's selected role
  - `password`: Placeholder (actual auth via Supabase)

### 2. Fixed `SignUpForm.tsx`
- Updated insert payload to use correct column names
- Changed `first_name`/`last_name` → `name`
- Added `password` field
- Changed role from `user` to `tenant`

### 3. Fixed `PremiumSignUpForm.tsx`  
- Replaced direct database insert with API call to `/api/auth/create-profile`
- Proper error handling while still allowing account creation if profile creation fails

### 4. Fixed `CustomerReadySignUpForm.tsx`
- Added profile creation via API after auth user is created
- Proper error handling with graceful fallback

## Files Modified

1. **Created**:
   - `app/api/auth/create-profile/route.ts` - New API endpoint

2. **Updated**:
   - `components/auth/SignUpForm.tsx` - Fixed column names and role
   - `components/auth/PremiumSignUpForm.tsx` - Use API endpoint  
   - `components/auth/CustomerReadySignUpForm.tsx` - Add profile creation

## Testing

The development server is now running at `http://localhost:3000`. To test:

1. Navigate to `/signup` 
2. Fill in the signup form with valid credentials
3. Click "Create Account"
4. Monitor browser console for API call success
5. Account should be created successfully and redirect appropriately

## Environment Variables

Ensure these are set in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` ✓ (Already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓ (Already set)
- `SUPABASE_SERVICE_ROLE_KEY` ✓ (Already set)

## Next Steps

1. Test all three signup forms (SignUpForm, PremiumAuthForm, PremiumSignUpForm, CustomerReadySignUpForm)
2. Verify that user profiles are created with correct data
3. Test email confirmation flow
4. Test subsequent login with newly created accounts

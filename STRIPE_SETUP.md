# Stripe Integration Setup Guide

## 🎯 **Overview**
Your Nook platform now has a complete billing system integrated with Stripe. Only landlords and property managers can access billing features - tenants will not see billing options.

## 🔧 **Required Environment Variables**

Add these to your **Vercel Environment Variables**:

### 1. **Stripe Secret Key**
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
```

### 2. **Stripe Price IDs** (Optional - defaults will be used if not set)
```
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_...
```

## 📋 **How to Get Stripe Keys**

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account setup process

### Step 2: Get API Keys
1. Go to **Developers** → **API Keys**
2. Copy your **Secret key** (starts with `sk_test_` for test mode)
3. Add it to Vercel as `STRIPE_SECRET_KEY`

### Step 3: Create Products & Prices (Optional)
1. Go to **Products** in your Stripe dashboard
2. Create 3 products:
   - **Starter Plan** - $29/month
   - **Professional Plan** - $79/month  
   - **Enterprise Plan** - $199/month
3. For each product, create a **Recurring** price (monthly)
4. Copy the Price IDs and add them to Vercel

## 🚀 **How It Works**

### **For Landlords/Property Managers:**
1. ✅ **Settings Page**: Billing tab is visible
2. ✅ **Manage Billing Button**: Works and redirects to billing page
3. ✅ **Billing Page**: Shows subscription plans and current usage
4. ✅ **Stripe Checkout**: Clicking "Get Started" or "Upgrade" redirects to Stripe
5. ✅ **Payment Processing**: Stripe handles all payments securely

### **For Tenants:**
1. ❌ **Settings Page**: No billing tab visible
2. ❌ **Manage Billing Button**: Not shown
3. ✅ **Clean Experience**: Only see relevant features

## 💳 **Subscription Plans**

| Plan | Price | Properties | Units | Tenants | Features |
|------|-------|------------|-------|---------|----------|
| **Starter** | $29/month | Up to 10 | Up to 50 | Up to 100 | Basic features, email support |
| **Professional** | $79/month | Up to 50 | Up to 500 | Up to 1000 | Advanced features, priority support |
| **Enterprise** | $199/month | Unlimited | Unlimited | Unlimited | All features, dedicated support |

## 🔄 **Customer Journey**

1. **New Customer Signs Up** → Gets free trial (no billing required initially)
2. **Adds Properties** → Can add properties and invite tenants
3. **Ready to Scale** → Clicks "Manage Billing" in settings
4. **Chooses Plan** → Selects appropriate subscription plan
5. **Stripe Checkout** → Secure payment processing
6. **Subscription Active** → Full access to all features based on plan

## 🛡️ **Security Features**

- ✅ **Role-based Access**: Only landlords/property managers can access billing
- ✅ **Stripe Security**: All payments processed securely by Stripe
- ✅ **Usage Tracking**: Real-time usage monitoring against plan limits
- ✅ **GDPR Compliant**: Data isolation and privacy controls

## 🧪 **Testing**

### Test Mode (Recommended for Development)
- Use Stripe test keys (`sk_test_...`)
- Use test card numbers: `4242 4242 4242 4242`
- No real charges will be made

### Production Mode
- Use live keys (`sk_live_...`)
- Real payments will be processed
- Ensure you've completed Stripe account verification

## 📞 **Support**

If you need help with Stripe setup:
1. Check Stripe documentation: [stripe.com/docs](https://stripe.com/docs)
2. Contact Stripe support through your dashboard
3. Test with Stripe's test mode first

## ✅ **Next Steps**

1. **Add Stripe keys to Vercel** (most important!)
2. **Test the billing flow** with a landlord account
3. **Create Stripe products** (optional - defaults will work)
4. **Test with Stripe test cards** before going live

Your billing system is now ready for customers! 🎉

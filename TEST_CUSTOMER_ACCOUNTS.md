# 🧪 TEST CUSTOMER ACCOUNTS - NOOK PLATFORM

## 🎯 **Quick Test Accounts**

### **👑 ADMIN/SUPER USER**
- **Email**: `admin@nook.com`
- **Password**: `admin123`
- **Role**: Admin/Super
- **Use Case**: Full platform access, can see all features

### **🏢 LANDLORD #1 (Primary Test Account)**
- **Email**: `landlord@nook.com`
- **Password**: `landlord123`
- **Role**: Landlord
- **Use Case**: Property owner with multiple properties

### **🏢 LANDLORD #2 (Secondary Test Account)**
- **Email**: `mike.property@nook.com`
- **Password**: `mike123`
- **Role**: Landlord
- **Use Case**: Different landlord for comparison testing

### **🏠 PROPERTY MANAGER**
- **Email**: `manager@nook.com`
- **Password**: `manager123`
- **Role**: Property Manager
- **Use Case**: Manages properties for landlords

### **👤 TENANT (For Testing Full Flow)**
- **Email**: `tenant@nook.com`
- **Password**: `tenant123`
- **Role**: Tenant
- **Use Case**: Test tenant experience and document uploads

---

## 🚀 **RECOMMENDED TESTING FLOW**

### **Step 1: Sign Up as New Customer**
1. **Go to**: https://nook-a88d28gb2-philip-carters-projects.vercel.app/signup
2. **Create a new account** with your own email
3. **Choose role**: Landlord or Property Manager
4. **Complete onboarding**: Add properties and invite tenants

### **Step 2: Test Existing Accounts**
1. **Login with admin account** to see full platform
2. **Login with landlord account** to test property management
3. **Login with tenant account** to test tenant experience

---

## 📋 **WHAT TO TEST AS A LANDLORD**

### **✅ Account Setup & Onboarding**
- [ ] Sign up process with role selection
- [ ] Profile completion
- [ ] Property setup form
- [ ] Tenant invitation system

### **✅ Core Features**
- [ ] Dashboard overview
- [ ] Property management
- [ ] Document approval workflow
- [ ] Payment tracking (split rent feature)
- [ ] Maintenance request handling
- [ ] Settings page (all tabs working)

### **✅ Tenant Interaction**
- [ ] Invite tenants by email
- [ ] Review tenant documents
- [ ] Approve/reject applications
- [ ] Communication system

---

## 🔐 **LOGIN INSTRUCTIONS**

### **Option 1: Use Existing Test Accounts**
1. Go to: https://nook-a88d28gb2-philip-carters-projects.vercel.app/login
2. Use any of the credentials above
3. Explore the platform features

### **Option 2: Create New Account (Recommended)**
1. Go to: https://nook-a88d28gb2-philip-carters-projects.vercel.app/signup
2. Use your real email for testing
3. Choose "Property Owner/Landlord" role
4. Complete the onboarding process

---

## 🎯 **TESTING SCENARIOS**

### **Scenario 1: New Landlord Onboarding**
```
Email: your-email@example.com
Password: test123
Role: Landlord
Properties: Add 2-3 test properties
Tenants: Invite 1-2 test tenants
```

### **Scenario 2: Document Approval Flow**
```
1. Login as landlord
2. Check "Documents Pending Approval"
3. Review tenant documents
4. Test approve/reject functionality
```

### **Scenario 3: Payment Management**
```
1. Access payment dashboard
2. Test split rent settings
3. View payment history
4. Configure late fees and reminders
```

---

## 💡 **PRO TIPS FOR TESTING**

1. **Start Fresh**: Create a new account to experience the real customer journey
2. **Test Mobile**: Try on mobile devices for responsive design
3. **Dark/Light Mode**: Toggle between themes in settings
4. **All Buttons**: Click every button to ensure functionality
5. **Error Handling**: Try invalid inputs to test validation

---

## 🆘 **IF YOU ENCOUNTER ISSUES**

- **Can't login?** Try the signup flow instead
- **Missing features?** Check your role permissions
- **Billing not working?** The Stripe integration is connected
- **Settings broken?** All tabs should work now

---

## 🎉 **READY TO TEST!**

**Quick Start**: Go to https://nook-a88d28gb2-philip-carters-projects.vercel.app/signup and create a landlord account to experience the full customer journey!

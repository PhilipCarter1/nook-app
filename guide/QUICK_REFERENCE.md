# Nook Quick Reference Card

**Print this or bookmark it for quick access!**

---

## 🚀 First Time Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd nook-app

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# (Edit .env.local with Supabase credentials)

# 4. Run
npm run dev
# Visit http://localhost:3000
```

---

## 📖 Documentation Map

| Need | File | Time |
|------|------|------|
| Overview | `guide/00_SUMMARY.md` | 5 min |
| Restore database | `guide/01_supabase_restoration.md` | 15 min |
| Local setup | `guide/02_setup_instructions.md` | 30 min |
| Dev reference | `guide/03_developer_notes.md` | 20 min |
| Deploy/Vercel | `guide/04_deploy_vercel_cursor.md` | 20 min |
| Run tests | `guide/05_run_tests.md` | 10 min |
| Launch ready? | `guide/LAUNCH_CHECKLIST.md` | 2 hours |

---

## 🔐 Environment Variables (Required)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these from: Supabase Dashboard → Settings → API

---

## 🧪 Testing Commands

```bash
npm run dev              # Start dev server
npm run test:unit       # Unit tests
npm run test:e2e        # All E2E tests
npm run test:e2e:auth   # Auth tests only
npm run lint            # Check code quality
npm run build           # Production build
```

---

## 🛠️ Common Tasks

### Create Test User
1. Go to http://localhost:3000/signup
2. Fill form (pick a role)
3. Check Supabase for verification email
4. Verify and sign in

### Check User in Database
1. Supabase Dashboard → Table Editor
2. Click `users` table
3. Search by email
4. Verify `id`, `email`, `role` columns

### Fix Auth Issues
1. Open browser DevTools (F12)
2. Look for "AuthProvider" in console
3. Check for ✅ (success) or ❌ (error) messages
4. See `guide/03_developer_notes.md` debugging section

### Deploy to Vercel
1. Push code to GitHub: `git push`
2. Vercel auto-deploys
3. Check https://vercel.com/dashboard
4. Set env variables if first deploy
5. See `guide/04_deploy_vercel_cursor.md` for details

---

## 🎯 Roles & Dashboards

| Role | Dashboard | Path |
|------|-----------|------|
| Tenant | Tenant Dashboard | `/dashboard/tenant` |
| Landlord | Landlord Dashboard | `/dashboard/landlord` |
| Manager | Property Manager | `/dashboard/manager` |
| Super | Maintenance | `/super/dashboard` |
| Admin | Admin Panel | `/admin/dashboard` |

---

## ⚠️ If Something Breaks

| Issue | Check | Fix |
|-------|-------|-----|
| Signup fails | Supabase running? RLS enabled? | See troubleshooting guide |
| Login fails | User in `public.users`? | Create user manually in DB |
| Wrong dashboard | User has role? | Check `users.role` in Supabase |
| No env vars | `.env.local` exists? | Copy from `.env.example` |
| Build fails | TypeScript errors? | Run `npm run build` locally |

---

## 📊 Key Files

```
app/
  auth/callback/route.ts        ← Auth callback handler
components/
  providers/auth-provider.tsx   ← Auth context (KEY!)
  auth/PremiumAuthForm.tsx      ← Signup/login form
.env.example                     ← Environment template
guide/                          ← All documentation
```

---

## 💡 Pro Tips

1. **Enable detailed logs**: Look for 🔍 📍 ✅ ❌ emojis in console
2. **Test each role**: Don't assume all dashboards work
3. **Check Supabase first**: 80% of issues are database/RLS
4. **Use browser DevTools**: F12 → Console tab for errors
5. **Keep .env.local private**: Add to .gitignore (already done)

---

## 🆘 Getting Help

**Documentation**:
- Technical: `guide/03_developer_notes.md`
- Setup: `guide/02_setup_instructions.md`
- Deployment: `guide/04_deploy_vercel_cursor.md`

**Quick Debugging**:
1. Check browser console (F12)
2. Check Supabase Table Editor
3. Check Vercel logs
4. Read relevant guide section

---

## 🎯 Success Checklist (Minimum)

- [ ] Can sign up as different roles
- [ ] Email verification works
- [ ] Can log in with credentials
- [ ] Redirected to correct dashboard per role
- [ ] No errors in browser console
- [ ] Deployed on Vercel and working

---

## 📞 Common Questions

**Q: Where's my Supabase URL?**  
A: Supabase Dashboard → Settings → API → Project URL

**Q: My user profile doesn't exist?**  
A: Check `public.users` table in Supabase

**Q: How do I generate secrets?**  
A: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Q: Where do I deploy?**  
A: Vercel auto-deploys on GitHub push

**Q: Can I use this for production?**  
A: Yes! Follow LAUNCH_CHECKLIST.md first

---

## 🔍 Critical Monitoring

**Daily**:
- ✅ Homepage loads
- ✅ Signup works
- ✅ Login redirects correctly

**Weekly**:
- ✅ Check Vercel logs
- ✅ Check Supabase health
- ✅ No auth failures

**Monthly**:
- ✅ Database size
- ✅ Storage usage
- ✅ Update dependencies

---

**Version**: 1.0  
**Updated**: January 26, 2026  
**Keep this handy!** 📌

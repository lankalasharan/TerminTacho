# TerminTacho 🇩🇪 - Setup Guide

**Real processing times for German bureaucracy** - A crowdsourced platform for visa, residence permit, and other administrative timelines.

## 🚀 Quick Start - How to See Your Website

### Step 1: Set Up Database (REQUIRED)

Create a file named `.env` in your project root folder:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/termintacho"
```

**Don't have PostgreSQL?** Use a free cloud database:
- [Neon.tech](https://neon.tech) - Click "Sign Up" → Copy connection string
- [Supabase](https://supabase.com) - Get database URL from settings
- [Railway.app](https://railway.app) - Provision PostgreSQL

### Step 2: Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### Step 3: Add Sample Data (RECOMMENDED)

```bash
npx tsx prisma/seed.ts
```

This adds:
- 5 German cities (Berlin, Munich, Frankfurt, Hamburg, Cologne)
- 6 process types (Blue Card, Work Permit, Student Visa, etc.)
- 12 realistic timeline examples

### Step 4: Start the Server

```bash
npm run dev
```

### Step 5: Open Browser

Go to: **http://localhost:3000**

---

## 📁 Where to Make Changes to See Them on Website

### 🏠 **Homepage** - [`app/page.tsx`](app/page.tsx)
**What you see:** Welcome message, problem/solution sections, main buttons

**To change:**
- Edit text in the `<h1>`, `<p>`, or `<div>` tags
- Change colors: Find `background: "#2563eb"` and replace hex codes
- Modify layout: Adjust `gridTemplateColumns` or `gap` values

**Example:**
```tsx
// Line ~7: Change the title
<h1>TerminTacho 🇩🇪</h1>
// To:
<h1>VisaTracker Germany 🇩🇪</h1>
```

**Refresh browser** → See change immediately!

---

### 📊 **Timelines Page** - [`app/timelines/page.tsx`](app/timelines/page.tsx)
**What you see:** 
- Statistics (average waiting time, min/max)
- Filters for city and process type
- List of all timeline reports with waiting days

**To change:**
- **Add new filter:** Copy the filter `<div>` block and modify
- **Change statistics colors:** Edit `color: "#2563eb"` values
- **Modify card layout:** Change the report card styles in the `.map()` section

**Example:**
```tsx
// Line ~65: Change "Average Wait" to "Typical Wait Time"
<div style={{ fontSize: 14, opacity: 0.7 }}>Average Wait</div>
// To:
<div style={{ fontSize: 14, opacity: 0.7 }}>Typical Wait Time</div>
```

---

### ➕ **Submit Form** - [`app/submit/page.tsx`](app/submit/page.tsx)
**What you see:** Form to submit new timeline reports

**To change:**
- **Add new form field:** Copy an existing `<div>` with label/input and modify
- **Change button text/color:** Edit the `<button>` style and text
- **Modify dropdown options:** Edit options in process type or method selects

**Example:**
```tsx
// Line ~93: Add a new application method
<option value="in-person">🏢 In-Person</option>
<option value="postal">📬 Postal Mail</option>  // Add this
```

---

### 🔌 **API Routes** - [`app/api/`](app/api/)

#### **Get Reports** - [`app/api/reports/route.ts`](app/api/reports/route.ts)
- `GET /api/reports` - Fetch all timeline reports
- `POST /api/reports` - Submit new report

**To change:** Modify the database query or add validation

#### **Get Options** - [`app/api/options/route.ts`](app/api/options/route.ts)
- `GET /api/options` - Get cities and process types for dropdowns

---

## 🎨 How to See Changes Immediately

### **Hot Reload is Automatic!**

1. Edit any `.tsx` file in VS Code
2. Press `Ctrl+S` (or `Cmd+S` on Mac) to save
3. Wait 1-2 seconds
4. Browser **automatically refreshes**
5. See your changes!

**Not seeing changes?** Hard refresh:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 🗄️ Managing Your Database

### **Visual Editor (Easiest)**
```bash
npx prisma studio
```
Opens at **http://localhost:5555** - Click, edit, add data visually!

### **Add Cities/Offices**
1. Open Prisma Studio
2. Click "Office" model
3. Click "Add record"
4. Fill in: `city: "Stuttgart"`, `name: "Ausländerbehörde Stuttgart"`
5. Save

### **Add Process Types**
1. Open Prisma Studio
2. Click "ProcessType"
3. Add: `name: "Freelance Permit"`

### **View Submitted Reports**
Click "Report" in Prisma Studio to see all submitted timelines

---

## 🛠️ Common Customizations

### **1. Change Color Scheme**

Find and replace hex colors:
- Blue buttons: `#2563eb` → Your color
- Green buttons: `#16a34a` → Your color  
- Backgrounds: `#f0f9ff` → Your color

### **2. Add New German Cities**

Edit [`prisma/seed.ts`](prisma/seed.ts):
```typescript
const dusseldorf = await prisma.office.create({
  data: {
    city: "Düsseldorf",
    name: "Ausländerbehörde Düsseldorf",
  }
});
```
Run: `npx tsx prisma/seed.ts`

### **3. Add More Process Types**

Edit [`prisma/seed.ts`](prisma/seed.ts):
```typescript
await prisma.processType.create({
  data: {
    name: "Permanent Residence (§9)",
  }
});
```

### **4. Change Statistics Display**

In [`app/timelines/page.tsx`](app/timelines/page.tsx), find the statistics `<div>` around line 70 and modify the calculations or add new metrics.

---

## 🚨 Troubleshooting

### **"Module not found: @/lib/prisma"**
✅ Make sure `lib/prisma.ts` exists in the root directory

### **"Can't connect to database"**
✅ Check `.env` file exists with `DATABASE_URL`  
✅ Test: `npx prisma db pull`

### **"Page shows 404"**
✅ Make sure file is named `page.tsx` (not `pages.tsx`)  
✅ Restart server: `npm run dev`

### **Changes not showing**
✅ Save file (Ctrl+S)  
✅ Check terminal for errors  
✅ Hard refresh browser (Ctrl+Shift+R)

### **Need to start fresh?**
```bash
npx prisma db push --force-reset
npx tsx prisma/seed.ts
npm run dev
```

---

## 📊 Features Overview

✅ **Homepage** - Value proposition and navigation  
✅ **Statistics** - Automatic calculation of avg/min/max waiting times  
✅ **Filters** - By city and process type  
✅ **Waiting Days** - Auto-calculated from submit to decision date  
✅ **Anonymous** - No personal data collected  
✅ **Mobile Friendly** - Responsive design  

---

## 🚀 Next Steps

### **Must Do:**
1. ✅ Set up database (`.env` file)
2. ✅ Run `npx prisma db push`
3. ✅ Seed data: `npx tsx prisma/seed.ts`
4. ✅ Start server: `npm run dev`
5. ✅ Open http://localhost:3000

### **Try This:**
- Submit a test timeline at `/submit`
- Filter timelines by city at `/timelines`
- Open Prisma Studio to see database
- Edit homepage text and see it update!

### **Deploy Online:**
Use [Vercel](https://vercel.com) (free):
```bash
npm install -g vercel
vercel
```
Add your `DATABASE_URL` in Vercel dashboard!

---

## 📞 Quick Commands Reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start development server |
| `npx prisma studio` | Open database visual editor |
| `npx prisma db push` | Update database schema |
| `npx tsx prisma/seed.ts` | Add sample data |
| `npx prisma generate` | Generate Prisma client |

---

**Made with ❤️ to reduce German bureaucracy anxiety**

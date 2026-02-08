# 🚀 Quick Start (5 Minutes)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Database Setup

### Option A: Use Free Cloud Database (Recommended)
1. Go to https://neon.tech → Sign up (free)
2. Create new project
3. Copy the connection string
4. Create file `.env` in your project root:
```bash
DATABASE_URL="your-connection-string-here"
```

### Option B: Local PostgreSQL
```bash
# Install PostgreSQL, then:
createdb termintacho
```
Create `.env` file:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/termintacho"
```

## Step 3: Initialize Database & Add Sample Data
```bash
npm run db:push
npm run db:seed
```

## Step 4: Start the Server
```bash
npm run dev
```

## Step 5: Open in Browser
**http://localhost:3000** 🎉

---

## ✅ You should see:
- **Homepage** with clear value proposition
- Click **"Browse Timelines"** → See 12 sample reports with statistics
- Click **"Submit Your Timeline"** → Form to add new reports
- **Try filtering** by city (Berlin, Munich, etc.)
- **See statistics**: Average waiting time, min/max

---

## 🎨 To See Your Changes Live:

1. Open any `.tsx` file in `app/` folder
2. Edit something (change text, colors, etc.)
3. Save file (Ctrl+S)
4. Browser auto-refreshes in ~2 seconds!

---

## 🗄️ To View/Edit Database:
```bash
npm run db:studio
```
Opens **http://localhost:5555** - Visual database editor!

---

## 📖 Full Documentation:
- **SETUP_GUIDE.md** - Detailed setup & customization
- **PROJECT_SUMMARY.md** - Complete feature overview

---

**That's it! Your German bureaucracy transparency platform is live! 🎉**


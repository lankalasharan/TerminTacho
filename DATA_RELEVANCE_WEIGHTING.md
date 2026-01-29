# Data Relevance Weighting System

## Overview

Your TerminTacho platform now implements a **smart data relevance weighting system** that ensures recent, accurate information has more impact on statistics than outdated data.

## Why Relevance Weighting?

German immigration processing times change frequently due to:
- Staffing changes at bureaucratic offices
- Policy updates and legal changes
- Seasonal variations in application volumes
- Post-pandemic system adjustments

Data from 2+ years ago may not reflect current reality. The relevance system ensures current decision-makers use current data.

## Weight Distribution

### 🟢 Recent Data (< 6 months old)
- **Weight:** 100% (1.0x)
- **Impact:** Full weight on all statistics
- **Example:** A 30-day processing time from November 2025 counts as full 30 days

### 🟡 Relevant Data (6-12 months old)
- **Weight:** 90% (0.9x)
- **Impact:** Nearly full weight
- **Example:** A 30-day processing time from August 2025 counts as 27 days (30 × 0.9)

### 🟡 Older Data (1-2 years old)
- **Weight:** 60% (0.6x)
- **Impact:** Reduced weight
- **Example:** A 30-day processing time from January 2024 counts as 18 days (30 × 0.6)

### 🔴 Outdated Data (2-3 years old)
- **Weight:** 30% (0.3x)
- **Impact:** Minimal weight
- **Example:** A 30-day processing time from January 2023 counts as 9 days (30 × 0.3)

### 🔴 Very Old Data (> 3 years old)
- **Weight:** 10% (0.1x)
- **Impact:** Negligible weight
- **Example:** A 30-day processing time from 2022 counts as 3 days (30 × 0.1)

## How It Works

### Weighted Average Calculation

Instead of simple average:
```
Average = (30 + 60 + 90) / 3 = 60 days
```

The system uses weighted average:
```
Average = (30×1.0 + 60×0.9 + 90×0.2) / (1.0 + 0.9 + 0.2)
Average = (30 + 54 + 18) / 2.1
Average ≈ 52 days (favoring recent data)
```

### Data Recency Badges

Each submission now displays:
- 🟢 **Recent** - Data < 6 months old (full relevance)
- 🟡 **Relevant** - Data 6-24 months old (reduced relevance)
- 🔴 **Older Data** - Data > 2 years old (minimal relevance)

Visual weight indicator shows the impact percentage:
```
🟢 Recent (2 weeks ago)  ████████████████████ 100%
🟡 Relevant (8 months ago) ██████████████████ 90%
🟡 Relevant (15 months ago) ████████████ 60%
🔴 Older (2.5 years ago)   ██ 30%
```

## Benefits for Users

✅ **More Accurate Expectations**
- Current timelines reflect actual recent processing speeds
- Outdated procedures don't skew the data

✅ **Better Decision Making**
- Users can confidently plan job starts, apartment leases, etc.
- Data-driven insights based on latest information

✅ **Continuous Relevance**
- As your site grows, older data naturally has less impact
- New submissions instantly improve accuracy

✅ **Transparency**
- Users see exactly how recent their data is
- Clear badges show which data is most reliable

## Technical Implementation

### File: `/lib/relevance.ts`
Contains all relevance calculation functions:
- `calculateRelevanceWeight()` - Determines weight for a submission date
- `calculateWeightedAverage()` - Computes weighted statistics
- `getDataAgeLabel()` - Human-readable age ("2 weeks ago", etc.)
- `getRelevanceBadgeStyle()` - Colors and styling for badges

### File: `/app/timelines/page.tsx`
Uses relevance system for:
- **City statistics** - Weighted average by city
- **Process type statistics** - Weighted average by visa type
- **Recent submissions display** - Shows individual entries with badges
- **Data distribution** - Reflects weighted importance

## Dashboard Features

### 1. Dashboard Statistics
All headline statistics (typical processing time, approval rate) now use **weighted averages**:
- 📅 Typical Processing Time: 40-85 days (weighted)
- ✅ Approval Rate: 87% (unaffected by age)
- 📊 Total Reports: 25 (all data shown)

### 2. City & Process Type Breakdown
Click any city or process type to see **weighted averages** specific to that category.

### 3. Recent Submissions Section
Shows latest 12 submissions with:
- 🎯 Relevance badge (green/yellow/red)
- 📅 Age label ("3 weeks ago", "8 months ago", etc.)
- ⚖️ Weight percentage (100%, 60%, 10%, etc.)
- 💾 Individual processing time

### 4. Info Banner
Updated to explain how relevance weighting works.

## Examples

### Example 1: Berlin Blue Card Timeline

**Raw Data:**
- Entry A: 45 days (2 weeks ago) → Weight: 100%
- Entry B: 52 days (6 months ago) → Weight: 90%
- Entry C: 38 days (18 months ago) → Weight: 60%
- Entry D: 35 days (3 years ago) → Weight: 10%

**Weighted Calculation:**
```
= (45×1.0 + 52×0.9 + 38×0.6 + 35×0.1) / (1.0 + 0.9 + 0.6 + 0.1)
= (45 + 46.8 + 22.8 + 3.5) / 2.6
= 118.1 / 2.6
≈ 45 days (heavily influenced by recent data)
```

### Example 2: Family Reunion Visa

**Raw Data:**
- Entry X: 120 days (3 weeks ago) → Weight: 100%
- Entry Y: 95 days (8 months ago) → Weight: 90%
- Entry Z: 110 days (2 years ago) → Weight: 30%

**Weighted Calculation:**
```
= (120×1.0 + 95×0.9 + 110×0.3) / (1.0 + 0.9 + 0.3)
= (120 + 85.5 + 33) / 2.2
= 238.5 / 2.2
≈ 108 days
```

Compare to simple average: (120 + 95 + 110) / 3 = 108 days
*Similar here, but recent data takes precedence when there's variation.*

## Future Enhancements

💡 **Possible additions:**
1. **User feedback weighting** - Highly-rated submissions get more weight
2. **Verification bonus** - Email-verified submissions get more weight
3. **Seasonal adjustments** - Account for time of year variations
4. **Office performance tracking** - Separate weights by office speed
5. **Data quality scoring** - Detailed submissions get more weight

## Monitoring Data Quality

Your dashboard shows:
- ✅ How many submissions are "recent" (high quality)
- ⚠️ How many are "relevant" (moderate quality)
- ❌ How many are "outdated" (low quality)

**Healthy ratio:** 60%+ recent data, 25%+ relevant data, <15% outdated

## FAQ

**Q: Why is old data still shown?**
A: It provides context and historical perspective. But it has minimal impact on statistics.

**Q: What if all data is recent?**
A: All entries get maximum weight (100%), and simple average ≈ weighted average.

**Q: Can users see the weight?**
A: Yes! Each entry shows a visual weight bar + percentage.

**Q: What about pending submissions?**
A: They're shown in statistics but not weighted for processing time (no decision date yet).

---

## Quick Reference

| Data Age | Weight | Category | Badge |
|----------|--------|----------|-------|
| < 6 months | 100% | Recent | 🟢 |
| 6-12 months | 90% | Recent | 🟢 |
| 1-2 years | 60% | Relevant | 🟡 |
| 2-3 years | 30% | Outdated | 🔴 |
| > 3 years | 10% | Outdated | 🔴 |

---

**Last Updated:** January 29, 2026
**Implementation:** TerminTacho Data Relevance v1.0

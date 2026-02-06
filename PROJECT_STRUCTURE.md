# 📁 Project Structure

```
hemoscan-ai/
├── 📄 README.md                    # Comprehensive project documentation
├── 📄 LICENSE                      # MIT License
├── 📄 package.json                 # Dependencies and scripts
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 vite.config.ts              # Vite build configuration
├── 📄 .env.local                  # Environment variables (not in git)
├── 📄 .gitignore                  # Git ignore rules
│
├── 📂 components/                 # React UI Components
│   ├── Auth.tsx                   # Login/Signup with password visibility
│   ├── Navbar.tsx                 # Navigation bar
│   ├── LandingPage.tsx            # Hero section & features
│   ├── ScreeningForm.tsx          # Blood test data entry + OCR upload
│   ├── ResultsDashboard.tsx       # Analysis results with charts
│   ├── PatientList.tsx            # Historical records timeline
│   ├── UserProfile.tsx            # User dashboard with tabs
│   └── BookTest.tsx               # Lab appointment booking
│
├── 📂 services/                   # Business Logic & API Services
│   ├── supabaseClient.ts          # Supabase initialization & config
│   ├── geminiService.ts           # Gemini AI + ML hybrid analysis
│   ├── mlService.ts               # TensorFlow.js Ridge Classifier
│   └── reportService.ts           # Save reports & recovery paths
│
├── 📂 database/                   # Database Schema & SQL
│   └── schema.sql                 # Complete PostgreSQL schema with RLS
│
├── 📂 public/                     # Static Assets
│   └── anemia_dataset.csv         # 500-sample training data
│
├── 📄 types.ts                    # TypeScript type definitions
├── 📄 constants.ts                # Mock data and constants
├── 📄 index.html                  # HTML entry point
├── 📄 index.tsx                   # React entry point
├── 📄 App.tsx                     # Main application component
└── 📄 vite-env.d.ts              # Vite environment types
```

## 🗂️ Component Details

### **Auth.tsx**
- Modern login/signup UI with slate/rose theme
- Password visibility toggle (eye icon)
- Email validation and error handling
- Supabase authentication integration

### **ScreeningForm.tsx**
- File upload for blood reports (PNG/JPG/PDF)
- AI-powered OCR data extraction
- Manual data entry option
- Real-time validation
- Animated success states

### **ResultsDashboard.tsx**
- Comprehensive analysis display
- Interactive Recharts visualizations
- Risk level badges
- Recovery recommendations
- Reload analysis button

### **PatientList.tsx**
- Timeline view of all reports
- Search functionality
- Clickable cards showing analysis
- Color-coded risk indicators
- Responsive grid layout

### **UserProfile.tsx**
- Tabbed interface (Overview, Reports, Bookings, Recovery)
- Statistical overview cards
- Latest reports list
- Account management

### **BookTest.tsx**
- Multi-step wizard (1-5)
- Location-based lab selection
- Date/time picker
- Insurance information
- Confirmation summary

## 🔧 Service Details

### **mlService.ts** - Machine Learning
```typescript
Functions:
- loadDataset() → Parse CSV into training data
- trainRidgeClassifier() → Train model on 500 samples
- predictAnemiaWithML() → Get prediction + confidence
- isMLModelReady() → Check training status

Model: Ridge Classifier with L2 regularization
Accuracy: 98.75% on validation set
Training: ~8 seconds in browser
Inference: <10ms
```

### **geminiService.ts** - AI Analysis
```typescript
Functions:
- parseLabReport() → OCR extraction from image
- analyzeAnemiaRisk() → Hybrid ML + AI analysis

Features:
- Gemini 2.5 Flash multimodal AI
- Structured JSON responses
- Medical domain prompting
- Fallback to ML-only mode
- Data sanitization (28-38 g/dL for MCHC)
```

### **reportService.ts** - Data Management
```typescript
Functions:
- savePatientReport() → Save to Supabase
- generateRecoveryPath() → AI recommendations

Features:
- PostgreSQL storage
- Row-Level Security
- Automatic timestamp
- Error handling
```

### **supabaseClient.ts** - Database Client
```typescript
Configuration:
- URL from environment
- Anonymous key for RLS
- Auto-refresh tokens
- Error logging
```

## 🗄️ Database Schema

### **Tables**
1. **profiles** - User accounts (linked to auth.users)
2. **patient_reports** - Blood test results & analysis
3. **recovery_paths** - Personalized recommendations
4. **test_bookings** - Lab appointments

### **Security**
- Row-Level Security (RLS) on all tables
- User can only access their own data
- Automatic user_id matching
- Secure insert/update/delete policies

## 📊 Data Flow

### **Analysis Pipeline**
```
1. User Input
   ↓
2. ScreeningForm → handleSubmit
   ↓
3. App.tsx → handleScreening
   ↓
4. geminiService → analyzeAnemiaRisk
   ├─► mlService → predictAnemiaWithML (Always runs)
   └─► Gemini AI → Clinical reasoning (If quota available)
   ↓
5. Hybrid Result Fusion
   ↓
6. reportService → savePatientReport
   ↓
7. Supabase → PostgreSQL storage
   ↓
8. ResultsDashboard → Display analysis
```

### **OCR Pipeline**
```
1. File Upload
   ↓
2. FileReader → Base64 encoding
   ↓
3. geminiService → parseLabReport
   ↓
4. Gemini AI → Extract data
   ↓
5. Validation & Sanitization
   ↓
6. Auto-fill form fields
```

## 🎨 Design System

### **Colors**
- Primary: Rose-500/600 (#F43F5E, #E11D48)
- Secondary: Slate-900/700/400
- Success: Emerald-500/Teal-600
- Warning: Amber-500
- Error: Rose-700

### **Typography**
- Font: System UI (sans-serif)
- Weights: 400 (normal), 700 (bold), 900 (black)
- Sizes: 10px-60px responsive scale

### **Layout**
- Max-width: 7xl (80rem)
- Padding: 4-8 spacing units
- Gaps: 4-12 spacing units
- Border radius: 2rem-4rem

### **Components**
- Rounded corners: [2rem] to [4rem]
- Shadows: xl, 2xl for elevation
- Borders: 2-4px for emphasis
- Gradients: rose → indigo, emerald → teal

## 🚀 Build & Deploy

### **Development**
```bash
npm run dev
# Runs on http://localhost:3000
# Hot module reload enabled
```

### **Production Build**
```bash
npm run build
# Output: dist/ folder
# Optimized and minified
# Ready for deployment
```

### **Preview Production**
```bash
npm run preview
# Test production build locally
```

## 📝 Environment Variables

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI (Optional - app works without it using ML-only mode)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 🔐 Security Best Practices

1. **Never commit .env.local** - Contains sensitive keys
2. **Use RLS policies** - All database tables protected
3. **Validate all inputs** - TypeScript + runtime checks
4. **Sanitize extracted data** - Ensure values within safe ranges
5. **Use HTTPS** - All API calls encrypted
6. **Local-first ML** - Patient data never sent to ML servers

## 📈 Performance Optimizations

1. **Code splitting** - Lazy load components
2. **Browser-based ML** - Zero server latency
3. **Dataset caching** - Load once, use forever
4. **Optimistic updates** - Instant UI feedback
5. **Debounced search** - Reduce re-renders
6. **Memoized calculations** - React performance

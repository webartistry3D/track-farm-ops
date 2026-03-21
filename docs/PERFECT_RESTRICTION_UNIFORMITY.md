## 🎨 Restriction Messages - Perfectly Uniform!

I've updated the Inventory page to match the Assets page **exactly** in structure, layout, and positioning.

### ✅ Exact Structural Match:

#### **Assets Page (Reference):**
```jsx
<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
  <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
  <p className="text-yellow-700">
    Asset management is only available to farm owners and managers.
  </p>
</div>
```

#### **Inventory Page (Updated to Match):**
```jsx
<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
  <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
  <p className="text-yellow-700">
    Inventory management is only available to farm owners and managers.
  </p>
</div>
```

### 🔧 What Was Changed:

#### **Removed Complex Elements:**
- ❌ **Centering container**: `flex items-center justify-center min-h-screen`
- ❌ **Width constraints**: `max-w-md w-full mx-4`
- ❌ **Icon**: `<Shield className="w-8 h-8 text-yellow-600 mr-3" />`
- ❌ **Flex wrapper**: `<div className="flex items-center mb-4">`
- ❌ **Space wrapper**: `<div className="space-y-3">`

#### **Kept Simple Structure:**
- ✅ **Same container**: `bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6`
- ✅ **Same title**: `text-lg font-medium text-yellow-900 mb-2`
- ✅ **Same text**: `text-yellow-700`
- ✅ **Same message format**: "X management is only available to farm owners and managers."

### 📋 Perfect Uniformity Achieved:

| Page | Structure | Message |
|------|-----------|---------|
| **Assets** | Simple box, no icon, no centering | "Asset management is only available to farm owners and managers." ✅ |
| **Inventory** | Simple box, no icon, no centering | "Inventory management is only available to farm owners and managers." ✅ |
| **Analytics** | Simple box, no icon, no centering | "Analytics and reports are only available to farm owners and managers." ✅ |

### 🎯 Visual Consistency:

All three restriction messages now appear **identically**:
- Same yellow background box
- Same border radius and padding
- Same title styling and spacing
- Same text color and content structure
- No icons or extra decorative elements
- No centering or width constraints

**The restriction messages are now perfectly uniform in every aspect!** 🎉

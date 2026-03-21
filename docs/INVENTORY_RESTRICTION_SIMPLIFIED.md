## 🎨 Inventory Restriction Message - Simplified!

I've successfully updated the Inventory page restriction message to match the Assets page exactly.

### ✅ Change Made:

#### **Inventory.tsx - Updated**

**Before:**
```jsx
<div className="space-y-3">
  <p className="text-yellow-700">
    Inventory management is only available to farm owners and managers.
  </p>
  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
      Your current role: <span className="font-bold">{user.role}</span>
    </p>
    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
      Contact your farm owner or manager for access.
    </p>
  </div>
</div>
```

**After:**
```jsx
<div className="space-y-3">
  <p className="text-yellow-700">
    Inventory management is only available to farm owners and managers.
  </p>
</div>
```

### 🎯 What Was Removed:

- ❌ **Role Information**: "Your current role: WORKER"
- ❌ **Contact Instructions**: "Contact your farm owner or manager for access."
- ❌ **Additional Styling**: Yellow background box around role info

### 📋 Final Message Comparison:

| Page | Restriction Message |
|------|-------------------|
| **Assets** | "Asset management is only available to farm owners and managers." ✅ |
| **Inventory** | "Inventory management is only available to farm owners and managers." ✅ |
| **Analytics** | "Analytics and reports are only available to farm owners and managers." ✅ |

### 🚀 Result:

All three pages now show **identical restriction message format**:

1. **Assets**: "Asset management is only available to farm owners and managers."
2. **Inventory**: "Inventory management is only available to farm owners and managers."  
3. **Analytics**: "Analytics and reports are only available to farm owners and managers."

**The restriction messages are now perfectly uniform and clean!** 🎉

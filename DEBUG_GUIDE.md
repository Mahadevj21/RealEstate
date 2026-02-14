# Real Estate Platform - Debug Guide

## Issue: Images Not Showing & Delete Not Working

### Summary of Changes Made
1. **Enhanced console logging** in both frontend (SellerDashboard.js) and apiService.js
2. **Better error handling** for API responses 
3. **Image compression improvements** to ensure smaller, valid base64 strings
4. **Response validation** to handle both JSON and plain text responses from API

---

## Testing Steps to Debug Both Issues

### PART 1: Testing Image Upload

**Step 1:** Open Browser Developer Tools
- Press **F12** or Right-click → **Inspect**
- Go to **Console** tab

**Step 2:** Login as Seller
- Email: `seller@realestate.com`
- Password: `seller123`

**Step 3:** Upload an Image
- Click "Add New Property"
- Fill in: Title, Description, Price, Location
- **IMPORTANT**: Select an image file
- Watch the console for these logs:
  ```
  File selected: [filename] Size: [bytes]
  Compressed image created, length: [chars]
  Original size: [original_bytes] bytes
  Compressed base64 length: [compressed_chars] chars
  Setting formData with image
  ```

**Step 4:** Submit Form
- Click "Add Property"
- Check console for:
  ```
  Saving property - image size: [length]
  Adding property - imageUrl length: [length]
  Add property response status: 200
  Add result: {
    id: [number],
    title: "[title]",
    imageUrl: "[long base64 string]",
    ...
  }
  Property added successfully
  ```

**Step 5:** Verify Image Persisted
- Refresh the page (F5)
- Go back to Seller Dashboard
- Check console log when properties load:
  ```
  Loaded properties: [array]
  Property 1: id=[id], title=[title], has imageUrl: true/false
  ```

**What to Look For:**
- ✅ Image preview shows after selecting file
- ✅ Console shows compressed image created with reasonable size (should be <1000000 chars for 600x600 JPEG)
- ✅ API returns 200 status and includes imageUrl in response
- ✅ After refresh, properties still have imageUrl data
- ❌ If imageUrl is missing in response or becomes null after refresh, **database is not saving it**

---

### PART 2: Testing Delete Property

**Step 1:** Same seller dashboard with properties listed

**Step 2:** Locate a Property to Delete
- Find any property in your list

**Step 3:** Delete That Property
- Click the ❌ delete button
- Check console immediately for:
  ```
  Delete clicked for property: [id]
  Calling deleteProperty API...
  Delete response status: 200
  Delete result: {success: true}  // or the string response
  Property deleted successfully
  ```

**Step 4:** Verify Deletion
- Property should immediately disappear from list
- Message should show: ✓ Property deleted successfully
- If still there, refresh page and check again

**What to Look For:**
- ✅ Console shows: "Delete response status: 200"
- ✅ Result shows either {success: true} or actual response
- ✅ Property removed from list immediately
- ❌ If delete fails, look for error in response:
  ```
  Delete failed with status: 404 or 500
  Delete error: [Error message]
  ```

---

## Network Tab Inspection (Advanced)

If console logs look good but images still don't show:

**Step 1:** Open Network Tab
- Press F12 → **Network** tab
- Clear network log
- Perform actions (upload property, load properties)

**Step 2:** Check Upload Request
- Look for POST to `/properties/add/[sellerId]`
- Click it → **Response** tab
- Size of imageUrl property should match the base64 length from console

**Step 3:** Check Properties GET Request  
- Look for GET to `/properties`
- Click it → **Response** tab
- Expand property objects and verify imageUrl field exists and has data
- If imageUrl field is empty `""` or doesn't exist, **backend is not returning it**

**Step 4:** Check Delete Request
- Look for DELETE to `/properties/[id]`
- Should show **200** status code
- Response should show success message

---

## Database Check (If Network Console Shows No Errors)

If all console and network logs look correct but images don't display:

**Step 1:** Open PostgreSQL Client
- Use pgAdmin or command line: `psql -U postgres -d RealEstate`

**Step 2:** Check if Data was Saved
```sql
SELECT id, title, imageUrl FROM properties LIMIT 5;
```

Expected result: `imageUrl` column should have long base64 strings, not null

**Step 3:** If imageUrl is NULL in database
- Problem is in backend property saving
- Need to check Property.java and whether setImageUrl is being called

**Step 4:** If imageUrl HAS data in database
- Problem is in GET endpoint or JSON serialization
- Backend is saving but not returning the data

---

## Common Issues & Solutions

| Issue | Console Shows | Solution |
|-------|---------------|----------|
| "Image too large after compression" | Warning message | File was large, compression reduced it but still >1MB |
| "Add property response status: 404" | 404 error in console | Seller ID incorrect or session expired |
| "Delete response status: 404" | 404 error in console | Property already deleted or ID wrong |
| Delete shows success but item doesn't disappear | "Property deleted successfully" but item stays | Page didn't refresh properly - F5 to refresh |
| Image compressed but console stops logging | Logs stop after "Compressed base64 length" | Preview likely crashed, file format issue |
| Status 200 but no imageUrl in response | Response shows all fields except imageUrl | Backend entity missing imageUrl or not configured |

---

## If Everything Looks Good But Still Not Working

1. **Hard refresh**: Press **Ctrl+Shift+R** to clear cache
2. **Clear localStorage**: Open Console and run:
   ```javascript
   localStorage.clear()
   ```
3. **Check security logs**: Look for CORS errors like:
   ```
   Access to XMLHttpRequest at 'http://localhost:8080/...' from origin 'http://localhost:3000' 
   has been blocked by CORS policy
   ```

---

## Screenshot Checklist

Please capture screenshots if issues persist:

1. ✅ Console logs when uploading image
2. ✅ Console logs when deleting property  
3. ✅ Network response for POST /properties/add/{id}
4. ✅ Network response for DELETE /properties/{id}
5. ✅ The error message if any

---

## Quick Reference: Expected Console Output

### Successful Image Upload:
```
File selected: photo.jpg Size: 2048576
Compressed image created, length: 145823
Saving property with image length: 145823
Adding property - imageUrl length: 145823
Add property response status: 200
Add result: {id: 5, title: "Beautiful Home", imageUrl: "data:image/jpeg;base64,/9j/4AAQ...", ...}
```

### Successful Delete:
```
Delete clicked for property: 5
Calling deleteProperty API...
Delete response status: 200
Delete result: {success: true}
```

### Property Load on Refresh:
```
Loaded properties: (1) [{…}]
Property 1: id=5, title=Beautiful Home, has imageUrl: true
```

---

## Next Steps After Debugging

Once you've:
1. Captured the console logs
2. Checked network responses
3. Verified database content

Reply with:
- **What console messages you see** (or screenshot of F12 console)
- **What network status codes appear**
- **Whether DELETE shows 200 status but property doesn't delete**
- **Whether imageUrl exists in database**

This will help pinpoint exactly where the issue is!

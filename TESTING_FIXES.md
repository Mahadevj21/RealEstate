# Image & Delete Fix - Testing Instructions

## What Was Fixed

### 1. **Delete Endpoint** (500 Error)
✅ Added proper error handling with ResponseEntity  
✅ Returns JSON response instead of plain text  
✅ Catches database constraint violations  

### 2. **Image Storage** 
✅ Added logging to track image data flow  
✅ Improved frontend error handling  

---

## Testing Steps

### **TEST 1: Delete Property**

1. Open browser to http://localhost:3000
2. Login as seller: `seller@realestate.com` / `seller123`
3. Click "My Properties" tab
4. **Click ❌ delete button on ANY property**
5. Check console (F12 → Console):
   ```
   Delete clicked for property: [id]
   Calling deleteProperty API...
   Delete response status: 200
   Delete result: {message: "Property deleted successfully", id: "[id]"}
   ✓ Property deleted successfully
   ```

6. **EXPECTED**: Property disappears from list immediately
7. **IF FAILED**: Check console error message

---

### **TEST 2: Add Property with Image**

1. Click "Add New Property" button
2. Fill in:
   - Title: `Test Home`
   - Description: `Test description`
   - Price: `50000`
   - Location: `Mumbai`
3. **Select an image file** (any image)
4. Check console (F12):
   ```
   File selected: [filename] Size: [bytes]
   Compressed image created, length: [chars]
   Original size: [bytes]
   Compressed base64 length: [chars]
   Setting formData with image
   ```

5. Click "Add Property"
6. Check console:
   ```
   Saving property - image size: [length]
   Adding property - imageUrl length: [length]
   Add property response status: 200
   Add result: {id: [id], title: "Test Home", imageUrl: "data:image...", ...}
   Property added successfully
   ```

7. **Check backend logs** (where Java is running):
   ```
   Adding property - imageUrl length: [chars]
   Property saved - imageUrl in DB: [chars or null]
   ```

---

### **TEST 3: Verify Image Displays**

1. Right after adding property above, scroll up
2. **YOUR NEW PROPERTY SHOULD APPEAR WITH IMAGE**
3. Click on the property card
4. Full-screen detail should show the image at top
5. Refresh the page (F5)
6. **IMAGE SHOULD STILL BE THERE** (data persisted)

---

## Debug Checklist

If images still don't show after adding:

**Q1: Does backend show imageUrl being saved?**
- Look at backend console (Terminal where Java is running)
- Should see: `Property saved - imageUrl in DB: [number > 0]`
- If shows "null" → image not being received

**Q2: Check database directly:**
```sql
SELECT id, title, imageUrl FROM properties WHERE title='Test Home' LIMIT 1;
```
- If imageUrl is NULL → data not being saved
- If imageUrl has data → data in DB but not retrieved properly

**Q3: Check API response:**
Open browser Developer Tools → Network Tab
- Do GET /properties
- Find your property in response
- Does it have imageUrl field with long base64 string?

---

## Commands to Test

### Delete via API:
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/properties/16" -Method DELETE -UseBasicParsing
```

### Add Property with Image (using small base64):
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8080/properties/add/2" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -UseBasicParsing `
  -Body '{"title":"API Test","description":"Test","price":100000,"location":"Test","imageUrl":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="}'

$response.Content | ConvertFrom-Json
```

---

## Expected Results

| Step | Expected | If Not Working |
|------|----------|----------------|
| Delete property | Property gone from list, 200 status | Check backend console for constraints |
| Upload image | Preview appears, compressed logs show | Check file size - may be too large |
| After save | Image visible in list | Check if imageUrl in API response |
| After refresh | Image still visible | Check database - imageUrl should have data |

---

## Next Action

1. **Test delete first** (simpler, will show if API calls work)
2. **Then test image upload** 
3. **Compare console vs database results**
4. Report what you see in:
   - Browser console logs
   - Backend console logs
   - Network tab response

This will help pinpoint exact failure point!

# Quick API Testing Script

## Test Login
```
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@realestate.com","password":"seller123"}'
```

## Test Get All Properties
```
curl -X GET http://localhost:8080/properties
```

## Test Add Property (Replace SELLER_ID with actual ID from login)
```
curl -X POST http://localhost:8080/properties/add/2 \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Home",
    "description":"A test property",
    "price":50000,
    "location":"New York",
    "imageUrl":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
  }'
```

## Test Delete Property (Replace 5 with actual property ID)
```
curl -X DELETE http://localhost:8080/properties/5
```

## Test Update Property
```
curl -X PUT http://localhost:8080/properties/5 \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Updated Home",
    "description":"Updated property",
    "price":60000,
    "location":"New York",
    "imageUrl":"data:image/jpeg;base64,..."
  }'
```

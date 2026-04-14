# Connecting to the Laravel Backend

## 1. Set the API URL

Edit `.env.local`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_USE_MOCKS=false
```

Then restart the dev server:
```bash
npm run dev
```

---

## 2. Laravel CORS (config/cors.php)

The frontend runs on `http://localhost:5173` (Vite default).
Make sure your `config/cors.php` allows it:

```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tasleem-frontend.vercel.app/',
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,   // required for Sanctum cookies
```

---

## 3. Sanctum Setup

```bash
php artisan install:api        # creates sanctum migration
php artisan migrate
```

In `config/sanctum.php`, add your frontend domain to `stateful`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173')),
```

In `.env`:
```
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DRIVER=cookie
```

---

## 4. Token-based Auth (what the frontend uses)

The frontend uses **Bearer token** auth (not cookie/session).  
Login response must include a `token` field:

```json
{
  "user": { "id": 1, "name": "...", "email": "...", "role": "user" },
  "token": "1|abc123..."
}
```

The token is stored in `localStorage` as `tasleem_token` and sent as:
```
Authorization: Bearer {token}
```

---

## 5. Route differences fixed in this release

| Feature | Old frontend (wrong) | Fixed → matches your backend |
|---|---|---|
| Product update | `POST /products/{id}` + `_method=PUT` | `PUT /products/{id}` |
| Image upload | `POST /products/{id}/images` | `POST /product-images/upload` |
| Image upload single | `POST /products/{id}/images/single` | `POST /product-images/upload-single` |
| Image delete | `DELETE /products/{id}/images/{iid}` | `DELETE /product-images/{id}` |
| Image bulk delete | `DELETE /products/{id}/images` | `DELETE /product-images/delete-multiple` |
| Cart clear | `DELETE /cart` | `DELETE /cart/clear/{user_id}` |
| Rental cart | `POST /cart/rentals` | `POST /cart` (with `type: rental`) |
| Wishlist check | `GET /wishlist/check/{id}` | `GET /wishlist/check?product_id={id}` |
| Wishlist clear | `DELETE /wishlist` | `DELETE /wishlist/clear/{userId}` |
| Logs | only `GET /logs` | + `GET /logs/{id}`, `/logs/stats`, `/logs/user/{id}`, `/logs/entity/{type}/{id}` |

## 6. Features not yet in backend (gracefully disabled)

These features exist in the UI but are silently disabled until the backend implements them:

- **Forgot password / Reset password** — login redirects, no 500 errors
- **Email verification** — banner hidden, verify routes redirect to `/login`
- **Notifications** — bell stays empty (returns `[]`), no polling, no errors

---

## 7. Run it

```bash
# Terminal 1 — Laravel
cd your-laravel-project
php artisan serve

# Terminal 2 — Vue frontend
cd tasleem-frontend
npm install
cp .env.example .env.local   # edit with your backend URL
npm run dev
```

Open http://localhost:5173

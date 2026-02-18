# Deployment Guide

## Build for Production

```bash
npm run build
```

This generates optimized files in `dist/`:
- HTML, CSS, JS bundles (code-split)
- Service worker + PWA manifest
- Static assets

**Build size**: ~263 KB gzipped (total JS)

## Deploy to Vercel

### Option 1: CLI
```bash
npm install -g vercel
vercel deploy
```

### Option 2: Git Integration
1. Push to GitHub
2. Import project at https://vercel.com/new
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

## Deploy to Netlify

### Option 1: Drag & Drop
1. Build locally: `npm run build`
2. Visit https://app.netlify.com/drop
3. Drag `dist/` folder to upload

### Option 2: Git Integration
1. Push to GitHub
2. "New site from Git" at https://app.netlify.com
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

### Netlify Config (optional)
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install -D gh-pages
```

2. Update `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/ivy-wallet"
}
```

3. Update `vite.config.js`:
```js
export default defineConfig({
  base: '/ivy-wallet/', // Your repo name
  // ... rest of config
});
```

4. Deploy:
```bash
npm run deploy
```

## Deploy to Your Own Server

1. Build: `npm run build`
2. Upload `dist/` contents to web server
3. Configure web server for SPA routing:

### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Apache (.htaccess)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Environment Variables

No environment variables needed — app is 100% client-side.

## PWA Configuration

PWA settings in `vite.config.js`:
- App name: "Ivy Wallet"
- Theme color: #5C3DF5 (Ivy Purple)
- Icons: 192x192, 512x512
- Display mode: standalone
- Offline support: enabled

## Post-Deployment Checklist

- [ ] Test on mobile device
- [ ] Verify PWA install prompt works
- [ ] Test offline functionality
- [ ] Check all routes load correctly
- [ ] Verify IndexedDB persists data
- [ ] Test light/dark themes
- [ ] Import/Export CSV working
- [ ] Service worker caching assets

## Performance Tips

Already optimized:
- ✅ Code splitting (vendor, redux, charts, db, app)
- ✅ Tree-shaking (Vite/Rollup)
- ✅ Minification
- ✅ Gzip compression
- ✅ Service worker caching
- ✅ Lazy loading charts

## Monitoring

### Lighthouse Audit
```bash
npm run build
npm run preview
# Open Chrome DevTools → Lighthouse
# Run audit for PWA, Performance, Accessibility
```

**Expected scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

## Troubleshooting

### Build fails
- Check Node.js version (16+)
- Delete `node_modules` and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`

### PWA not installing
- HTTPS required (localhost exempt)
- Check manifest.json generates correctly
- Verify service worker registered

### Routing breaks on refresh
- Ensure SPA fallback configured on server
- All requests should serve `index.html`

## Updates

To update deployed app:
1. Make changes
2. `npm run build`
3. Redeploy (service worker auto-updates users)

Users get updates on next visit (auto-refresh via service worker).

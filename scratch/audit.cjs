const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function extractFrontendRoutes() {
  const apiDir = path.join(__dirname, '../src/api');
  const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));
  const routes = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(apiDir, file), 'utf-8');
    // Match api.get('/path', ...) or api.post(`/path/${id}`, ...)
    const regex = /api\.(get|post|put|delete|patch)\((['`])(.*?)\2/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      let routePath = match[3];
      // Normalize /${id} to /:id
      routePath = routePath.replace(/\$\{.*?\}/g, ':id');
      routes.push({ method, path: routePath, file });
    }
  });
  return routes;
}

function extractBackendRoutes() {
  const routesDir = path.join(__dirname, '../server/src/routes');
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));
  const routes = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    // Match router.get('/path', ...)
    const regex = /router\.(get|post|put|delete|patch)\((['`])(.*?)\2.*?(authGuard)?/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const routePath = match[3];
      const hasAuth = !!match[4];
      // Since some routes might be mounted with prefixes in index.ts, we need to know the prefix.
      // Usually, it's /api/something, but in the backend, they are mounted. Let's just capture the base.
      // Let's look at server/src/app.ts to see mount points.
      routes.push({ method, path: routePath, file, authGuard: hasAuth });
    }
  });
  return routes;
}

function getMountPoints() {
    const appTs = fs.readFileSync(path.join(__dirname, '../server/src/app.ts'), 'utf-8');
    const regex = /app\.use\((['`])(\/api.*?)\1,\s*(.*?)\)/g;
    const mounts = {};
    let match;
    while ((match = regex.exec(appTs)) !== null) {
        mounts[match[3]] = match[2]; // e.g. mounts['authRoutes'] = '/api/auth'
    }
    return mounts;
}

const frontend = extractFrontendRoutes();
const backend = extractBackendRoutes();
const mounts = getMountPoints();

// Normalize backend routes using mount points.
// A file like 'authRoutes.ts' corresponds to router export in 'authRoutes' (usually).
// Let's assume file 'userRoutes.ts' -> /api/users
// Since this is generic, let's just print them out and compare.

console.log('--- Frontend Expected Routes ---');
const feSet = new Set(frontend.map(r => `${r.method} ${r.path}`));
frontend.forEach(r => console.log(`${r.method} ${r.path} (from ${r.file})`));

console.log('\n--- Backend Available Routes ---');
// Let's try to infer mount prefix from filename
const prefixMap = {
    'authRoutes.ts': '/auth',
    'chatRoutes.ts': '/conversations',
    'favoriteRoutes.ts': '/favorites',
    'itineraryRoutes.ts': '/itineraries',
    'paymentRoutes.ts': '/payments',
};

backend.forEach(r => {
    let p = r.path;
    let prefix = prefixMap[r.file];
    if (prefix && !p.startsWith(prefix)) {
        if (p === '/') p = prefix;
        else p = prefix + p;
    }
    console.log(`${r.method} ${p} [Auth: ${r.authGuard}] (from ${r.file})`);
});

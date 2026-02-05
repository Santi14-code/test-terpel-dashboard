const fs = require('fs');
const path = require('path');

// Rutas a convertir (sin home y filters que ya están hechos)
const routes = [
  'alignment', 'architecture', 'change', 'costs', 'executive',
  'governance', 'innovation', 'performance', 'risks', 'technical-debt'
];

// Template base para cada función
function createFunctionHandler(routeName) {
  const routePath = path.join(__dirname, '../src/app/api/dashboard', routeName, 'route.ts');

  if (!fs.existsSync(routePath)) {
    console.log(`Skipping ${routeName} - file not found`);
    return '';
  }

  const originalContent = fs.readFileSync(routePath, 'utf8');

  // Extraer el código dentro de GET function
  const getMatch = originalContent.match(/export async function GET\([^)]*\)\s*{([\s\S]*?)^}/m);

  if (!getMatch) {
    console.log(`Could not parse GET function for ${routeName}`);
    return '';
  }

  const functionBody = getMatch[1]
    .replace(/return NextResponse\.json\(([\s\S]*?)\)/g, 'return {\n      status: 200,\n      headers: corsHeaders(),\n      jsonBody: $1\n    }')
    .trim();

  const handlerName = routeName.replace(/-/g, '_') + 'Handler';
  const routeId = 'dashboard-' + routeName;

  return `
// ============================================================================
// ${routeName.toUpperCase().replace(/-/g, ' ')} DASHBOARD ENDPOINT
// ============================================================================
async function ${handlerName}(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders() }
    }

${functionBody}
  } catch (error: any) {
    return errorResponse(error, context)
  }
}

app.http('${routeId}', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'dashboard/${routeName}',
  handler: ${handlerName},
})
`;
}

// Leer el archivo index.ts actual
const indexPath = path.join(__dirname, 'src/functions/index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Agregar todas las rutas
routes.forEach(route => {
  const handler = createFunctionHandler(route);
  if (handler) {
    indexContent += '\n' + handler;
    console.log(`Added handler for ${route}`);
  }
});

// Escribir el archivo actualizado
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('\nAll handlers added successfully!');

#!/usr/bin/env npx tsx
/**
 * API Route Tester
 * Tests all API routes in the application to verify they are working correctly.
 *
 * Usage:
 *   npx tsx scripts/test-routes.ts [options]
 *
 * Options:
 *   --base-url <url>  Base URL to test against (default: http://localhost:3000)
 *   --verbose         Show detailed response information
 *   --public-only     Only test public routes (no auth required)
 */

interface RouteTest {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  requiresAuth: boolean;
  requiresBody?: boolean;
  sampleBody?: Record<string, unknown>;
  dynamicId?: string;
}

interface TestResult {
  route: RouteTest;
  status: number;
  success: boolean;
  message: string;
  responseTime: number;
  error?: string;
}

const ROUTES: RouteTest[] = [
  // Public routes (no auth required)
  {
    path: "/api/test",
    method: "GET",
    description: "Health check endpoint",
    requiresAuth: false,
  },
  {
    path: "/api/public/roosters",
    method: "GET",
    description: "Get public roosters list",
    requiresAuth: false,
  },
  {
    path: "/api/public/breeds",
    method: "GET",
    description: "Get public breeds list",
    requiresAuth: false,
  },
  {
    path: "/api/public/locations",
    method: "GET",
    description: "Get public locations list",
    requiresAuth: false,
  },
  {
    path: "/api/public/reviews",
    method: "GET",
    description: "Get public reviews",
    requiresAuth: false,
  },
  {
    path: "/api/public/testimonials",
    method: "GET",
    description: "Get public testimonials",
    requiresAuth: false,
  },

  // Auth routes
  {
    path: "/api/auth/me",
    method: "GET",
    description: "Get current user session",
    requiresAuth: false,
  },
  {
    path: "/api/auth/login",
    method: "POST",
    description: "User login",
    requiresAuth: false,
    requiresBody: true,
    sampleBody: { idToken: "test-token" },
  },
  {
    path: "/api/auth/logout",
    method: "POST",
    description: "User logout",
    requiresAuth: false,
  },
  {
    path: "/api/auth/sign-up",
    method: "POST",
    description: "User signup",
    requiresAuth: false,
    requiresBody: true,
    sampleBody: { email: "test@test.com", password: "test123" },
  },
  {
    path: "/api/auth/forgot-password",
    method: "POST",
    description: "Forgot password",
    requiresAuth: false,
    requiresBody: true,
    sampleBody: { email: "test@test.com" },
  },
  {
    path: "/api/auth/reset-password",
    method: "POST",
    description: "Reset password",
    requiresAuth: false,
    requiresBody: true,
    sampleBody: { oobCode: "test-code", newPassword: "newpass123" },
  },
  {
    path: "/api/auth/verify-email",
    method: "POST",
    description: "Verify email",
    requiresAuth: false,
    requiresBody: true,
    sampleBody: { uid: "test-uid" },
  },

  // Protected routes - Roosters
  {
    path: "/api/roosters",
    method: "GET",
    description: "Get all roosters (admin)",
    requiresAuth: true,
  },
  {
    path: "/api/roosters/breeds",
    method: "GET",
    description: "Get rooster breeds (admin)",
    requiresAuth: true,
  },
  {
    path: "/api/roosters/locations",
    method: "GET",
    description: "Get rooster locations (admin)",
    requiresAuth: true,
  },

  // Protected routes - Inventory
  {
    path: "/api/inventory",
    method: "GET",
    description: "Get inventory items",
    requiresAuth: true,
  },
  {
    path: "/api/inventory/stats",
    method: "GET",
    description: "Get inventory stats",
    requiresAuth: true,
  },
  {
    path: "/api/inventory/activity",
    method: "GET",
    description: "Get inventory activity log",
    requiresAuth: true,
  },

  // Protected routes - Sales
  {
    path: "/api/sales/transactions",
    method: "GET",
    description: "Get sales transactions",
    requiresAuth: true,
  },
  {
    path: "/api/sales/analytics",
    method: "GET",
    description: "Get sales analytics",
    requiresAuth: true,
  },

  // Protected routes - Suppliers
  {
    path: "/api/suppliers",
    method: "GET",
    description: "Get suppliers",
    requiresAuth: true,
  },

  // Protected routes - Feedback
  {
    path: "/api/feedback/reviews",
    method: "GET",
    description: "Get feedback reviews (admin)",
    requiresAuth: true,
  },
  {
    path: "/api/feedback/testimonials",
    method: "GET",
    description: "Get testimonials (admin)",
    requiresAuth: true,
  },

  // Protected routes - Dashboard
  {
    path: "/api/dashboard/activity",
    method: "GET",
    description: "Get dashboard activity",
    requiresAuth: true,
  },
  {
    path: "/api/analytics",
    method: "GET",
    description: "Get analytics data",
    requiresAuth: true,
  },
  {
    path: "/api/notifications",
    method: "GET",
    description: "Get notifications",
    requiresAuth: true,
  },

  // Protected routes - Audit
  {
    path: "/api/audit",
    method: "GET",
    description: "Get audit logs",
    requiresAuth: true,
  },
  {
    path: "/api/audit/stats",
    method: "GET",
    description: "Get audit stats",
    requiresAuth: true,
  },
];

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
};

const log = {
  info: (msg: string) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg: string) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg: string) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  header: (msg: string) =>
    console.log(`\n${COLORS.bright}${COLORS.cyan}${msg}${COLORS.reset}\n`),
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    baseUrl: "http://localhost:3000",
    verbose: false,
    publicOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--base-url" && args[i + 1]) {
      options.baseUrl = args[i + 1];
      i++;
    } else if (args[i] === "--verbose") {
      options.verbose = true;
    } else if (args[i] === "--public-only") {
      options.publicOnly = true;
    }
  }

  return options;
};

const testRoute = async (
  route: RouteTest,
  baseUrl: string,
  verbose: boolean
): Promise<TestResult> => {
  const url = `${baseUrl}${route.path}`;
  const startTime = Date.now();

  try {
    const options: RequestInit = {
      method: route.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (route.requiresBody && route.sampleBody) {
      options.body = JSON.stringify(route.sampleBody);
    }

    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;

    let message = "";
    let success = false;

    if (response.ok) {
      success = true;
      message = "Route is accessible";
    } else if (response.status === 401 || response.status === 403) {
      success = true;
      message = "Auth required (expected)";
    } else if (response.status === 400) {
      success = true;
      message = "Bad request (missing params)";
    } else if (response.status === 404) {
      success = false;
      message = "Route not found";
    } else if (response.status === 500) {
      success = false;
      message = "Server error";
    } else {
      success = response.status < 500;
      message = `HTTP ${response.status}`;
    }

    if (verbose) {
      try {
        const data = await response.json();
        console.log(
          `   ${COLORS.dim}Response: ${JSON.stringify(data).substring(0, 100)}...${COLORS.reset}`
        );
      } catch {
        // Response is not JSON
      }
    }

    return {
      route,
      status: response.status,
      success,
      message,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      route,
      status: 0,
      success: false,
      message: "Connection failed",
      responseTime,
      error: errorMessage,
    };
  }
};

const formatResponseTime = (ms: number): string => {
  if (ms < 100) return `${COLORS.green}${ms}ms${COLORS.reset}`;
  if (ms < 500) return `${COLORS.yellow}${ms}ms${COLORS.reset}`;
  return `${COLORS.red}${ms}ms${COLORS.reset}`;
};

const formatStatus = (status: number, success: boolean): string => {
  if (status === 0) return `${COLORS.red}ERR${COLORS.reset}`;
  if (success) return `${COLORS.green}${status}${COLORS.reset}`;
  return `${COLORS.red}${status}${COLORS.reset}`;
};

const main = async () => {
  const options = parseArgs();

  console.log(`
${COLORS.bright}${COLORS.cyan}╔═══════════════════════════════════════════════════════╗
║           Triple A Farm - API Route Tester            ║
╚═══════════════════════════════════════════════════════╝${COLORS.reset}
`);

  log.info(`Base URL: ${options.baseUrl}`);
  log.info(`Verbose: ${options.verbose ? "Yes" : "No"}`);
  log.info(`Public only: ${options.publicOnly ? "Yes" : "No"}`);

  // Check if server is running
  log.header("Checking server connectivity...");
  try {
    await fetch(`${options.baseUrl}/api/test`);
    log.success("Server is running");
  } catch {
    log.error(`Server is not running at ${options.baseUrl}`);
    log.info("Start the dev server with: npm run dev");
    process.exit(1);
  }

  // Filter routes
  const routesToTest = options.publicOnly
    ? ROUTES.filter((r) => !r.requiresAuth)
    : ROUTES;

  log.header(`Testing ${routesToTest.length} routes...`);

  const results: TestResult[] = [];
  const publicRoutes = routesToTest.filter((r) => !r.requiresAuth);
  const protectedRoutes = routesToTest.filter((r) => r.requiresAuth);

  // Test public routes
  if (publicRoutes.length > 0) {
    console.log(`\n${COLORS.bright}Public Routes:${COLORS.reset}`);
    console.log("─".repeat(70));

    for (const route of publicRoutes) {
      const result = await testRoute(route, options.baseUrl, options.verbose);
      results.push(result);

      const statusStr = formatStatus(result.status, result.success);
      const timeStr = formatResponseTime(result.responseTime);
      const methodStr = `${COLORS.magenta}${route.method.padEnd(6)}${COLORS.reset}`;
      const pathStr = route.path.padEnd(35);
      const icon = result.success
        ? `${COLORS.green}✓${COLORS.reset}`
        : `${COLORS.red}✗${COLORS.reset}`;

      console.log(
        `${icon} ${methodStr} ${pathStr} ${statusStr.padEnd(15)} ${timeStr.padEnd(15)} ${result.message}`
      );
    }
  }

  // Test protected routes
  if (protectedRoutes.length > 0) {
    console.log(
      `\n${COLORS.bright}Protected Routes (requires auth):${COLORS.reset}`
    );
    console.log("─".repeat(70));

    for (const route of protectedRoutes) {
      const result = await testRoute(route, options.baseUrl, options.verbose);
      results.push(result);

      const statusStr = formatStatus(result.status, result.success);
      const timeStr = formatResponseTime(result.responseTime);
      const methodStr = `${COLORS.magenta}${route.method.padEnd(6)}${COLORS.reset}`;
      const pathStr = route.path.padEnd(35);
      const icon = result.success
        ? `${COLORS.green}✓${COLORS.reset}`
        : `${COLORS.red}✗${COLORS.reset}`;

      console.log(
        `${icon} ${methodStr} ${pathStr} ${statusStr.padEnd(15)} ${timeStr.padEnd(15)} ${result.message}`
      );
    }
  }

  // Summary
  log.header("Test Summary");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const avgTime = Math.round(
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
  );

  console.log(`  Total routes tested: ${results.length}`);
  console.log(`  ${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  console.log(
    `  ${failed > 0 ? COLORS.red : COLORS.dim}Failed: ${failed}${COLORS.reset}`
  );
  console.log(`  Average response time: ${avgTime}ms`);

  // Show failed routes
  const failedResults = results.filter((r) => !r.success);
  if (failedResults.length > 0) {
    console.log(`\n${COLORS.red}${COLORS.bright}Failed Routes:${COLORS.reset}`);
    failedResults.forEach((r) => {
      console.log(
        `  ${COLORS.red}✗${COLORS.reset} ${r.route.method} ${r.route.path}`
      );
      console.log(
        `    ${COLORS.dim}${r.message}${r.error ? `: ${r.error}` : ""}${COLORS.reset}`
      );
    });
  }

  // Show slow routes (>500ms)
  const slowRoutes = results.filter((r) => r.responseTime > 500);
  if (slowRoutes.length > 0) {
    console.log(
      `\n${COLORS.yellow}${COLORS.bright}Slow Routes (>500ms):${COLORS.reset}`
    );
    slowRoutes.forEach((r) => {
      console.log(
        `  ${COLORS.yellow}⚠${COLORS.reset} ${r.route.method} ${r.route.path} - ${r.responseTime}ms`
      );
    });
  }

  console.log("");

  // Exit with error code if any failed
  if (failed > 0) {
    process.exit(1);
  }
};

main().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});

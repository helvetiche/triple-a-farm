#!/usr/bin/env tsx

/**
 * Manual testing script for SWR and Redis caching implementation
 * Run with: npx tsx scripts/test-caching.ts
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { redis, CACHE_KEYS, CACHE_TTL, withCache } from "../lib/redis";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRedisConnection() {
  log("\n=== Testing Redis Connection ===", "cyan");
  try {
    await redis.set("test-connection", "success");
    const result = await redis.get("test-connection");
    await redis.del("test-connection");

    if (result === "success") {
      log("✓ Redis connection successful", "green");
      return true;
    } else {
      log("✗ Redis connection failed", "red");
      return false;
    }
  } catch (error) {
    log(`✗ Redis connection error: ${error}`, "red");
    return false;
  }
}

async function testCacheOperations() {
  log("\n=== Testing Cache Operations ===", "cyan");

  try {
    // Test SET
    log("Testing SET operation...", "yellow");
    const testData = { id: "test-1", name: "Test Item", timestamp: Date.now() };
    await redis.setex("test-cache-key", 60, JSON.stringify(testData));
    log("✓ SET operation successful", "green");

    // Test GET
    log("Testing GET operation...", "yellow");
    const cached = await redis.get("test-cache-key");
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      log(`✓ GET operation successful: ${JSON.stringify(parsed)}`, "green");
    } else {
      log("✗ GET operation failed - no data returned", "red");
    }

    // Test DEL
    log("Testing DEL operation...", "yellow");
    await redis.del("test-cache-key");
    const afterDelete = await redis.get("test-cache-key");
    if (!afterDelete) {
      log("✓ DEL operation successful", "green");
    } else {
      log("✗ DEL operation failed - data still exists", "red");
    }

    return true;
  } catch (error) {
    log(`✗ Cache operations error: ${error}`, "red");
    return false;
  }
}

async function testCacheKeys() {
  log("\n=== Testing Cache Key Generation ===", "cyan");

  const tests = [
    { key: CACHE_KEYS.ROOSTERS, expected: "roosters:all" },
    { key: CACHE_KEYS.ROOSTER("R001"), expected: "rooster:R001" },
    { key: CACHE_KEYS.INVENTORY(), expected: "inventory:all" },
    {
      key: CACHE_KEYS.INVENTORY("LOC001"),
      expected: "inventory:location:LOC001",
    },
    { key: CACHE_KEYS.INVENTORY_STATS(), expected: "inventory:stats:all" },
    { key: CACHE_KEYS.BREEDS, expected: "breeds:all" },
    { key: CACHE_KEYS.LOCATIONS, expected: "locations:all" },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    if (test.key === test.expected) {
      log(`✓ ${test.expected}`, "green");
      passed++;
    } else {
      log(`✗ Expected: ${test.expected}, Got: ${test.key}`, "red");
      failed++;
    }
  }

  log(`\nResults: ${passed} passed, ${failed} failed`, "blue");
  return failed === 0;
}

async function testCacheTTL() {
  log("\n=== Testing Cache TTL Values ===", "cyan");

  const ttls = [
    { name: "FAST", value: CACHE_TTL.FAST, expected: 30 },
    { name: "MEDIUM", value: CACHE_TTL.MEDIUM, expected: 60 },
    { name: "SLOW", value: CACHE_TTL.SLOW, expected: 300 },
    { name: "STATIC", value: CACHE_TTL.STATIC, expected: 600 },
  ];

  let passed = 0;
  let failed = 0;

  for (const ttl of ttls) {
    if (ttl.value === ttl.expected) {
      log(`✓ ${ttl.name}: ${ttl.value}s`, "green");
      passed++;
    } else {
      log(`✗ ${ttl.name}: Expected ${ttl.expected}s, Got ${ttl.value}s`, "red");
      failed++;
    }
  }

  log(`\nResults: ${passed} passed, ${failed} failed`, "blue");
  return failed === 0;
}

async function testWithCacheFunction() {
  log("\n=== Testing withCache Function ===", "cyan");

  try {
    let fetchCount = 0;
    const mockFetcher = async () => {
      fetchCount++;
      return { data: "test", fetchCount };
    };

    // First call - should fetch
    log("First call (should fetch)...", "yellow");
    const result1 = await withCache("test-with-cache", 60, mockFetcher);
    log(`✓ Fetched: ${JSON.stringify(result1)}`, "green");

    // Second call - should use cache
    log("Second call (should use cache)...", "yellow");
    const result2 = await withCache("test-with-cache", 60, mockFetcher);
    log(`✓ Cached: ${JSON.stringify(result2)}`, "green");

    if (fetchCount === 1) {
      log("✓ Cache working correctly (fetched only once)", "green");
    } else {
      log(`✗ Cache not working (fetched ${fetchCount} times)`, "red");
    }

    // Cleanup
    await redis.del("test-with-cache");

    return fetchCount === 1;
  } catch (error) {
    log(`✗ withCache test error: ${error}`, "red");
    return false;
  }
}

async function testAPIEndpoints() {
  log("\n=== Testing API Endpoints (Manual) ===", "cyan");
  log("To test API endpoints with caching:", "yellow");
  log("1. Start the dev server: npm run dev", "blue");
  log("2. Make requests to:", "blue");
  log("   - GET http://localhost:3000/api/roosters", "blue");
  log("   - GET http://localhost:3000/api/inventory", "blue");
  log("   - GET http://localhost:3000/api/analytics", "blue");
  log("3. Check Redis for cached data", "blue");
  log("4. Make the same request again (should be faster)", "blue");
}

async function runAllTests() {
  log("\n╔════════════════════════════════════════╗", "cyan");
  log("║  SWR & Redis Caching Test Suite       ║", "cyan");
  log("╚════════════════════════════════════════╝", "cyan");

  const results = {
    connection: await testRedisConnection(),
    operations: await testCacheOperations(),
    keys: await testCacheKeys(),
    ttl: await testCacheTTL(),
    withCache: await testWithCacheFunction(),
  };

  await testAPIEndpoints();

  log("\n╔════════════════════════════════════════╗", "cyan");
  log("║  Test Summary                          ║", "cyan");
  log("╚════════════════════════════════════════╝", "cyan");

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  for (const [test, result] of Object.entries(results)) {
    const status = result ? "✓ PASS" : "✗ FAIL";
    const color = result ? "green" : "red";
    log(`${status} - ${test}`, color);
  }

  log(`\nTotal: ${passed}/${total} tests passed`, "blue");

  if (passed === total) {
    log("\n🎉 All tests passed!", "green");
  } else {
    log("\n⚠️  Some tests failed", "red");
  }

  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch((error) => {
  log(`\nFatal error: ${error}`, "red");
  process.exit(1);
});

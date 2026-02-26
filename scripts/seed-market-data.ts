#!/usr/bin/env tsx
/**
 * Seed Market Data (Demo/Development)
 *
 * This script seeds the database with sample market data for development and testing.
 * Use fetch-market-data.ts for real data from Alpha Vantage.
 *
 * Usage:
 *   npm run seed-market-data
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Generate realistic market data for the past 30 days
 */
function generateMarketData(): Array<{
  date: string;
  sp500_close: number;
  sp500_ytd_return: number;
  bond_yield_10y: number;
  inflation_rate: number;
  msci_world_close: number;
  msci_world_ytd_return: number;
}> {
  const data: any[] = [];
  const today = new Date();

  // Base values (realistic as of Feb 2026)
  let sp500 = 580.25; // SPY ETF price
  let msciWorld = 125.50; // VT ETF price
  const bondYield = 4.25;
  const inflationRate = 3.1;

  // Generate data for last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Add some realistic daily fluctuation (-1% to +1%)
    const sp500Change = (Math.random() - 0.5) * 2;
    sp500 += sp500 * (sp500Change / 100);

    const msciChange = (Math.random() - 0.5) * 2;
    msciWorld += msciWorld * (msciChange / 100);

    // Calculate YTD return (simplified - assume 5-8% YTD)
    const ytdReturn = 5 + Math.random() * 3;

    data.push({
      date: dateStr,
      sp500_close: parseFloat(sp500.toFixed(2)),
      sp500_ytd_return: parseFloat(ytdReturn.toFixed(2)),
      bond_yield_10y: parseFloat((bondYield + (Math.random() - 0.5) * 0.2).toFixed(2)),
      inflation_rate: parseFloat((inflationRate + (Math.random() - 0.5) * 0.1).toFixed(2)),
      msci_world_close: parseFloat(msciWorld.toFixed(2)),
      msci_world_ytd_return: parseFloat((ytdReturn - 0.5 + Math.random()).toFixed(2))
    });
  }

  return data;
}

/**
 * Main function
 */
async function main() {
  console.log('📊 Seeding market data...\n');

  const marketData = generateMarketData();

  console.log(`📝 Generated ${marketData.length} days of market data`);
  console.log(`📅 Date range: ${marketData[0].date} to ${marketData[marketData.length - 1].date}\n`);

  // Insert data in bulk
  console.log('📥 Inserting data into Supabase...');

  const { data, error } = await supabase
    .from('market_data')
    .upsert(marketData, { onConflict: 'date' })
    .select();

  if (error) {
    console.error('❌ Failed to insert market data:', error);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data?.length || 0} records\n`);

  // Verify by reading the latest record
  const { data: latestData, error: fetchError } = await supabase
    .from('market_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (fetchError) {
    console.error('❌ Failed to verify data:', fetchError);
  } else {
    console.log('📊 Latest market data in database:');
    console.log(`   Date: ${latestData.date}`);
    console.log(`   S&P 500: $${latestData.sp500_close} (YTD: ${latestData.sp500_ytd_return}%)`);
    console.log(`   10Y Bond: ${latestData.bond_yield_10y}%`);
    console.log(`   Inflation: ${latestData.inflation_rate}%`);
    console.log(`   MSCI World: $${latestData.msci_world_close} (YTD: ${latestData.msci_world_ytd_return}%)`);
  }

  console.log('\n🎉 Market data seeded successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Visit your dashboard to see market data in action');
  console.log('   2. Generate a financial plan with real market context');
  console.log('   3. Use "npm run fetch-market-data" to fetch live data from Alpha Vantage');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

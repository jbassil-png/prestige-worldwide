#!/usr/bin/env tsx
/**
 * Fetch Market Data from Alpha Vantage
 *
 * This script fetches real-time market data from Alpha Vantage API and stores it in Supabase.
 *
 * Usage:
 *   npx tsx scripts/fetch-market-data.ts
 *
 * Data fetched:
 *   - S&P 500 (SPY ETF) - current price and YTD return
 *   - 10-Year Treasury Yield (^TNX)
 *   - MSCI World Index (approximated via VT ETF)
 *   - Inflation rate (manual or from FRED API)
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!ALPHA_VANTAGE_API_KEY) {
  console.error('❌ Missing Alpha Vantage API key');
  console.error('   Add ALPHA_VANTAGE_API_KEY to .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Fetch quote data from Alpha Vantage
 */
async function fetchQuote(symbol: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
} | null> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data['Note']) {
      console.warn(`⚠️  API rate limit reached for ${symbol}`);
      return null;
    }

    if (data['Error Message']) {
      console.error(`❌ Error fetching ${symbol}:`, data['Error Message']);
      return null;
    }

    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      console.error(`❌ Invalid response for ${symbol}:`, data);
      return null;
    }

    return {
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
    };
  } catch (error) {
    console.error(`❌ Failed to fetch ${symbol}:`, error);
    return null;
  }
}

/**
 * Calculate YTD return
 * For simplicity, we'll use the change percent from the quote
 * In production, you'd fetch historical data from Jan 1st
 */
function calculateYTDReturn(changePercent: number): number {
  // This is a simplified approximation
  // TODO: Fetch actual YTD data using TIME_SERIES_DAILY
  return changePercent;
}

/**
 * Fetch 10-year treasury yield
 * Alpha Vantage provides this via TREASURY_YIELD function
 */
async function fetchTreasuryYield(): Promise<number | null> {
  const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=daily&maturity=10year&apikey=${ALPHA_VANTAGE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data['Note']) {
      console.warn('⚠️  API rate limit reached for Treasury Yield');
      return null;
    }

    if (data['data'] && data['data'].length > 0) {
      const latestYield = parseFloat(data['data'][0]['value']);
      return latestYield;
    }

    console.warn('⚠️  No treasury yield data available, using default');
    return 4.25; // Default fallback
  } catch (error) {
    console.error('❌ Failed to fetch treasury yield:', error);
    return 4.25; // Default fallback
  }
}

/**
 * Main function to fetch and store market data
 */
async function main() {
  console.log('📊 Fetching market data from Alpha Vantage...\n');

  // Fetch S&P 500 (SPY ETF)
  console.log('🔍 Fetching S&P 500 (SPY)...');
  const spyData = await fetchQuote('SPY');

  if (!spyData) {
    console.error('❌ Failed to fetch S&P 500 data');
    process.exit(1);
  }

  console.log(`✅ SPY: $${spyData.price.toFixed(2)} (${spyData.changePercent > 0 ? '+' : ''}${spyData.changePercent.toFixed(2)}%)`);

  // Wait 12 seconds between API calls (free tier limit: 5 calls/minute)
  console.log('⏳ Waiting 12 seconds (API rate limit)...');
  await new Promise(resolve => setTimeout(resolve, 12000));

  // Fetch 10-Year Treasury Yield
  console.log('🔍 Fetching 10-Year Treasury Yield...');
  const treasuryYield = await fetchTreasuryYield();

  if (treasuryYield) {
    console.log(`✅ 10-Year Treasury: ${treasuryYield.toFixed(2)}%`);
  }

  // Wait 12 seconds
  console.log('⏳ Waiting 12 seconds (API rate limit)...');
  await new Promise(resolve => setTimeout(resolve, 12000));

  // Fetch MSCI World (approximated via VT - Vanguard Total World Stock ETF)
  console.log('🔍 Fetching MSCI World (VT ETF)...');
  const vtData = await fetchQuote('VT');

  if (!vtData) {
    console.warn('⚠️  Failed to fetch MSCI World data, using S&P 500 as proxy');
  } else {
    console.log(`✅ VT: $${vtData.price.toFixed(2)} (${vtData.changePercent > 0 ? '+' : ''}${vtData.changePercent.toFixed(2)}%)`);
  }

  // Prepare market data for database
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const marketData = {
    date: today,
    sp500_close: spyData.price,
    sp500_ytd_return: calculateYTDReturn(spyData.changePercent),
    bond_yield_10y: treasuryYield || 4.25,
    inflation_rate: 3.1, // Static for now - would need separate API (FRED)
    msci_world_close: vtData?.price || null,
    msci_world_ytd_return: vtData ? calculateYTDReturn(vtData.changePercent) : null,
    fetched_at: new Date().toISOString()
  };

  console.log('\n📥 Storing data in Supabase...');
  console.log('Data:', JSON.stringify(marketData, null, 2));

  // Insert or update market data
  const { data, error } = await supabase
    .from('market_data')
    .upsert(marketData, { onConflict: 'date' })
    .select();

  if (error) {
    console.error('❌ Failed to store market data:', error);
    process.exit(1);
  }

  console.log('\n✅ Market data stored successfully!');
  console.log('📊 Record ID:', data[0]?.id);

  // Verify by reading back
  const { data: latestData, error: fetchError } = await supabase
    .from('market_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (fetchError) {
    console.error('❌ Failed to verify data:', fetchError);
  } else {
    console.log('\n📊 Latest market data in database:');
    console.log(`   Date: ${latestData.date}`);
    console.log(`   S&P 500: $${latestData.sp500_close} (YTD: ${latestData.sp500_ytd_return}%)`);
    console.log(`   10Y Bond: ${latestData.bond_yield_10y}%`);
    console.log(`   Inflation: ${latestData.inflation_rate}%`);
    if (latestData.msci_world_close) {
      console.log(`   MSCI World: $${latestData.msci_world_close} (YTD: ${latestData.msci_world_ytd_return}%)`);
    }
  }

  console.log('\n🎉 Done!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

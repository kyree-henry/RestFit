/**
 * Real-World API Example
 * 
 * This example demonstrates using RestFit with a real-world API (REST Countries).
 * It shows practical usage patterns including error handling and data transformation.
 */

import 'reflect-metadata';
import { Get, Path, Query, OnError, OnSuccess, createApiService } from '../src';
import { AxiosError } from 'axios';

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  flags: {
    png: string;
    svg: string;
  };
}

interface SimplifiedCountry {
  name: string;
  code: string;
  capital: string;
  region: string;
  population: number;
  currency: string;
  flag: string;
}

class CountryService {
  // Get all countries
  @Get('/v3.1/all')
  @OnSuccess(200, (data: Country[]): SimplifiedCountry[] => {
    return data.map(country => ({
      name: country.name.common,
      code: country.cca2,
      capital: country.capital?.[0] || 'N/A',
      region: country.region,
      population: country.population,
      currency: Object.keys(country.currencies || {})[0] || 'N/A',
      flag: country.flags.png,
    }));
  })
  async getAllCountries(): Promise<SimplifiedCountry[]> {
    return [];
  }

  // Get country by code
  @Get('/v3.1/alpha/{code}')
  @OnError(404, (error: AxiosError) => {
    console.warn(`Country not found: ${error.config?.url}`);
    return null;
  })
  async getCountryByCode(@Path('code') code: string): Promise<Country | null> {
    return {} as Country;
  }

  // Search countries by name
  @Get('/v3.1/name/{name}')
  @OnSuccess(200, (data: Country[]) => {
    return data.map(c => ({
      name: c.name.common,
      code: c.cca2,
      capital: c.capital?.[0],
      region: c.region,
    }));
  })
  async searchCountriesByName(@Path('name') name: string): Promise<Partial<Country>[]> {
    return [];
  }

  // Filter countries by region
  @Get('/v3.1/region/{region}')
  async getCountriesByRegion(@Path('region') region: string): Promise<Country[]> {
    return [];
  }

}

const countryService = createApiService(CountryService, {
  baseUrl: 'https://restcountries.com',
  headers: {
    'Content-Type': 'application/json',
  },
  resilience: {
    retry: {
      retries: 3,
      retryDelay: 200,
      retryDelayMax: 2000,
      exponentialBackoff: true,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    },
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      window: 60000,
      timeout: 30000,
    },
  },
});

async function main() {
  try {
    console.log('=== Get All Countries (Simplified) ===');
    const countries = await countryService.getAllCountries();
    console.log(`Total countries: ${countries.length}`);
    console.log('Sample countries:', countries.slice(0, 3));

    console.log('\n=== Get Country by Code ===');
    const usa = await countryService.getCountryByCode('us');
    if (usa) {
      console.log('USA:', usa.name.common, '-', usa.capital[0]);
    }

    const invalid = await countryService.getCountryByCode('xx');
    if (!invalid) {
      console.log('Invalid code handled gracefully');
    }

    console.log('\n=== Search Countries by Name ===');
    const searchResults = await countryService.searchCountriesByName('united');
    console.log(`Found ${searchResults.length} countries matching "united"`);
    console.log('Results:', searchResults.slice(0, 5));

    console.log('\n=== Get Countries by Region ===');
    const europeanCountries = await countryService.getCountriesByRegion('europe');
    console.log(`European countries: ${europeanCountries.length}`);

    console.log('\n=== Get Multiple Countries ===');
    // Note: REST Countries v3.1 alpha endpoint with multiple codes can return 400
    // Using individual calls instead for reliability
    try {
      const us = await countryService.getCountryByCode('us');
      const gb = await countryService.getCountryByCode('gb');
      const ca = await countryService.getCountryByCode('ca');
      const multipleCountries = [us, gb, ca].filter(c => c !== null) as Country[];
      console.log('Multiple countries:', multipleCountries.map(c => c.name.common));
    } catch (error: any) {
      console.log('Note: Multiple codes endpoint may return 400. Using individual calls instead.');
      console.log('Countries: US, GB, CA');
    }

    console.log('\n=== Real-World Use Case: Find Countries by Currency ===');
    const allCountries = await countryService.getAllCountries();
    const euroCountries = allCountries.filter(c => c.currency === 'EUR');
    console.log(`Countries using EUR: ${euroCountries.length}`);
    console.log('Sample:', euroCountries.slice(0, 5).map(c => c.name));

    console.log('\n=== Real-World Use Case: Top 10 Most Populated Countries ===');
    const sortedByPopulation = allCountries
      .sort((a, b) => b.population - a.population)
      .slice(0, 10);
    console.log('Top 10:');
    sortedByPopulation.forEach((country, index) => {
      console.log(`${index + 1}. ${country.name}: ${country.population.toLocaleString()}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

export { CountryService, countryService };


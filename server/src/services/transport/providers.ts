import { TransportProvider, TransportSearchParams, TransportOption } from './types';
import { v4 as uuidv4 } from 'uuid';

export class FlightTransportProvider implements TransportProvider {
  mode: 'flight' = 'flight';
  
  async getOptions(params: TransportSearchParams): Promise<TransportOption[]> {
    // Generate a few local test flights
    const now = new Date(params.date + 'T00:00:00Z');
    
    // Create 2 mock options
    return [
      {
        id: uuidv4(),
        mode: this.mode,
        fare: 0, // Will be calculated by the engine
        comfortScore: 0, // Will be set by engine
        etaMin: params.durationMin,
        provider: 'local-test',
        providerDetails: {
          name: 'Yatra Setu Airlines',
          identifier: 'VA-101',
          departureTime: new Date(now.getTime() + 1000 * 60 * 60 * 8).toISOString(), // 8 AM
          arrivalTime: new Date(now.getTime() + 1000 * 60 * 60 * 8 + params.durationMin * 60000).toISOString()
        }
      },
      {
        id: uuidv4(),
        mode: this.mode,
        fare: 0,
        comfortScore: 0,
        etaMin: params.durationMin,
        provider: 'local-test',
        providerDetails: {
          name: 'Global Airways',
          identifier: 'GA-404',
          departureTime: new Date(now.getTime() + 1000 * 60 * 60 * 14).toISOString(), // 2 PM
          arrivalTime: new Date(now.getTime() + 1000 * 60 * 60 * 14 + params.durationMin * 60000).toISOString()
        }
      }
    ];
  }
}

export class BusTransportProvider implements TransportProvider {
  mode: 'bus' = 'bus';
  
  async getOptions(params: TransportSearchParams): Promise<TransportOption[]> {
    const now = new Date(params.date + 'T00:00:00Z');
    
    return [
      {
        id: uuidv4(),
        mode: this.mode,
        fare: 0,
        comfortScore: 0,
        etaMin: params.durationMin,
        provider: 'local-test',
        providerDetails: {
          name: 'Express Coach Lines',
          identifier: 'ECL-Morning',
          departureTime: new Date(now.getTime() + 1000 * 60 * 60 * 7).toISOString(), // 7 AM
          arrivalTime: new Date(now.getTime() + 1000 * 60 * 60 * 7 + params.durationMin * 60000).toISOString()
        }
      }
    ];
  }
}

export class AutoTransportProvider implements TransportProvider {
  mode: 'auto' = 'auto';
  
  async getOptions(params: TransportSearchParams): Promise<TransportOption[]> {
    const now = new Date(params.date + 'T00:00:00Z');
    
    return [
      {
        id: uuidv4(),
        mode: this.mode,
        fare: 0,
        comfortScore: 0,
        etaMin: params.durationMin,
        provider: 'local-test',
        providerDetails: {
          name: 'City Cabs',
          identifier: 'Sedan',
          departureTime: new Date(now.getTime() + 1000 * 60 * 60 * 9).toISOString(), // 9 AM
          arrivalTime: new Date(now.getTime() + 1000 * 60 * 60 * 9 + params.durationMin * 60000).toISOString()
        }
      },
      {
        id: uuidv4(),
        mode: this.mode,
        fare: 0,
        comfortScore: 0,
        etaMin: params.durationMin,
        provider: 'local-test',
        providerDetails: {
          name: 'City Cabs',
          identifier: 'SUV',
          departureTime: new Date(now.getTime() + 1000 * 60 * 60 * 10).toISOString(), // 10 AM
          arrivalTime: new Date(now.getTime() + 1000 * 60 * 60 * 10 + params.durationMin * 60000).toISOString()
        }
      }
    ];
  }
}

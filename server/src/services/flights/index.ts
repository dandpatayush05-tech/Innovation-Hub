import { LocalFlightProvider } from './providers/localFlightProvider';

// This is the seam where a real provider gets swapped in later with a one-line change.
export const flightProvider = new LocalFlightProvider();

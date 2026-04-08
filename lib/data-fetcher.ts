import Papa from 'papaparse';
import { Ticket } from '@/types';
import { 
  NCR_LOCATIONS, 
  BLR_LOCATIONS, 
  HYD_LOCATIONS, 
  CHENNAI_LOCATIONS 
} from './locations';

// Map specific raw locations to required City names
const getCityFromLocation = (location: string): string => {
  const loc = location.trim().toLowerCase();
  
  if (loc === 'delhi ncr' || NCR_LOCATIONS.some(branch => branch.toLowerCase() === loc)) {
    return 'Delhi NCR';
  }
  if (loc === 'bangalore' || BLR_LOCATIONS.some(branch => branch.toLowerCase() === loc)) {
    return 'Bangalore';
  }
  if (loc === 'hyderabad' || HYD_LOCATIONS.some(branch => branch.toLowerCase() === loc)) {
    return 'Hyderabad';
  }
  if (loc === 'chennai' || CHENNAI_LOCATIONS.some(branch => branch.toLowerCase() === loc)) {
    return 'Chennai';
  }
  
  return 'Others';
};

const parseAgeingToMinutes = (ageingStr: string): number => {
  if (!ageingStr) return 0;
  let minutes = 0;
  const daysMatch = ageingStr.match(/(\d+)d/);
  const hoursMatch = ageingStr.match(/(\d+)h/);
  const minsMatch = ageingStr.match(/(\d+)m/);

  if (daysMatch) minutes += parseInt(daysMatch[1]) * 24 * 60;
  if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
  if (minsMatch) minutes += parseInt(minsMatch[1]);
  
  return minutes;
};

export const fetchTickets = async (): Promise<Ticket[]> => {
  const url = 'https://docs.google.com/spreadsheets/d/1lA4SCfrmV_ZlN4MWjElnfF8RrA1lFMogl1i5o1j6JCE/export?format=csv';

  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        const mappedData: Ticket[] = data
          .filter(row => row.ID && row.ID !== '-') // basic validation
          .map(row => {
            const isResolved = row.Status?.toLowerCase() === 'closed';
            const location = row['Issue Location'] || 'Unknown';
            const city = getCityFromLocation(location);
            
            const rawSeverity = row.Severity?.trim();
            const severity = (rawSeverity === '-' || !rawSeverity) ? 'medium' : rawSeverity.toLowerCase();

            return {
              ID: row.ID,
              Title: row.Title || 'Unknown Issue',
              Category: row.Category || 'Other',
              Status: row.Status || 'Open',
              ReportedBy: row['Reported by'] || 'Unknown',
              IssueLocation: location,
              Severity: severity,
              CreatedOn: row['Created On'] || '',
              Ageing: row.Ageing || '',
              
              // Derived
              City: city,
              IsResolved: isResolved,
              ResolutionTimeMinutes: isResolved ? parseAgeingToMinutes(row.Ageing) : undefined,
              ResolvedDate: isResolved ? new Date().toISOString() : undefined // Mock for resolved
            };
        });

        resolve(mappedData);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};

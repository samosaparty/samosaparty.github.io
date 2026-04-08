export interface Ticket {
  ID: string;
  Title: string;
  Category: string; // "IT", "Repair and Maintenance"
  Status: string; // "Open", "Closed"
  ReportedBy: string;
  IssueLocation: string; // E.g., "sector 90", "BLR - DN"
  Severity: string; // "critical", "high", "medium", "low"
  CreatedOn: string;
  Ageing: string;

  // Derived fields
  City: string;         // Delhi NCR, Bangalore, Hyderabad, Chennai, Others
  ResolutionTimeMinutes?: number; 
  IsResolved: boolean;
  ResolvedDate?: string;
}

export interface CityData {
  city: string;
  total: number;
  it: number;
  maintenance: number;
  critical: number;
  resolved: number;
  open: number;
  slaBreached: number;
}

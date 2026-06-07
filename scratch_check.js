import fs from 'fs';
import Papa from 'papaparse';

const NCR_LOCATIONS = [
  'Sohna Road', 'Sushant Lok', 'Sector 56', 'Gurgaon Central Warehouse', 'Kitchen Gurgaon', 
  'Udyog Vihar Phase V', 'Raheja Square Mall', 'Sector 67', 'Sector 90', 'Sector- 73 Noida', 'Sector-73 Noida', 'Sector 73 Noida', 
  'Sector- 4 Noida', 'Sector-4 Noida', 'Sector 4 Noida', 'Raj Nagar', 'Crossing Republic', 'Indirapuram', 'Sector 10 Gurugram', 
  'Dwarka', 'Ashok Vihar', 'Rohini', 'Malviya Nagar', 'Janak Puri', 'Laxmi Nagar', 
  'Vasant Kunj', 'East Patel Nagar', 'Defence Colony', 'Faridabad SEC16', 'Sector 141', 
  'Sarita Vihar', 'Corporate Sale NCR', 'Alpha 2 Greater Noida', 'Dilshad Garden', 
  'Sector 4 Gurgaon', 'Gandhi Vihar', 'Uttam Nagar', 'Gaur City- Noida Extension', 
  'Training NCR', 'NCR - DN - Advant Tech Park',  'NCR - DN - Sector 120 Market', 'NCR - DN - Sector 120 Central Market', 'Tech NCR', 
  'NCR - DN- Janakpuri', 'NCR - DN - Star Tower', 'NCR - CK - Palam Vihar', 
  'NCR - CK - Sector 65', 'NCR - DN - Shalimar Bagh','NCR - DN- Shalimar Bag', 'NCR - DN - Golf Course Road', 
  'NCR - DN - Pacific Mall(Dwarka 21)','Central Warehouse Gurgaon','Central Kitchen Gurgaon','NCR-DN-Gaur city mall(Sector-4)', 'NCR - DN - Gaur City Mall(Sector 4)',
  'Training centre NCR', 'Udyog Vihar, Phase V'
];
const HYD_LOCATIONS = [
  'Hyderabad Central Warehouse', 'Pragathi Nagar Kukatpally', 'Dilshukh Nagar', 
  'AS Rao Nagar', 'Manikonda', 'Nacharam', 'Ameerpet', 'Madhapur', 'Kitchen Hyderabad', 
  'Aparna Mall', 'Kondapur', 'Mehdipatnam', 'Hyd - CK - Padmarao Nagar', 
  'HYD - DN - Sun City','Kukatpally', 'Tech HYD'
];
const CHENNAI_LOCATIONS = [
  'Chennai Central Warehouse', 'TN - DN - Guduvancherry', 'TN - CK - Karapakkam'
];
const BLR_LOCATIONS = [
  'Koramangala', 'Jeevan Bhima Nagar', 'HSR Layout', 'JP Nagar', 'Kalyan Nagar', 
  'Marathalli', 'Kitchen Bangalore', 'Whitefield', 'CBD', 'Bellandur', 
  'Sahakar Nagar', 'Bangalore Central Warehouse', 'Rajaji Nagar', 'Electronic City', 
  'Old Madras Road', 'Dommasandra', 'Nagarbhavi', 'RR Nagar', 'RT Nagar', 
  'Mahadevpura', 'Dasarahalli', 'Indiranagar 12B', 'Forum Mall', 'Technostar (AECS)', 
  'Bannerghatta', 'HSR Layout Sector 3', 'Murgeshpalya', 'Training', 'Varthur', 
  'ETV', 'Corporate Sales BLR', 'Hennur', 'Sarjapur', 'Yelahanka', 'Chandapura', 
  'Kanakpura Road', 'Begur', 'Royasandra', 'BLR - CK - Manyta Tech Park', 
  'Bagmane', 'Nexus Koramangala', 'Eco Space', 'Nexus Shantiniketan', 'EGL', 
  'Bagmane (CV Raman Nagar)', 'Kasavanahalli', 'TC Palya', 'Singasandra', 
  'New BEL Rd', 'Channasandra', 'Kanakapura Dine-In', 'Airport Road', 
  'Banashankari', 'Ananth Nagar', 'BLR - CK - Panathur', 
  'BLR - DN - Park Square Mall (ITPL)', 'BLR - DN - Kengeri', 'BLR - DN - Haralur', 
  'BLR - DN - Ayyappa Nagar', 'BLR - DN - Budigere', 'BLR - DN - Kaggadasapura', 
  'Tech BLR', 'BLR - DN - Bagalur', 'BLR - DN - Channapatna', 'BLR - DN - Airport T-1', 
  'BLR - DN - Ecoworld', 'BLR - DN - Galleria Mall', 'BLR - DN - Neo Town', 
  'BLR - DN - Royal Meenakshi Mall', 'Lift Maintenance'
];

function getState(location) {
  if (!location) return 'Other';
  const loc = location.trim().toLowerCase();
  if (NCR_LOCATIONS.some(l => l.toLowerCase() === loc)) return 'NCR';
  if (HYD_LOCATIONS.some(l => l.toLowerCase() === loc)) return 'HYD';
  if (CHENNAI_LOCATIONS.some(l => l.toLowerCase() === loc)) return 'CHENNAI';
  if (BLR_LOCATIONS.some(l => l.toLowerCase() === loc)) return 'BLR';
  return 'Other';
}

async function run() {
  const url = 'https://docs.google.com/spreadsheets/d/1lA4SCfrmV_ZlN4MWjElnfF8RrA1lFMogl1i5o1j6JCE/export?format=csv';
  const response = await fetch(url);
  const csvText = await response.text();
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  
  const rawData = result.data;
  console.log(`Total rows in CSV: ${rawData.length}`);

  const droppedRows = [];

  const groupedData = rawData.reduce((acc, row) => {
    let rawCategory = (row['Category'] || '').trim();
    let categoryLower = rawCategory.toLowerCase();
    
    let category;
    if (categoryLower === 'it') category = 'IT';
    else if (categoryLower === 'repair and maintenance' || categoryLower === 'maintenance') category = 'Maintenance';
    else if (categoryLower === 'marketing') category = 'Marketing';
    else {
      category = 'Other Data';
    }

    const state = getState(row['Issue Location']);
    
    let groupKey;
    if (category === 'Marketing') {
      groupKey = 'Marketing';
    } else if (category === 'Other Data') {
      groupKey = 'Other Data';
    } else {
      let finalState = state;
      if (state === 'HYD' && category === 'Maintenance') finalState = 'NCR';
      if (state === 'CHENNAI' && category === 'Maintenance') finalState = 'BLR';
      groupKey = `${finalState} - ${category}`;
    }
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(row);
    return acc;
  }, {});

  console.log(`Groups: ${Object.keys(groupedData)}`);
  
  // Find which ones went to 'Other Data'
  if (groupedData['Other Data']) {
    console.log(`\nRows in 'Other Data':`);
    groupedData['Other Data'].forEach(r => console.log(`- ${r.ID}: ${r.Title} (Category: ${r.Category})`));
  } else {
    console.log(`\nNo rows in 'Other Data'`);
  }

  // Find which ones went to 'Other - IT' or 'Other - Maintenance'
  console.log(`\nRows in 'Other - IT':`);
  if (groupedData['Other - IT']) {
    groupedData['Other - IT'].forEach(r => console.log(`- ${r.ID}: ${r.Title} (Location: ${r['Issue Location']})`));
  }

  console.log(`\nRows in 'Other - Maintenance':`);
  if (groupedData['Other - Maintenance']) {
    groupedData['Other - Maintenance'].forEach(r => console.log(`- ${r.ID}: ${r.Title} (Location: ${r['Issue Location']})`));
  }
}

run();

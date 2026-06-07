import React from 'react';
import Papa from 'papaparse';
import CategorySection from '../CategorySection';
import AutoRefresh from '@/components/AutoRefresh';

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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch data on the server component
async function getSheetData() {
  const url = 'https://docs.google.com/spreadsheets/d/1lA4SCfrmV_ZlN4MWjElnfF8RrA1lFMogl1i5o1j6JCE/export?format=csv';
  
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const csvText = await response.text();
  
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data;
}

export default async function StateWiseDashboard() {
  let rawData = [];
  try {
    rawData = await getSheetData();
  } catch (e) {
    return <div className="loading">Failed to load data.</div>;
  }

  // Filter and group data by State and Category
  const targetCategories = ['IT', 'Repair and Maintenance', 'Marketing'];
  
  const groupedData = rawData.reduce((acc, row) => {
    let rawCategory = (row['Category'] || '').trim();
    let categoryLower = rawCategory.toLowerCase();
    
    let category;
    if (categoryLower === 'it') category = 'IT';
    else if (categoryLower === 'repair and maintenance' || categoryLower === 'maintenance') category = 'Maintenance';
    else if (categoryLower === 'marketing') category = 'Marketing';
    else category = 'Other Data'; // Catch all unmapped categories

    const state = getState(row['Issue Location']);
    
    // For Other Data, group them all together.
    // For others, keep them state-wise.
    let groupKey;
    if (category === 'Marketing') {
      groupKey = 'Marketing';
    } else if (category === 'Other Data') {
      groupKey = 'Other Data';
    } else {
      let finalState = state;
      // Route HYD Maintenance to NCR Maintenance
      if (state === 'HYD' && category === 'Maintenance') {
        finalState = 'NCR';
      }
      // Route CHENNAI Maintenance to BLR Maintenance
      if (state === 'CHENNAI' && category === 'Maintenance') {
        finalState = 'BLR';
      }
      groupKey = `${finalState} - ${category}`;
    }
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(row);
    return acc;
  }, {});

  // Sort groups (e.g. BLR - IT, BLR - Maintenance, NCR - IT...)
  const groups = Object.keys(groupedData).sort();

  const isOpenAndOlderThan5Days = (row) => {
    const status = (row['Status'] || '').toLowerCase();
    if (!status.includes('open')) return false;

    const ageing = row['Ageing'] || '';
    const daysMatch = ageing.match(/(\d+)d/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      return days >= 5;
    }
    return false;
  };

  const totalIssuesCount = Object.values(groupedData).reduce((total, group) => total + group.length, 0);

  return (
    <div className="ticket-analyst-container">
      <AutoRefresh interval={15000} />
      <header className="ticket-analyst-header">
        <h1 className="ticket-analyst-title">State-Wise Operations Dashboard</h1>
        <p className="ticket-analyst-subtitle">
          Live Issue Tracking by State & Category
          <span style={{ 
            display: 'inline-block', 
            marginLeft: '12px', 
            background: 'rgba(37, 99, 235, 0.1)', 
            border: '1px solid rgba(37, 99, 235, 0.2)',
            color: 'var(--primary)', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontWeight: '700',
            fontSize: '0.85rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            Total Issues: {totalIssuesCount}
          </span>
        </p>
      </header>

      <main>
        {groups.length === 0 && <div style={{padding: '2rem', textAlign: 'center'}}>No data found for the selected states and categories.</div>}
        {groups.map((group) => {
          const groupData = groupedData[group];
          const oldIssuesCount = groupData.filter(isOpenAndOlderThan5Days).length;

          return (
            <CategorySection 
              key={group} 
              category={group} 
              categoryData={groupData} 
              oldIssuesCount={oldIssuesCount} 
            />
          );
        })}
      </main>
    </div>
  );
}

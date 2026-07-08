import Papa from 'papaparse';

export const fetchAnalystData = async () => {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1BzvGed5YLgv6PLX1opqhl6mHijUHxsEVhPkHDqVrMaQ/export?format=csv';
  
  try {
    const response = await fetch(sheetUrl, { cache: 'no-store' }); // Ensure fresh data
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically converts numbers/booleans
        complete: (results) => {
          // Clean the data: Format dates, handle missing values
          const cleanedData = results.data.map(row => {
            // Attempt to parse 'Publish time' or 'Date' as an actual Date object
            let dateVal = null;
            if (row['Publish time']) {
               const parsedDate = new Date(row['Publish time']);
               if (!isNaN(parsedDate)) dateVal = parsedDate;
            } else if (row['Date']) {
               const parsedDate = new Date(row['Date']);
               if (!isNaN(parsedDate)) dateVal = parsedDate;
            }

            return {
              ...row,
              _parsedDate: dateVal, // Store the Date object for easier filtering/sorting
              // Provide fallbacks for KPIs
              views: Number(row['Views']) || 0,
              likes: Number(row['Reactions']) || 0,
              comments: Number(row['Comments']) || 0,
              netFollows: Number(row['Net follows']) || 0,
              title: row['Title'] || 'Untitled',
              duration: row['Duration (sec)'] || 0
            };
          });
          resolve(cleanedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching or parsing Google Sheet:", error);
    throw error;
  }
};

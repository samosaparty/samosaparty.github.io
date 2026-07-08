const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/edit', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const matches = [...data.matchAll(/"([^"]+)","\[null,(\d+)\]/g)];
    matches.forEach(m => console.log(m[1] + " : " + m[2]));
  });
});

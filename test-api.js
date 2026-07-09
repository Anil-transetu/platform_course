const http = require('http');
const https = require('https');

https.get('https://lms-backend-n83k.onrender.com/api/v1/students?page=1&limit=10', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Keys:', Object.keys(parsed));
      if (parsed.pagination) console.log('Pagination:', parsed.pagination);
      if (parsed.meta) console.log('Meta:', parsed.meta);
      console.log('Total:', parsed.total);
      console.log('Total Records:', parsed.total_records);
      console.log('Total Students:', parsed.total_students);
    } catch (e) {
      console.log(data.substring(0, 200));
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

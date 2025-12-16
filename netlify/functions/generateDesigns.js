p    // netlify/functions/generateDesigns.js
exports.handler = async (event, context) => {
  // Handle CORS for browser requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { gender, age, image } = JSON.parse(event.body);
    if (!gender || !age || !image) {
      throw new Error('Missing required fields: gender, age, image');
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));



      // For real Gemini API integration (after setting environment variable)
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !=='AIzaSyBdzKh0rnwKGeDqDcdrfY1a-RCrEl4ndKA') {
  // Real Gemini API call
  const designs = await callRealGeminiAPI(apiKey, gender, age, image);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ success: true, designs: designs })
  };
} else {
  // Mock data fallback
  const designs = generateMockDesigns(gender, age);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ 
      success: true, 
      designs: designs,
      note: 'Using mock data. Set GEMINI_API_KEY in Netlify environment variables for real AI generation.'
    })
  };
}
    

// Generate sample base64 images (simple colored rectangles for demo)
function generateSampleImage(index) {
  const colors = [
    'E91E63', // Luxury Pink
    'D4AF37', // Gold
    '4CAF50', // Emerald
    '2196F3', // Royal Blue
    '9C27B0', // Purple
    'FF9800'  // Orange
  ];
  
  const color = colors[(index - 1) % colors.length];
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="600" fill="#${color}" opacity="0.8"/>
      <rect x="50" y="100" width="300" height="400" fill="#ffffff" opacity="0.9"/>
      <text x="200" y="320" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">
        Design ${index}
      </text>
      <text x="200" y="360" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">
        Pakistani Luxury Couture
      </text>
      <text x="200" y="550" font-family="Arial" font-size="14" fill="#888" text-anchor="middle">
        Upload real image for AI generation
      </text>
    </svg>
  `)}`;
        }

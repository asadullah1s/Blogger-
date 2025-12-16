    // netlify/functions/generateDesigns.js
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

    // Generate mock designs (replace with actual Gemini API call when key is available)
    const designs = generateMockDesigns(gender, age);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        designs: designs,
        note: 'Using mock data. Add your GEMINI_API_KEY to Netlify environment variables for real AI generation.'
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message
      })
    };
  }
};

// Enhanced mock data for demonstration
function generateMockDesigns(gender, age) {
  const ageGroup = age < 25 ? 'Youth' : age < 40 ? 'Contemporary' : 'Elegant';
  
  const baseDesigns = [
    {
      name: `Shahi Zardozi ${gender === 'male' ? 'Sherwani' : 'Lehenga'}`,
      features: [
        `Colors: Ruby Red & Gold`,
        `Fabric: Premium Velvet`,
        `Embroidery: Heavy Zardozi`,
        `Occasion: Wedding`,
        `Age Group: ${ageGroup}`,
        `Signature: Scalloped Dupatta`,
        `Pakistani Luxury Style`
      ],
      image: generateSampleImage(1)
    },
    {
      name: `Gul-e-Noor Lawn Collection`,
      features: [
        `Colors: Mint & Ivory`,
        `Fabric: Premium Lawn`,
        `Embroidery: Resham Floral`,
        `Occasion: Summer Festive`,
        `Age Group: ${ageGroup}`,
        `Signature: Painted Chikan`,
        `Traditional Embroidery`
      ],
      image: generateSampleImage(2)
    },
    {
      name: `${gender === 'male' ? 'Nawabi' : 'Noorani'} Chiffon Ensemble`,
      features: [
        `Colors: Blush Pink & Silver`,
        `Fabric: Chiffon`,
        `Embroidery: Sequins & Pearls`,
        `Occasion: Formal Event`,
        `Age Group: ${ageGroup}`,
        `Signature: Layered Border`,
        `Modern Pakistani Cut`
      ],
      image: generateSampleImage(3)
    },
    {
      name: `Khaddar Luxury ${gender === 'male' ? 'Suit' : 'Kurta'}`,
      features: [
        `Colors: Indigo & Copper`,
        `Fabric: Handwoven Khaddar`,
        `Embroidery: Gotta Patti`,
        `Occasion: Winter Festive`,
        `Age Group: ${ageGroup}`,
        `Signature: Angrakha Style`,
        `Artisanal Craftsmanship`
      ],
      image: generateSampleImage(4)
    },
    {
      name: `Jamawar Couture`,
      features: [
        `Colors: Emerald & Gold`,
        `Fabric: Jamawar`,
        `Embroidery: Kundan Stone`,
        `Occasion: ${gender === 'male' ? 'Groom Wear' : 'Bridal Function'}`,
        `Age Group: ${ageGroup}`,
        `Signature: Asymmetric Closure`,
        `Royal Pakistani Design`
      ],
      image: generateSampleImage(5)
    },
    {
      name: `Phulkari Festival Wear`,
      features: [
        `Colors: Sunshine Yellow`,
        `Fabric: Cotton Silk`,
        `Embroidery: Phulkari`,
        `Occasion: Eid Celebration`,
        `Age Group: ${ageGroup}`,
        `Signature: Mirror Work`,
        `Cultural Heritage Design`
      ],
      image: generateSampleImage(6)
    }
  ];

  return baseDesigns;
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

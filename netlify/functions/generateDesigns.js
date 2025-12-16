// netlify/functions/generateDesigns.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with API key from Netlify Environment Variables
// Netlify AI Gateway will automatically provide GEMINI_API_KEY and GOOGLE_GEMINI_BASE_URL[citation:3]
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // CRITICAL: AI Generation Prompt
    const prompt = `
**CRITICAL INSTRUCTIONS - READ CAREFULLY**

**BASE IMAGE ANALYSIS:** Analyze this uploaded clothing image. Understand its EXACT structure: outfit type (e.g., shalwar kameez, lehenga, sherwani), silhouette, sleeves, neckline, length, and fabric texture.

**GENERATION RULES - STRICTLY FOLLOW:**
1. **USE THE UPLOADED IMAGE AS THE SOLE BASE:** Generate new designs FROM THIS IMAGE ONLY. Do not use random templates or stock images.
2. **PRESERVE EXACT STRUCTURE:** Keep the outfit type, silhouette, and basic structure identical to the base image.
3. **MODIFY ONLY THESE ELEMENTS:**
   - Embroidery patterns (zardozi, gotta patti, mirror work, resham)
   - Color palette (luxury Pakistani colors: maroon, emerald, gold, ivory, blush pink)
   - Neckline detailing (only if applicable)
   - Sleeve edge designs
   - Border patterns (palla, ghera)
   - Fabric texture highlights
4. **CULTURAL CONTEXT:** Design must be PAKISTANI LUXURY COUTURE. Think brands like Elan, Maria B, Sana Safinaz. NO Western dresses. NO random outfits.
5. **AGE & GENDER APPROPRIATE:** For ${gender}, age ${age}. Designs should suit this demographic.

**OUTPUT REQUIREMENTS:**
- Generate 6 UNIQUE design variations.
- For each design, provide:
  A. A generated image (keeping base structure, modifying only allowed elements)
  B. A creative Pakistani luxury name (e.g., "Shahi Zardozi Lehenga", "Noorani Lawn Suit")
  C. An array of 5-7 features: [Color Palette, Fabric Type, Embroidery Style, Occasion, Key Design Elements]

**REMEMBER:** Base image structure is SACRED. Only modify embroidery, colors, patterns, borders.
`;

    // Initialize the model (Using a model that supports image generation)
    // Netlify AI Gateway supports 'gemini-2.5-flash-image-preview'[citation:3]
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview' 
    });

    // Prepare image for Gemini
    const imageParts = [{
      inlineData: {
        data: image,
        mimeType: 'image/png'
      }
    }];

    // Generate content
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const responseText = response.text();

    // Parse the AI response (in a real scenario, you would parse structured data)
    // For this example, we'll simulate the response with mock data
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
        aiResponse: responseText.substring(0, 500) // For debugging
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        note: 'Ensure GEMINI_API_KEY is set in Netlify environment variables[citation:3][citation:7]'
      })
    };
  }
};

// Mock data function for demonstration
// In production, this would be replaced with actual Gemini image generation
function generateMockDesigns(gender, age) {
  const baseDesigns = [
    {
      name: "Shahi Zardozi Ensemble",
      features: ["Colors: Ruby Red & Gold", "Fabric: Premium Velvet", "Embroidery: Heavy Zardozi", "Occasion: Wedding", "Signature: Scalloped Dupatta"]
    },
    {
      name: "Gul-e-Noor Lawn Collection",
      features: ["Colors: Mint & Ivory", "Fabric: Premium Lawn", "Embroidery: Resham Floral", "Occasion: Summer Festive", "Signature: Painted Chikan"]
    },
    {
      name: "Noorani Chiffon Saree",
      features: ["Colors: Blush Pink & Silver", "Fabric: Chiffon", "Embroidery: Sequins & Pearls", "Occasion: Formal Event", "Signature: Layered Border"]
    },
    {
      name: "Khaddar Luxury Suit",
      features: ["Colors: Indigo & Copper", "Fabric: Handwoven Khaddar", "Embroidery: Gotta Patti", "Occasion: Winter Festive", "Signature: Angrakha Style"]
    },
    {
      name: "Jamawar Sherwani",
      features: ["Colors: Emerald & Gold", "Fabric: Jamawar", "Embroidery: Kundan Stone", "Occasion: Groom Wear", "Signature: Asymmetric Closure"]
    },
    {
      name: "Phulkari Festival Wear",
      features: ["Colors: Sunshine Yellow", "Fabric: Cotton Silk", "Embroidery: Phulkari Embroidery", "Occasion: Eid Celebration", "Signature: Mirror Work"]
    }
  ];

  // Convert to base64 placeholder images (in reality, these would be from Gemini)
  return baseDesigns.map(design => ({
    ...design,
    image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // 1x1 transparent pixel
    closeups: []
  }));
                           }

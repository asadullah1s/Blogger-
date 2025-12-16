exports.handler = async (event) => {
  // Mock response for now - remove when adding real Gemini API
  const mockDesigns = [
    {
      name: "Royal Zardozi Ensemble",
      features: ["Ruby Red & Gold", "Premium Velvet", "Heavy Zardozi", "Wedding", "Scalloped Dupatta"],
      image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    }
  ];
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ designs: mockDesigns })
  };
};

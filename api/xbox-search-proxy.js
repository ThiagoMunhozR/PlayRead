// Vercel Edge Function para buscar Gamertag no OpenXBL
export default async function handler(req, res) {
  // Permite CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responde OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Só aceita GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { gamertag } = req.query;
    
    if (!gamertag) {
      res.status(400).json({ error: 'Gamertag é obrigatório' });
      return;
    }
    
    // Faz requisição para OpenXBL API (URL correta)
    const response = await fetch(`https://api.xbl.io/v2/search/${encodeURIComponent(gamertag)}`, {
      headers: {
        'X-Authorization': '5fad7ab3-efac-409c-95ec-978b4a2ecf2a',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenXBL API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Erro Xbox Search Proxy:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar gamertag Xbox',
      details: error.message 
    });
  }
}
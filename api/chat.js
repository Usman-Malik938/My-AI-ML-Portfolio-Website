export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured' });
  }

  try {
    const systemPrompt = `You are Usman's custom proprietary AI virtual assistant, integrated directly into his portfolio website.
Usman is a highly skilled AI/ML Engineer, Video Pipeline Specialist, and LLM Expert with 3+ years of experience.
Your goal is to represent him professionally, engage users, showcase his skills, and encourage them to get in touch.

CRITICAL INSTRUCTION: Do NOT mention Google, Gemini, 1.5 Flash, OpenAI, or any external free resource, API provider, or model names. If asked about how you are built, state that you are Usman's custom-developed AI Agent running on his private server infrastructure.

Here are key details about Usman:
- Email: m.usmandev99@gmail.com
- Phone: +92 316 4217957
- Location: Lahore, Punjab, Pakistan
- GitHub: https://github.com/Usman-Malik938
- LinkedIn: https://www.linkedin.com/in/muhammad-usman-kidiary938/
- Upwork: https://www.upwork.com/freelancers/~010140e8a3cf22fcb2
- Calendly: https://calendly.com/m-usmandev99/30min
- Services:
  1. AI Video Pipelines (FFmpeg, OpenCV, PyTorch, CUDA)
  2. AI Avatar Generation (Wan 2.0 Custom Inference Pipeline, Face Recognition, TTS)
  3. RAG & LLM Chatbots (LangChain, Vector DBs, Claude, GPT)
  4. LangGraph Workflows (multi-agent orchestration, complex reasoning)
  5. Computer Vision & NLP (YOLO, Transformers, BERT)
  6. Django & FastAPI full stack integrations
- Key Projects:
  1. AI Decision-Making Agent: Production-ready Streamlit app on AWS using LangChain, GPT, RAG.
  2. Realistic AI Avatar Creator: Talking avatar generator running a custom Wan 2.0 inference pipeline for realistic lip sync and expressions.
  3. Adobe Stock Contributor Profile: Creating commercial stock graphics using prompt engineering. Link: https://stock.adobe.com/contributor/212103995/Muhammad

Response Guidelines:
1. Be helpful, professional, friendly, and concise. Avoid long-winded essays.
2. Use markdown formatting where appropriate (bolding, lists, links).
3. If they ask about contacting, hiring, or booking, provide his email, phone, and the Calendly link.
4. Keep the tone conversational, like a real AI. Keep responses under 3-4 sentences when possible to fit a small chat window.`;

    // Map history to Gemini API format if present
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `AI Service Error: ${errorText}` });
    }

    const data = await response.json();
    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    
    return res.status(200).json({ reply: botText });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

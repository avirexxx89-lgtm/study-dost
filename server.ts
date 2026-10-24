import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

// Initialize Gemini SDK securely on server
let geminiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    geminiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini client initialization notice:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Study Dost AI',
    hasGeminiKey: !!apiKey && apiKey !== 'MY_GEMINI_API_KEY',
    timestamp: new Date().toISOString(),
  });
});

// AI Tutor server-side proxy route
app.post('/api/tutor', async (req: Request, res: Response) => {
  const { 
    message, 
    conversationHistory = [], 
    examName = 'Competitive Exam', 
    subject = 'General Studies / Science',
    language = 'en'
  } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (message.length > 3000) {
    return res.status(400).json({ error: 'Message is too long (maximum 3000 characters)' });
  }

  // Pre-configured curated responses for common competitive exam doubts (Zero-latency fallback)
  const lowerMsg = message.toLowerCase();
  
  // Try calling real Gemini API if available
  if (geminiClient) {
    try {
      const systemInstruction = `
You are "Study Dost AI", an expert, warm, and highly effective personal study tutor for Indian students preparing for exams like JEE, NEET, UPSC, SSC, Banking, and School Boards.
Student Language Preference: ${language === 'hi' ? 'Hindi (Devanagari) with standard English technical terms' : 'Clear English with occasional relatable Hindi exam terms (like Revision, Funda, Shortcuts)'}.
Current Target Exam: ${examName}.
Subject: ${subject}.

Guidelines:
1. Provide a crystal-clear, structured explanation with headings or bullet points.
2. If mathematical or scientific: state the core formula, definition, and a practical solved example.
3. For UPSC/SSC: give constitutional articles, historical facts, or speed-math shortcuts.
4. Always end with 2-3 brief suggested follow-up questions for the student.
5. Keep tone supportive, encouraging ("Dost/Friend" style), and exam-oriented.
`;

      const contents = [
        ...conversationHistory.slice(-4).map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.6,
        }
      });

      const replyText = response.text || 'I am ready to help you crack your exam! What concept should we break down next?';

      return res.json({
        success: true,
        text: replyText,
        modelUsed: 'gemini-2.5-flash',
        isFallback: false,
        suggestedFollowups: language === 'hi' ? [
          'इस पर एक विगत वर्ष का प्रश्न (PYQ) हल करें',
          'इसके मुख्य सूत्र और शॉर्टकट ट्रिक',
          '30 सेकंड में याद रखने का निमोनिक'
        ] : [
          'Solve a previous year question on this',
          'Key formulas & speed shortcuts',
          'Memory mnemonic to remember this'
        ]
      });
    } catch (apiError) {
      console.warn('Gemini API call failed, deploying smart study tutor fallback:', apiError);
      // Fall through to smart fallback
    }
  }

  // Smart Curated Fallback Tutor
  let fallbackReply = '';
  let followups: string[] = [];

  if (lowerMsg.includes('king') || lowerMsg.includes('definite') || lowerMsg.includes('integration') || lowerMsg.includes('समाकलन')) {
    fallbackReply = language === 'hi' 
      ? `### निश्चित समाकलन का 'King\'s Rule' (Properties of Definite Integrals)\n\n**नियम:**\n$$\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a + b - x)\\,dx$$\n\n**यह कब लागू होता है?**\nजब हर (denominator) में $f(x) + f(a+b-x)$ जैसा सममित पद हो। उदाहरण के लिए:\n$$\\int_{0}^{\\pi/2} \\frac{\\sin^n x}{\\sin^n x + \\cos^n x}\\,dx$$\n\nदोनों को जोड़ने पर $2I = \\int_{0}^{\\pi/2} 1\\,dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$ प्राप्त होता है!`
      : `### King's Rule in Definite Integration\n\n**The Fundamental Formula:**\n$$\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a + b - x)\\,dx$$\n\n**Where is it most useful in JEE?**\nWhenever you see cyclic or complementary terms in the numerator and denominator (e.g. $\\sin(x)$ and $\\cos(x)$ between $0$ and $\\pi/2$).\n\n**Standard Solved Trick:**\nFor $I = \\int_{0}^{\\pi/2} \\frac{\\sin^n x}{\\sin^n x + \\cos^n x}\\,dx$, applying King's rule yields an identical denominator with complementary numerator. Adding the two gives:\n$$2I = \\int_{0}^{\\pi/2} 1\\,dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}.$$`;
    followups = ['How to apply Leibniz Integral rule?', 'Symmetric integrals with modulus', 'Area under curves tips'];
  } else if (lowerMsg.includes('projectile') || lowerMsg.includes('प्रक्षेप्य') || lowerMsg.includes('kinematics')) {
    fallbackReply = language === 'hi'
      ? `### प्रक्षेप्य गति (Projectile Motion) - मुख्य सूत्र\n\n1. **उड्डयन काल (Time of Flight $T$):**\n   $$T = \\frac{2u \\sin\\theta}{g}$$\n2. **अधिकतम ऊंचाई (Max Height $H$):**\n   $$H = \\frac{u^2 \\sin^2\\theta}{2g}$$\n3. **क्षैतिज परास (Horizontal Range $R$):**\n   $$R = \\frac{u^2 \\sin 2\\theta}{g}$$\n\n**महत्वपूर्ण गोल्डन ट्रिक:**\nजब $\\theta = 45^\\circ$ होता है, तब $R_{\\text{max}} = 4H$ होता है! (JEE/NEET का पसंदीदा प्रश्न)`
      : `### Projectile Motion - High-Yield Formula Sheet\n\n1. **Time of Flight ($T$):**\n   $$T = \\frac{2u \\sin\\theta}{g}$$\n2. **Maximum Height ($H_{\\text{max}}$):**\n   $$H = \\frac{u^2 \\sin^2\\theta}{2g}$$\n3. **Horizontal Range ($R$):**\n   $$R = \\frac{u^2 \\sin 2\\theta}{g}$$\n\n**Golden JEE/NEET Relationship:**\nWhen $\\theta = 45^\\circ$, $R_{\\text{max}} = 4H_{\\text{max}}$. Also, the range is identical for complementary angles $\\theta$ and $(90^\\circ - \\theta)$.`;
    followups = ['Trajectory equation $y = x\\tan\\theta(1 - x/R)$', 'Projectile on an inclined plane', 'Velocity at apex'];
  } else if (lowerMsg.includes('lac operon') || lowerMsg.includes('dna') || lowerMsg.includes('genetics') || lowerMsg.includes('लैक')) {
    fallbackReply = language === 'hi'
      ? `### लैक ऑपेरॉन (Lac Operon) - NCERT क्विक रिवीजन\n\n- **प्रतिपादक:** फ्रांस्वा जैकब और जैक मोनोड (1961)\n- **नियामक जीन (i-gene):** दमनकारी (Repressor) प्रोटीन बनाता है।\n- **ऑपरेटर जीन (O):** जब रिप्रेशर इससे जुड़ता है, तो स्विच OFF हो जाता है।\n- **प्रेरक (Inducer):** लैक्टोज (Lactose) या एलोलैक्टोज। यह रिप्रेशर से जुड़कर उसे निष्क्रिय कर देता है, जिससे आरएनए पॉलिमरेज ट्रांसक्रिप्शन शुरू कर पाता है!\n- **संरचनात्मक जीन:** \n  - **z:** $\\beta$-गैलेक्टोसाइडेस\n  - **y:** पर्मिएज (Permease)\n  - **a:** ट्रांसएसिटाइलेज`
      : `### Lac Operon - Rapid NCERT Breakdown\n\n- **Discovered by:** Francois Jacob & Jacques Monod.\n- **Components:**\n  1. **i-gene (Regulatory):** Synthesizes active Repressor protein.\n  2. **Operator (O):** Physical gate where repressor binds.\n  3. **Inducer:** Lactose or Allolactose. It binds repressor, rendering it inactive.\n  4. **Structural genes (z, y, a):**\n     - **z** $\\rightarrow$ $\\beta$-galactosidase (hydrolyzes lactose into glucose + galactose)\n     - **y** $\\rightarrow$ Permease (increases cell permeability to $\\beta$-galactosides)\n     - **a** $\\rightarrow$ Transacetylase`;
    followups = ['Positive vs Negative gene regulation', 'Trp operon comparison', 'Meselson-Stahl experiment'];
  } else if (lowerMsg.includes('timetable') || lowerMsg.includes('schedule') || lowerMsg.includes('रिवीजन') || lowerMsg.includes('plan')) {
    fallbackReply = language === 'hi'
      ? `### आदर्श 30-दिवसीय रिवीज़न रणनीति (Scientific Spaced Repetition)\n\n1. **दिन 1-10: हाई-वेटेज अध्याय (High-Yield Chapters)**\n   - प्रतिदिन 2 घंटे थ्योरी + 3 घंटे विगत वर्षों के प्रश्न (PYQ)।\n   - कठिन प्रश्नों को तुरंत अपनी 'गलती डायरी' (Mistake Notebook) में दर्ज करें।\n2. **दिन 11-20: विषयवार मॉक टेस्ट**\n   - निर्धारित समय सीमा में टेस्ट दें।\n   - नेगेटिव मार्किंग से बचने के लिए तुक्केबाजी से बचें।\n3. **दिन 21-30: पूर्ण पाठ्यक्रम मॉडल पेपर्स (2026 Specimen)**\n   - वास्तविक परीक्षा समय (उदा. 9:00 AM से 12:00 PM) में टेस्ट दें।\n   - अंतिम सप्ताह केवल फॉर्मूला शीट और शॉर्ट नोट्स का त्वरित रिवीजन करें।`
      : `### High-Yield 30-Day Revision Blueprint\n\n1. **Phase 1 (Days 1–10): High-Yield Consolidation**\n   - 2 hours conceptual formula review + 3 hours timed PYQ practice.\n   - Tag every missed question into your 'Galti Diary'.\n2. **Phase 2 (Days 11–20): Chapter-wise Mock Sprints**\n   - Practice with negative marking penalty enabled.\n   - Review weak chapters using Spaced Repetition (Days 1, 3, 7).\n3. **Phase 3 (Days 21–30): Full-Length 2026 Model Papers**\n   - Simulate real exam environment (9:00 AM to 12:00 PM).\n   - Focus on error elimination and speed calibration.`;
    followups = ['How to overcome negative marking?', 'Tips to improve focus during 3-hour tests', 'Formula revision technique'];
  } else {
    fallbackReply = language === 'hi'
      ? `नमस्ते दोस्त! मैं आपका **Study Dost AI** हूँ।\n\nआपकी शंका: **"${message}"**\n\nयहाँ आपकी तैयारी के लिए मुख्य चरण हैं:\n1. **मूल सिद्धांत (Core Concept):** पहले अध्याय के बुनियादी नियमों और सूत्रों को दोहराएं।\n2. **विगत वर्ष प्रश्न (PYQ):** 2021 से 2025 तक के कम से कम 10 प्रामाणिक प्रश्न हल करें।\n3. **गलती डायरी:** जहाँ भी गणना या वैचारिक भूल हो, उसे तुरंत नोट करें।\n\nबताइए, क्या आप इस विषय के किसी खास सूत्र, शॉर्टकट या PYQ को समझना चाहते हैं?`
      : `Hello Friend! I am your **Study Dost AI** study buddy.\n\nRegarding your query on: **"${message}"**\n\nHere is the recommended study approach:\n1. **Core Concept Mastery:** Focus on first-principles understanding and key definitions.\n2. **PYQ Drilling:** Practice real previous year questions from 2021–2025 to gauge question patterns.\n3. **Error Analysis:** Log any recurring calculation or conceptual slips into your personal Galti Diary.\n\nWould you like me to break down specific formulas, step-by-step shortcuts, or sample questions on this topic?`;
    followups = [
      'Show me standard formulas for this',
      'Give me an exam-style question',
      'How to avoid negative marking on this topic'
    ];
  }

  return res.json({
    success: true,
    text: fallbackReply,
    modelUsed: 'Study Dost Intelligent Fallback Engine',
    isFallback: true,
    suggestedFollowups: followups,
  });
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study Dost AI Server running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();

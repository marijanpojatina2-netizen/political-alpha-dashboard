
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // 1. Sigurnosna provjera za Vercel Cron
  // U produkciji odkomentirajte ovo kako nitko drugi ne bi mogao triggerati slanje
  // if (req.headers['x-vercel-cron'] !== '1') {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const GEMINI_API_KEY = process.env.API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY; // Potrebno postaviti u Vercelu
  
  // UNESITE VAŠE EMAIL ADRESE OVDJE
  const RECIPIENTS = ["marijanpojatina2@gmail.com", "mokowski7@gmail.com"];

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Nedostaje RESEND_API_KEY u Environment Variables." });
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    // Generiranje HTML newslettera pomoću Gemini-ja
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Djeluj kao vrhunski kvantitativni analitičar. Generiraj elitni dnevni 'Political Alpha' newsletter na hrvatskom jeziku.
      Fokusiraj se na transakcije američkih dužnosnika u zadnjih 24h, korelacije s odborima i sumnjive aktivnosti.
      
      FORMATIRANJE: Vrati isključivo čisti HTML kod spreman za slanje putem emaila. 
      Koristi moderan dizajn (dark mode stil), tablice za transakcije i jasne sekcije. 
      Uključi sekcije: 🚨 HIGH-ALERT, 📊 PREGLED TRANSAKCIJA, 🔍 ANALIZA I 📰 VIJESTI.
      Ne koristi Markdown blokove (npr. \`\`\`html), samo čisti HTML.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const htmlContent = response.text;

    // Slanje emaila putem Resend API-ja
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Political Alpha <newsletter@resend.dev>', // Kasnije možete dodati svoju domenu
        to: RECIPIENTS,
        subject: `🚨 Political Alpha Report: ${new Date().toLocaleDateString('hr-HR')}`,
        html: htmlContent,
      })
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Resend Error: ${JSON.stringify(emailData)}`);
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Newsletter uspješno generiran i poslan na 2 adrese.",
      emailId: emailData.id
    });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

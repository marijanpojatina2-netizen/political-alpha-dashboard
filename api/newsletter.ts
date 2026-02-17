
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // if (req.headers['x-vercel-cron'] !== '1') {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const GEMINI_API_KEY = process.env.API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY; 
  
  // --- KONFIGURACIJA PRIMATELJA ---
  
  // 1. TEST MODE (Samo ti):
  const RECIPIENTS = ["marijanpojatina2@gmail.com"];
  
  // 2. PRODUKCIJA (Kad kažeš "kreni", zamijeni RECIPIENTS s ovim dolje):
  /*
  const RECIPIENTS = [
    "marijanpojatina2@gmail.com",
    "mokowski7@gmail.com",
    "email3@primjer.com", // Ovdje stavi treći mail
    "email4@primjer.com"  // Ovdje stavi četvrti mail
  ];
  */

  const SENDER_EMAIL = 'newsletter@kkdinamo.hr'; 

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Nedostaje RESEND_API_KEY." });
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const today = new Date().toLocaleDateString('hr-HR');

  // --- ANTI-REPETITION LOGIC ---
  // Svaki put kad se skripta pokrene, nasumično biramo fokus
  const sectors = ["Healthcare (Farmacija)", "Defense (Obrana)", "Energy (Nafta)", "Banking (Banke)", "Real Estate (Nekretnine)"];
  const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
  
  // Prisilna rotacija da izbjegnemo Nancy Pelosi svaki dan
  const forbidden = Math.random() > 0.5 ? "Nancy Pelosi i Nvidia (NVDA)" : "Mark Green i Microsoft (MSFT)";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Djeluj kao vrhunski kvantitativni analitičar. Generiraj 'Political Alpha' newsletter za datum: ${today}.
      
      ZADATAK:
      Generiraj HTML email izvještaj o trgovanju američkih kongresnika. 
      
      🚨 STROGA PRAVILA PROTIV PONAVLJANJA (ANTI-REPETITION):
      1. DANAS JE ZABRANJENO KORISTITI: ${forbidden}. Ignoriraj ih potpuno.
      2. Tvoj današnji FOKUS SEKTOR je: ${randomSector}. Pronađi sumnjive trejdove u tom sektoru.
      3. Želim vidjeti imena koja se rijetko spominju (npr. Tuberville, McCaul, Higgins, Peters).
      
      PRAVILA ZA SADRŽAJ:
      - Transakcije iz "High-Alert" MORAJU biti i u "Detaljnoj tablici".
      - Tablica mora imati SVE transakcije.
      
      DIZAJN:
      - HTML table layout, width="600", dark theme (#0f172a).
      - Inline CSS obavezan.
      
      STRUKTURA:
      1. ZAGLAVLJE: Naslov "POLITICAL ALPHA FORENSIC", Datum: ${today}.
      2. HIGH-ALERT (Barem 2 trejda):
         - Ime, Ticker, Iznos, Analiza.
      3. DETALJNA TABLICA (High-Alert + ostalo, min 8 redova).
      4. ZAKLJUČAK.

      Vrati SAMO čisti HTML kod.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const htmlContent = response.text;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `Political Alpha <${SENDER_EMAIL}>`, 
        to: RECIPIENTS,
        reply_to: "marijanpojatina2@gmail.com",
        subject: `🚨 Political Alpha: Detaljni Forenzički Izvještaj (${today})`,
        html: htmlContent,
      })
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) throw new Error(`Resend Error: ${JSON.stringify(emailData)}`);

    return res.status(200).json({ success: true, emailId: emailData.id });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

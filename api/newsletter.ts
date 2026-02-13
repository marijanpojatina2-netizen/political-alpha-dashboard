
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // 1. Sigurnosna provjera za Vercel Cron
  // U produkciji odkomentirajte ovo kako nitko drugi ne bi mogao triggerati slanje
  // if (req.headers['x-vercel-cron'] !== '1') {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const GEMINI_API_KEY = process.env.API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY; 
  
  // Lista primatelja
  const RECIPIENTS = ["marijanpojatina2@gmail.com", "mokowski7@gmail.com"]; 

  // --- KONFIGURACIJA POŠILJATELJA ---
  // Koristimo vašu verificiranu domenu
  const SENDER_EMAIL = 'newsletter@kkdinamo.hr'; 
  // ----------------------------------

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Nedostaje RESEND_API_KEY u Environment Variables." });
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    // Generiranje HTML newslettera pomoću Gemini-ja
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Djeluj kao vrhunski kvantitativni analitičar. Generiraj opširan i detaljan dnevni 'Political Alpha' newsletter na hrvatskom jeziku.
      
      ZADATAK:
      Generiraj HTML email izvještaj o trgovanju američkih kongresnika. 
      
      BITNO PRAVILO O PODACIMA (STRIKTNO):
      Transakcije koje navedeš u sekciji "High-Alert" MORAŠ TAKOĐER navesti u sekciji "Detaljna tablica".
      Glavna tablica mora sadržavati SVE transakcije iz izvještaja (High-Alert + sve ostale). Ne smije biti transakcije koja je samo u High-Alertu, a nema je u tablici.
      
      PRAVILA ZA DIZAJN (EMAIL COMPATIBILITY):
      1. Koristi HTML <table> strukturu za layout.
      2. Glavni container width="600" centriran.
      3. Pozadina: #0f172a (tamna). Tekst: #e2e8f0.
      4. Svi stilovi MORAJU biti inline (style="...").
      
      STRUKTURA:

      1. ZAGLAVLJE: Naslov "POLITICAL ALPHA FORENSIC", Datum.

      2. 🚨 HIGH-ALERT ANALIZA (Barem 2 najsumnjivija trejda):
         - Svaki trejd u svom boxu (border-left: 4px solid #f43f5e).
         - Velikim slovima ime političara (npr. NANCY PELOSI).
         - Jasno vidljiv Ticker, Tip (BUY/SELL) i Iznos.
         - Analiza zašto je sumnjivo.

      3. 📊 DETALJNA TABLICA SVIH TRANSAKCIJA (Obuhvaća High-Alert + ostalo):
         - Tablica mora imati width="100%".
         - Zaglavlje (TH) s tamnijom pozadinom (#1e293b).
         - STUPCI (Ovaj redoslijed je obavezan):
           1. POLITIČAR (Ime Prezime, Stranka).
           2. ODBOR (Committee).
           3. TICKER.
           4. TIP (BUY/SELL) - Oboji tekst (Zeleno/Crveno).
           5. IZNOS.
           6. DATUM.
         - U tablici navedi minimalno 8 transakcija. 
         - PRVE DVIJE u tablici moraju biti iste one iz High-Alert sekcije.

      4. 🔍 ZAKLJUČAK TRŽIŠTA.

      PODACI:
      Koristi realistične simulirane podatke za zadnjih 24-48h. Fokus na Tech (NVDA, MSFT), Defense (LMT, RTX) i Energy (XOM).
      
      Vrati SAMO čisti HTML kod.`,
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
        from: `Political Alpha <${SENDER_EMAIL}>`, 
        to: RECIPIENTS,
        subject: `🚨 Political Alpha: Detaljni Forenzički Izvještaj (${new Date().toLocaleDateString('hr-HR')})`,
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
      message: "Newsletter uspješno generiran i poslan.",
      emailId: emailData.id
    });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

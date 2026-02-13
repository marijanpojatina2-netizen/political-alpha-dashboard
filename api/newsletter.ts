
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // 1. Sigurnosna provjera za Vercel Cron
  // U produkciji odkomentirajte ovo kako nitko drugi ne bi mogao triggerati slanje
  // if (req.headers['x-vercel-cron'] !== '1') {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const GEMINI_API_KEY = process.env.API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY; 
  
  // BITNO: Na besplatnom Resend računu (bez vlastite domene) možete slati SAMO na svoju email adresu.
  const RECIPIENTS = ["marijanpojatina2@gmail.com"]; 

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
      Generiraj HTML email izvještaj o trgovanju američkih kongresnika. Podaci moraju biti jasno vidljivi, široki i detaljni.
      
      PRAVILA ZA DIZAJN (EMAIL COMPATIBILITY):
      1. Koristi HTML <table> strukturu za layout (ne divove).
      2. Glavni container mora biti width="600" (standard za email) ali centriran.
      3. Pozadina: #0f172a (tamna). Tekst: #e2e8f0 (svijetli).
      4. Svi stilovi MORAJU biti inline (style="...").
      
      SADRŽAJ I STRUKTURA:

      1. ZAGLAVLJE:
         - Naslov "POLITICAL ALPHA FORENSIC" (Velika slova, Emerald Green #10b981).
         - Datum izvještaja.

      2. 🚨 HIGH-ALERT ANALIZA (Barem 2 najsumnjivija trejda):
         - Dizajn: Svaki High-Alert trejd mora biti u svom odvojenom boxu s tamnijom pozadinom (#1e293b) i crvenim obrubom lijevo.
         - OBAVEZNO PRIKAŽI SLJEDEĆE PODATKE VELIKIM FONTOM:
           - Ime Političara (npr. Nancy Pelosi) - FONT SIZE 18px, BOLD, BIJELO.
           - Pozicija (npr. Speaker Emerita).
           - Ticker Simbol (npr. NVDA) i Tip (BUY/SELL) - jasno istaknuto bojama.
           - Iznos transakcije.
           - DETALJNA ANALIZA: 2-3 rečenice zašto je ovo sumnjivo (timing, vijesti, odbor).

      3. 📊 DETALJNA TABLICA SVIH TRANSAKCIJA (Jako bitno!):
         - Tablica mora imati 100% širine.
         - Zaglavlje tablice mora imati pozadinu #334155.
         - STUPCI MORAJU BITI:
           1. POLITIČAR (Ime i stranka) - ovo mora biti najširi stupac.
           2. ODBOR (Committee) - bitno za kontekst.
           3. TICKER (Simbol dionice).
           4. TIP (Kupnja/Prodaja) - Oboji tekst (Zeleno za Buy, Crveno za Sell).
           5. VRIJEDNOST ($).
           6. DATUM.
         - Generiraj barem 5-8 realističnih transakcija u ovoj tablici kako bi izvještaj izgledao bogato. Nemoj skraćivati tablicu.

      4. 🔍 FORENZIČKI ZAKLJUČAK:
         - Kratki tekstualni sažetak o tome koji sektori su danas popularni među političarima (npr. "Vidimo rotaciju iz Tech sektora u Energiju...").

      PODACI:
      Koristi simulirane, ali visoko realistične podatke temeljene na stvarnim poznatim trgovcima (Pelosi, Tuberville, Crenshaw, Marjorie Taylor Greene) ako nemaš pristup live podacima u ovom trenutku. Fokusiraj se na Tech, Defense i Energy sektore.

      Vrati SAMO čisti HTML kod spreman za slanje. Bez markdown oznaka.`,
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
        from: 'Political Alpha <onboarding@resend.dev>', 
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
      message: "Newsletter uspješno generiran i poslan (Test Mode).",
      emailId: emailData.id
    });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

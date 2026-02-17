
import { GoogleGenAI, Type } from "@google/genai";
import { TradeType } from "../types";

export const generatePoliticalAlphaReport = async () => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Nedostaje API_KEY! Provjeri .env datoteku ili postavke projekta.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Djeluj kao vrhunski kvantitativni analitičar i forenzički istražitelj financijskih tržišta.
    Tvoj zadatak je generirati elitni izvještaj o transakcijama dužnosnika SAD-a u zadnjih 24 sata.
    
    STRUKTURA KOJU MORAŠ SLIJEDITI:
    1. HIGH-ALERT TRADES: Izdvoji samo trejdove s najvećim potencijalom sukoba interesa.
       - Za svaki napiši: Tko (ime i pozicija), Što (ticker i dionica), Iznos, ZAŠTO je sumnjivo.
       - OBAVEZNO: Dodaj "transactionCode" (npr. TX-88291) i "date" (točan datum transakcije YYYY-MM-DD).
       - OBAVEZNO: Dodaj polje "fundamentalAnalysis" s analizom izgleda te dionice.
    
    2. SVEEBUHVATNI PREGLED (fullTable):
       - Uključi SVE transakcije (Capitol Hill, White House) u zadnjih 24h.
       - Svaka mora imati: Politician, Role, Committee, Ticker, Type, Value, NewsConnection, Date, TransactionCode.
    
    Vrati podatke u JSON formatu:
    {
      "highAlertTrades": [
        {
          "politician": "Ime Prezime",
          "role": "Senator (R-TX)",
          "committee": "Odbor za energetiku",
          "ticker": "XOM",
          "type": "KUPNJA",
          "value": "$50,001 - $100,000",
          "transactionCode": "SEC-99120",
          "date": "2024-05-20",
          "suspicionLevel": "HIGH",
          "whySuspicious": "Kupovina netom prije objave novih bušotina.",
          "newsConnection": "Vijesti o Exxonu od jučer.",
          "fundamentalAnalysis": "Analiza P/E ratio-a i energetskog tržišta."
        }
      ],
      "fullTable": [...],
      "conflictAnalysis": "Esej o trendovima.",
      "newsRecap": "Sažetak vijesti.",
      "sectorTrends": [{"name": "Energy", "value": 30}]
    }

    Jezik: Hrvatski.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Nema odgovora od modela");
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Greška pri generiranju izvještaja:", error);
    throw error;
  }
};

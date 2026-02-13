
import React, { useState, useEffect, useCallback } from 'react';
import { generatePoliticalAlphaReport } from './services/geminiService';
import { TradeTable } from './components/TradeTable';
import { SectorChart } from './components/SectorChart';
import { NewsletterReport, TradeType } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [report, setReport] = useState<NewsletterReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generatePoliticalAlphaReport();
      setReport(data);
    } catch (err) {
      setError("Neuspjelo dohvaćanje podataka. Provjerite mrežnu vezu.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTestEmail = async () => {
    if (!confirm("Želite li generirati i poslati probni newsletter na admin email?")) return;
    
    setSendingEmail(true);
    try {
      const res = await fetch('/api/newsletter');
      const data = await res.json();
      if (data.success) {
        alert("Newsletter uspješno poslan! Provjerite inbox.");
      } else {
        alert("Greška: " + JSON.stringify(data));
      }
    } catch (e: any) {
      alert("Greška pri slanju: " + e.message);
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-emerald-500/30">
      <header className="sticky top-0 z-50 glass-card border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <i className="fas fa-shield-halved text-slate-900 text-xl"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tighter uppercase italic">
              Political <span className="text-emerald-400">Alpha</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Forensic Markets Investigation</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs text-slate-500 uppercase font-bold">Vercel Cron Status</span>
            <span className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SCHEDULED: 07:00 AM UTC
            </span>
          </div>
          
          <button 
            onClick={handleTestEmail}
            disabled={sendingEmail}
            className="hidden md:flex bg-slate-800/50 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-all items-center gap-2 text-xs font-mono disabled:opacity-50"
            title="Pošalji testni email odmah"
          >
            <i className={`fas fa-paper-plane ${sendingEmail ? 'animate-bounce' : ''}`}></i>
            {sendingEmail ? 'SLANJE...' : 'TEST EMAIL'}
          </button>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 transition-all flex items-center gap-2 text-sm disabled:opacity-50 active:scale-95"
          >
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
            Osvježi
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {loading && !report ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] glass-card rounded-2xl">
                <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-mono text-xs tracking-widest animate-pulse">POKRETANJE DUBOKE FORENZIČKE ANALIZE...</p>
              </div>
            ) : report ? (
              <>
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                      </span>
                      <h2 className="text-2xl font-black uppercase tracking-tight italic">🚨 High-Alert Trades</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {report.highAlertTrades.map((trade, idx) => (
                      <div key={idx} className="glass-card rounded-xl border-l-4 border-l-rose-500 group hover:bg-slate-800/40 transition-all overflow-hidden shadow-xl">
                        <div className="p-6">
                          {/* Header: Politician & Instrument */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-2xl text-slate-100">{trade.politician}</h3>
                                <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-2 py-1 rounded border border-rose-500/30 tracking-widest uppercase">CRVENI ALARM</span>
                              </div>
                              <p className="text-sm font-medium text-slate-400">{trade.role} • <span className="text-slate-500">{trade.committee}</span></p>
                              <div className="flex gap-4 mt-2">
                                <span className="text-[10px] font-mono text-emerald-400">DATUM: {trade.date}</span>
                                <span className="text-[10px] font-mono text-slate-500">ID: {trade.transactionCode}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-emerald-400 font-black text-3xl tracking-tighter">{trade.ticker}</span>
                              <div className="flex items-center justify-end gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trade.type === TradeType.BUY ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {trade.type}
                                </span>
                                <span className="text-xs text-slate-300 font-mono font-bold">{trade.value}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Main Analysis Block */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/50">
                              <div className="flex items-center gap-2 mb-3">
                                <i className="fas fa-search-dollar text-rose-500"></i>
                                <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">ZAŠTO JE SUMNJIVO</h4>
                              </div>
                              <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                                {trade.whySuspicious}
                              </p>
                            </div>

                            <div className="bg-emerald-500/5 p-5 rounded-xl border border-emerald-500/10">
                              <div className="flex items-center gap-2 mb-3">
                                <i className="fas fa-chart-line text-emerald-500"></i>
                                <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">ANALIZA DIONICE</h4>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed italic">
                                {trade.fundamentalAnalysis || "Analiza u tijeku..."}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] font-mono">
                            <span className="text-slate-500 italic">Kontekst: {trade.newsConnection}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <i className="fas fa-list-ul text-emerald-400"></i>
                    <h2 className="text-2xl font-black uppercase tracking-tight italic">📊 Detaljni Pregled Transakcija</h2>
                  </div>
                  <TradeTable trades={report.fullTable} />
                </section>
              </>
            ) : null}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <section className="glass-card rounded-2xl p-6 border-emerald-500/20 border shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <i className="fas fa-envelope-open-text text-emerald-400"></i>
                <h3 className="text-lg font-bold uppercase italic tracking-tight">Alpha Newsletter</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Automatizirani izvještaj o insider trgovanju stiže svakog jutra u 08:00 AM UTC.
              </p>
              
              {subscribed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
                  <i className="fas fa-check-circle text-emerald-400 text-2xl mb-2"></i>
                  <p className="text-emerald-400 font-bold text-sm uppercase">Pretplaćeni ste!</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input 
                    type="email" 
                    required
                    placeholder="vas@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-slate-200"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm italic active:scale-95"
                  >
                    Aktiviraj Alpha Signale
                  </button>
                </form>
              )}
            </section>

            {report && (
              <>
                <section className="glass-card rounded-2xl p-6 shadow-md">
                  <h3 className="text-lg font-bold uppercase mb-4 text-emerald-400 border-b border-slate-700 pb-2 italic">🔍 Trendovi Sektora</h3>
                  <SectorChart data={report.sectorTrends} />
                  <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fas fa-brain text-emerald-500"></i>
                      Konflikt Analiza
                    </h4>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      {report.conflictAnalysis}
                    </p>
                  </div>
                </section>

                <section className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold uppercase mb-4 text-emerald-400 border-b border-slate-700 pb-2 italic">📰 Recap Vijesti</h3>
                  <div className="space-y-4">
                    {report.newsRecap.split('\n').filter(line => line.trim()).map((news, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="mt-1.5 w-1 h-1 bg-emerald-500 rounded-full shrink-0 group-hover:scale-125 transition-all"></div>
                        <p className="text-xs text-slate-400 leading-snug group-hover:text-slate-200 transition-colors">{news}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            <div className="text-center p-4 border border-slate-800 rounded-2xl bg-slate-900/20">
              <p className="text-[10px] text-slate-600 font-mono tracking-tighter">
                SYSTEM_STATUS: <span className="text-emerald-500">ONLINE</span> • 1.2.6_ELITE
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-800 py-10 text-center">
        <p className="text-[10px] text-slate-600 uppercase font-mono tracking-widest">
          © 2024 Political Alpha Forensic • Powered by Gemini 3 Pro
        </p>
      </footer>
    </div>
  );
};

export default App;

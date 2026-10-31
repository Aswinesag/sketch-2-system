import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, Cpu, Code, Layers, Sparkles, Loader2, 
  Database, Server, Check, Copy, Terminal, FileText,
  Trash2, ArrowUpRight, Zap, Shield, CheckCircle2,
  Box, AlertCircle
} from 'lucide-react';

const QUICK_STACKS = [
  'FastAPI',
  'PostgreSQL',
  'Redis Cache',
  'JWT Auth',
  'Docker',
  'Kafka / Events',
];

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeCodeFile, setActiveCodeFile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const appendStackTag = (tag) => {
    setRequirements((prev) => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev}, ${tag}` : tag;
    });
  };

  const copyToClipboard = (text, key = 'global') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload an architecture sketch image!');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirements', requirements);

    try {
      const res = await axios.post('http://localhost:8000/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      let parsedData = res.data.analysis;
      if (typeof parsedData === 'string') {
        const cleaned = parsedData.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleaned);
      }
      setResult(parsedData);
      setActiveTab('summary');
      
      // Auto-select first code file if available
      const codeFiles = parsedData.starterCode?.files 
        ? Object.keys(parsedData.starterCode.files) 
        : typeof parsedData.starterCode === 'object' && !Array.isArray(parsedData.starterCode)
          ? Object.keys(parsedData.starterCode)
          : [];
      if (codeFiles.length > 0) {
        setActiveCodeFile(codeFiles[0]);
      }
    } catch (err) {
      console.error(err);
      alert('Generation failed. Ensure backend is running and Gemini API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  // Safe data extraction helpers
  const getDatabaseSchemaText = () => {
    if (!result?.databaseSchema) return '-- No database schema generated';
    if (Array.isArray(result.databaseSchema?.definitions)) {
      return result.databaseSchema.definitions.join('\n\n');
    }
    if (Array.isArray(result.databaseSchema)) {
      return result.databaseSchema.join('\n\n');
    }
    if (typeof result.databaseSchema === 'string') {
      return result.databaseSchema;
    }
    return JSON.stringify(result.databaseSchema, null, 2);
  };

  const getStarterCodeFiles = () => {
    if (!result?.starterCode) return {};
    if (result.starterCode.files && typeof result.starterCode.files === 'object') {
      return result.starterCode.files;
    }
    if (typeof result.starterCode === 'object' && !Array.isArray(result.starterCode)) {
      return result.starterCode;
    }
    if (typeof result.starterCode === 'string') {
      return { 'main.py': result.starterCode };
    }
    return {};
  };

  const codeFiles = getStarterCodeFiles();
  const fileKeys = Object.keys(codeFiles);
  const currentFile = activeCodeFile && codeFiles[activeCodeFile] 
    ? activeCodeFile 
    : fileKeys[0] || 'main.py';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden">
      
      {/* Background Ambient Glow & Mesh (Developer Tool Finish) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(6,182,212,0.14),rgba(2,6,23,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Edge-to-Edge SaaS Header */}
      <header className="border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 w-full transition-all">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-cyan-500/10 p-2.5 border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              SKETCH<span className="text-cyan-400">2</span>SYSTEM
            </h1>
            <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-medium">
              v1.0 SaaS
            </span>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400 font-mono">
              <span className="text-slate-500">engine:</span>
              <span className="text-slate-300">Gemma 4 Multimodal</span>
            </div>
          </div>
        </div>

        {/* Status Indicators & Metrics */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20"></span>
            <span className="font-medium text-emerald-400">AI Core Online</span>
          </div>
          <div className="text-xs text-slate-400 hidden xl:inline font-mono">
            System UI
          </div>
        </div>
      </header>

      {/* Main Workspace - 100% Fluid Edge-to-Edge Grid (4-col vs 8-col) */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 items-start relative z-10">
        
        {/* Left Column: Input Controller (4 Cols, Sticky on Desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-20">
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl shadow-black/40 hover:border-slate-700/80 transition-colors">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  Blueprint Controller
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supply handwritten sketch or diagram
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                INPUT
              </span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Diagram Upload Section */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5 text-cyan-400" /> 1. Architecture Diagram
                  </span>
                  {preview && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  )}
                </label>
                
                <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 text-center cursor-pointer relative bg-slate-950/60 hover:bg-slate-950/90 transition-all group overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  
                  {preview ? (
                    <div className="relative group">
                      <img 
                        src={preview} 
                        alt="Sketch preview" 
                        className="max-h-48 w-full rounded-lg object-contain bg-slate-900/60 border border-slate-800" 
                      />
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-cyan-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Ready to analyze • Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3 py-3">
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-200">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          Drop diagram or whiteboard sketch
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          PNG, JPG, WEBP, SVG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Engineering Constraints & Quick Chips */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-3.5 w-3.5 text-cyan-400" /> 2. Constraints & Stack
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Optional</span>
                </label>

                {/* Quick Stack Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {QUICK_STACKS.map((stack) => (
                    <button
                      key={stack}
                      type="button"
                      onClick={() => appendStackTag(stack)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700/70 hover:border-cyan-500/30 transition-all cursor-pointer"
                    >
                      +{stack}
                    </button>
                  ))}
                </div>

                <textarea
                  rows="4"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. FastAPI backend, PostgreSQL database, JWT Auth, sub-second latency, Redis state cache..."
                  className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition text-sm resize-none shadow-inner font-sans"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-400 hover:from-cyan-300 hover:via-cyan-400 hover:to-teal-300 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-slate-950" />
                    <span className="text-sm tracking-wide font-bold">Synthesizing Architecture...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-slate-950" />
                    <span className="text-sm tracking-wide font-bold">Generate Full Blueprint</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Architecture Highlights Card */}
          <div className="hidden lg:flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>Production-ready microservices & DDL specs</span>
            </div>
            <Zap className="h-3.5 w-3.5 text-cyan-400/80" />
          </div>
        </div>

        {/* Right Column: Structured SaaS Output Dashboard (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/70 border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-xl min-h-[640px]">
          
          {/* Dashboard Tab Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800/90 bg-slate-950/70 backdrop-blur-sm">
            <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-1">
              {[
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'services', label: `Microservices (${result?.services?.length || 0})`, icon: Server },
                { id: 'database', label: 'Database Schema', icon: Database },
                { id: 'code', label: `FastAPI Code (${fileKeys.length || 1})`, icon: Code },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.12)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Export / Clipboard Action */}
            {result && (
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'export-json')}
                className="flex items-center space-x-1.5 text-xs bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-700/80 transition-all font-medium cursor-pointer shadow-sm"
              >
                {copiedKey === 'export-json' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">JSON Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Export JSON</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tab Content Display Viewport */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto max-h-[calc(100vh-14rem)] min-h-[500px] bg-slate-950/50">
            
            {/* Empty State */}
            {!result && !loading && (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center p-8 space-y-4 text-slate-500">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                  <Layers className="h-10 w-10 text-cyan-400/60 animate-pulse" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <p className="font-semibold text-slate-200 text-base">
                    Workspace Awaiting System Sketch
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload an architecture diagram or whiteboard photo on the left, then click Generate to synthesize microservices, database schemas, and FastAPI boilerplate.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    Topology Extraction
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    DDL Generation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    Boilerplate Code
                  </span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center space-y-4 p-8">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <Sparkles className="h-5 w-5 text-cyan-400 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-200">
                    Gemma 4 Multimodal Reasoning in Progress...
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm font-mono">
                    Detecting nodes, data pipelines, schema entities, and scaffolding backend endpoints.
                  </p>
                </div>
              </div>
            )}

            {/* Generated Results Area */}
            {result && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Tab 1: Architecture Summary */}
                {activeTab === 'summary' && (
                  <div className="space-y-5">
                    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" /> Executive System Topology
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          {result.services?.length || 0} Microservices Detected
                        </span>
                      </div>
                      <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                        {result.architectureSummary}
                      </div>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
                        <Box className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-[10px] uppercase font-mono text-slate-500">Total Services</div>
                          <div className="text-sm font-bold text-slate-100">{result.services?.length || 0} Active</div>
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
                        <Database className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-[10px] uppercase font-mono text-slate-500">Database Dialect</div>
                          <div className="text-sm font-bold text-slate-100">PostgreSQL DDL</div>
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
                        <Code className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-[10px] uppercase font-mono text-slate-500">API Framework</div>
                          <div className="text-sm font-bold text-slate-100">FastAPI 0.115+</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Microservices Grid */}
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-mono">
                        Identified architectural components and microservice roles:
                      </p>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/60">
                        {result.services?.length || 0} NODES
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.services?.map((svc, idx) => (
                        <div 
                          key={idx} 
                          className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/80">
                                NODE #{String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded">
                                REST / Event
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white font-mono tracking-wide mb-1.5 group-hover:text-cyan-300 transition-colors">
                              {svc.name}
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                              {svc.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Database Schema (IDE Terminal Window Frame) */}
                {activeTab === 'database' && (
                  <div className="space-y-3">
                    <div className="border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
                      
                      {/* Window Header */}
                      <div className="flex items-center justify-between bg-slate-900/90 px-4 py-3 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-rose-500/70"></div>
                          <div className="h-3 w-3 rounded-full bg-amber-500/70"></div>
                          <div className="h-3 w-3 rounded-full bg-emerald-500/70"></div>
                          <span className="text-xs font-mono text-slate-300 font-medium ml-2 flex items-center gap-1.5">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            postgresql_schema.sql
                          </span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(getDatabaseSchemaText(), 'sql-copy')}
                          className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-1.5 transition cursor-pointer font-medium"
                        >
                          {copiedKey === 'sql-copy' ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied SQL</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-400" />
                              <span>Copy SQL</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* SQL Code Viewport */}
                      <pre className="p-5 font-mono text-xs text-cyan-300 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-cyan-500/30 selection:text-white bg-slate-950/90">
                        {getDatabaseSchemaText()}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tab 4: Starter Code Files (IDE Style) */}
                {activeTab === 'code' && (
                  <div className="space-y-4">
                    {/* File Tabs Switcher if multiple files */}
                    {fileKeys.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {fileKeys.map((fname) => (
                          <button
                            key={fname}
                            onClick={() => setActiveCodeFile(fname)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-2 cursor-pointer ${
                              currentFile === fname
                                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            <Code className="h-3.5 w-3.5" />
                            {fname}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Code Container */}
                    <div className="border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
                      <div className="flex items-center justify-between bg-slate-900/90 px-4 py-3 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-rose-500/70"></div>
                          <div className="h-3 w-3 rounded-full bg-amber-500/70"></div>
                          <div className="h-3 w-3 rounded-full bg-emerald-500/70"></div>
                          <span className="text-xs font-mono font-semibold text-cyan-300 flex items-center gap-2 ml-2">
                            <Code className="h-4 w-4 text-cyan-400" /> {currentFile}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded">
                            Python 3.12 / FastAPI
                          </span>
                          <button
                            onClick={() => copyToClipboard(codeFiles[currentFile] || '', `code-${currentFile}`)}
                            className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-1.5 transition cursor-pointer font-medium"
                          >
                            {copiedKey === `code-${currentFile}` ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied Code</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-cyan-500/30 selection:text-white bg-slate-950/90">
                        {codeFiles[currentFile] || '# No code generated yet'}
                      </pre>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Download, 
  AlertCircle, 
  Stethoscope,
  Activity,
  MapPin,
  RefreshCw,
  Phone,
  Navigation,
  Share2,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_BASE = VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL;

const EMERGENCY_PHRASES = [
  'heavy bleeding',
  'severe bleeding',
  'bleeding heavily',
  'unconscious',
  'fainted',
  'seizure',
  'difficulty breathing',
  'cannot breathe',
  "can't breathe",
  'chest pain',
  'severe abdominal pain',
  'extreme stomach pain',
  'baby not moving',
  'no fetal movement',
  'water broke',
  'water has broken',
  'bahut bleeding',
  'zyada bleeding',
  'saans nahi aa rahi',
  'behosh',
  'tez pet dard'
];

const SUPPORTED_LANGUAGES = [
  { name: 'English', nativeName: 'English', code: 'en-IN' },
  { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN' },
  { name: 'Haryanvi', nativeName: 'हरियाणवी', code: 'hi-IN' },
  { name: 'Bengali', nativeName: 'বাংলা', code: 'bn-IN' },
  { name: 'Telugu', nativeName: 'తెలుగు', code: 'te-IN' },
  { name: 'Marathi', nativeName: 'मराठी', code: 'mr-IN' },
  { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta-IN' },
  { name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu-IN' },
  { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn-IN' },
  { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml-IN' },
  { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa-IN' },
  { name: 'Urdu', nativeName: 'اردو', code: 'ur-IN' },
  { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', code: 'or-IN' }
];

const DashboardPage = ({ report, vitals }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!report) {
      navigate('/assess');
    }
  }, [report, navigate]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage.code;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
  const completeTranscript = Array.from(event.results)
    .map((result) => result[0].transcript)
    .join(' ')
    .trim();

  setQuery(completeTranscript);
};

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'not-allowed') {
        alert('Microphone permission was denied. Please allow microphone access in browser settings.');
      } else if (event.error !== 'aborted') {
        alert(`Voice recognition failed: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert('Voice output is not supported by this browser.');
      return;
    }

    stopSpeaking();

    const cleanText = String(text)
      .replace(/[#*_`>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLanguage.code;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const matchingVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase() === selectedLanguage.code.toLowerCase());

    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const detectEmergency = (message) => {
    const normalizedMessage = message.toLowerCase().trim();
    return EMERGENCY_PHRASES.find((phrase) => normalizedMessage.includes(phrase));
  };

  const getCurrentLocation = () => {
    if (userLocation) return Promise.resolve(userLocation);

    if (!navigator.geolocation) {
      alert('Location access is not supported by this browser.');
      return Promise.reject(new Error('Geolocation is not supported'));
    }

    setLocationLoading(true);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          setUserLocation(location);
          setLocationLoading(false);
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationLoading(false);
          alert('Location could not be accessed. Please allow location permission in your browser.');
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const findNearbyHospital = async () => {
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const query = encodeURIComponent(`emergency hospital near ${latitude},${longitude}`);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        '_blank',
        'noopener,noreferrer'
      );
    } catch {
      // Permission/error feedback is handled in getCurrentLocation.
    }
  };

  const shareEmergencyLocation = async () => {
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const shareText = `Emergency: I may need urgent medical assistance. My current location is ${locationUrl}`;

      if (navigator.share) {
        await navigator.share({
          title: 'PregaCare Emergency Location',
          text: shareText
        });
        return;
      }

      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Emergency location sharing error:', error);
      }
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    const currentQuery = query.trim();
    if (!currentQuery || !report) return;

    const detectedEmergency = detectEmergency(currentQuery);
    if (detectedEmergency) {
      setEmergencyReason(detectedEmergency);
      setShowEmergency(true);
    }

    const userMsg = { role: 'user', content: currentQuery };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');
    setChatLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        user_query: currentQuery,
        assessment_report: report,
        chat_history: chatHistory,
        response_language: selectedLanguage.name
      });
      if (res.data.is_emergency === true) {
        setEmergencyReason(
          res.data.emergency_reason ||
          'Your message may describe a medical emergency.'
        );
        setShowEmergency(true);
      }
      const assistantResponse = res.data.response;
      setChatHistory(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      speakText(assistantResponse);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: "Unable to connect to the AI assistant. If this is an emergency, call 112 or 108 immediately."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const downloadPDF = async () => {
  if (chatLoading) {
    alert("Please wait for the AI response before exporting the report.");
    return;
  }

  setPdfLoading(true);

  try {
    const response = await axios.post(
      `${API_BASE}/export-pdf`,
      {
        report,
        vitals,
        chat_history: chatHistory
      },
      {
        responseType: 'blob'
      }
    );

    const pdfBlob = new Blob(
      [response.data],
      { type: 'application/pdf' }
    );

    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'PregaCare_Report.pdf');

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("PDF export error:", err);

    alert(
      "Failed to generate PDF. Please ensure the backend is running and try again."
    );
  } finally {
    setPdfLoading(false);
  }
};

  if (!report) return null;

  return (
    <>
    <AnimatePresence>
      {showEmergency && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="bg-rose-600 px-6 py-5 text-white">
              <button
                type="button"
                onClick={() => setShowEmergency(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/15 hover:text-white"
                aria-label="Close emergency alert"
              >
                <X size={22} />
              </button>

              <div className="flex items-center gap-3 pr-10">
                <div className="rounded-2xl bg-white/15 p-3">
                  <AlertCircle size={30} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-100">
                    Urgent warning
                  </p>
                  <h2 id="emergency-title" className="text-2xl font-black">
                    Possible Medical Emergency
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-relaxed text-rose-900">
                Your message may describe an urgent pregnancy-related symptom
                {emergencyReason ? ` (${emergencyReason})` : ''}. Do not wait for an AI response if immediate help is needed.
              </div>

              <p className="text-sm font-medium text-slate-600">
                Contact emergency services or go to the nearest emergency department. This alert is not a medical diagnosis.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3.5 font-bold text-white hover:bg-rose-700"
                >
                  <Phone size={19} />
                  Call 112
                </a>

                <a
                  href="tel:108"
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 px-4 py-3.5 font-bold text-rose-700 hover:bg-rose-50"
                >
                  <Phone size={19} />
                  Call Ambulance 108
                </a>

                <button
                  type="button"
                  onClick={findNearbyHospital}
                  disabled={locationLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {locationLoading ? <RefreshCw className="animate-spin" size={19} /> : <Navigation size={19} />}
                  Nearby Hospital
                </button>

                <button
                  type="button"
                  onClick={shareEmergencyLocation}
                  disabled={locationLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {locationLoading ? <RefreshCw className="animate-spin" size={19} /> : <Share2 size={19} />}
                  Share Location
                </button>
              </div>

              {userLocation && (
                <p className="text-center text-xs font-semibold text-emerald-600">
                  Current location permission received.
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowEmergency(false)}
                className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50"
              >
                Close and continue to assistant
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Analytics Column */}
      <div className="lg:col-span-5 space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 bg-gradient-to-br from-white to-indigo-50/30"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-xl text-slate-800">Risk Assessment</h3>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
              report.risk_band.includes('Low') ? 'bg-emerald-100 text-emerald-700' :
              report.risk_band.includes('Mid') ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {report.risk_band}
            </div>
          </div>
          
          <div className="flex flex-col items-center mb-10">
             <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Circular Progress (SVG) */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={553}
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * report.combined_score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={
                      report.risk_band.includes('Low') ? 'text-emerald-500' :
                      report.risk_band.includes('Mid') ? 'text-amber-500' :
                      'text-rose-500'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-800">{report.combined_score}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">PregaCare Index</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-indigo-600 mb-1">
                <Activity size={16} />
                <span className="text-2xl font-black">{report.individual_health_score}</span>
              </div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Health Index</div>
            </div>
            <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                <MapPin size={16} />
                <span className="text-2xl font-black">{Math.round(report.regional_safety_index * 100)}</span>
              </div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Safety Index</div>
            </div>
          </div>

          <div className="mt-8 p-5 bg-white/80 rounded-2xl border border-slate-100 flex gap-4">
            <AlertCircle className="shrink-0 text-indigo-500" size={24} />
            <p className="text-sm leading-relaxed text-slate-600 font-medium">{report.suggested_action}</p>
          </div>

          <button
            onClick={downloadPDF}
            className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
            disabled={pdfLoading || chatLoading}
          >
            {pdfLoading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                <Download size={20} />
                Export Medical Report (PDF)
              </>
            )}
          </button>
        </motion.div>

        {/* Location Info */}
        <div className="glass-card p-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Analysis Location</p>
                <h4 className="font-bold text-slate-700">{report.location}</h4>
              </div>
           </div>
           <button 
            onClick={() => navigate('/assess')}
            className="text-xs font-bold text-indigo-600 hover:underline"
           >
            Change
           </button>
        </div>
      </div>

      {/* Chat Column */}
      <div className="lg:col-span-7 h-[calc(100vh-280px)] min-h-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card h-full flex flex-col overflow-hidden bg-white"
        >
          <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Stethoscope size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">AI Clinical Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personalized Insights Live</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Languages size={17} className="hidden text-indigo-500 sm:block" />
              <select
                value={selectedLanguage.name}
                onChange={(event) => {
                  const language = SUPPORTED_LANGUAGES.find(
                    (item) => item.name === event.target.value
                  );

                  if (language) {
                    setSelectedLanguage(language);
                  }
                }}
              >
                {SUPPORTED_LANGUAGES.map((language) => (
                  <option key={language.name} value={language.name}>
                    {language.nativeName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setChatHistory([]);
                }}
                className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                title="Clear Chat"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-3xl flex items-center justify-center mb-6">
                  <MessageSquare size={40} />
                </div>
                <h4 className="font-bold text-slate-700 mb-2">How can I help you?</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  I have analyzed your {report.risk_band} status. Ask me about your vitals, diet, or local healthcare steps.
                </p>
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-5 rounded-[24px] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none prose prose-slate prose-sm max-w-none'
                }`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {msg.role === 'assistant' && (
                    <div className="mt-3 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => (isSpeaking ? stopSpeaking() : speakText(msg.content))}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX size={15} />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 size={15} />
                            Listen
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-5 rounded-[24px] rounded-bl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChat} className="p-5 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your health question..."
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-28 text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={startVoiceInput}
                className={`absolute right-14 top-2 flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                  isListening
                    ? 'animate-pulse bg-rose-600 text-white'
                    : 'bg-white text-indigo-600 shadow-sm hover:bg-indigo-50'
                }`}
                title={isListening ? 'Stop listening' : `Speak in ${selectedLanguage.name}`}
                aria-label={isListening ? 'Stop listening' : `Speak in ${selectedLanguage.name}`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                type="submit"
                disabled={!query.trim() || chatLoading || isListening}
                className="absolute right-2 top-2 w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:grayscale"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
              AI companion is for guidance only. Always consult a doctor for medical emergencies.
            </p>
          </form>
        </motion.div>
      </div>

    </div>
    </>
  );
};

export default DashboardPage;

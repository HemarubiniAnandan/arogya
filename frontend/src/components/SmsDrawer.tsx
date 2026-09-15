import React, { useState, useEffect } from 'react';
import { X, MessageSquare, PhoneCall, Volume2, CheckCheck, RefreshCw, Send } from 'lucide-react';
import { storageService } from '../services/storageService';
import { SMSMessage, VoiceMessage } from '../types';

interface SmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsDrawer: React.FC<SmsDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sms' | 'voice'>('sms');
  const [smsList, setSmsList] = useState<SMSMessage[]>([]);
  const [voiceList, setVoiceList] = useState<VoiceMessage[]>([]);
  const [testPhone, setTestPhone] = useState('9822014589');
  const [testMsg, setTestMsg] = useState('Your appointment at PHC Morgaon is confirmed for tomorrow 10:00 AM.');

  useEffect(() => {
    const update = () => {
      setSmsList(storageService.getSMSLogs());
      setVoiceList(storageService.getVoiceLogs());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  if (!isOpen) return null;

  const handleSendTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMsg) return;
    storageService.dispatchSMS(testPhone, 'Patient', 'patient', testMsg, 'Appointment');
    setTestMsg('');
  };

  const handlePlayVoice = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === 'mr') utterance.lang = 'mr-IN';
      else if (lang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Voice alert: ${text}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Twilio & Voice Outbound Dispatcher</h3>
              <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Network Grid Adapter Active
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'sms'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            SMS Logs ({smsList.length})
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'voice'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Voice / IVR Reminders ({voiceList.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'sms' ? (
            smsList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No SMS dispatched yet. Book or confirm an appointment to see live automated notifications.
              </div>
            ) : (
              smsList.map((sms) => (
                <div
                  key={sms.id}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 hover:border-slate-300 transition"
                >
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-semibold text-slate-700">{sms.recipientName} ({sms.recipientPhone})</span>
                    <span className="font-mono text-[11px]">{sms.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-sans leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/70">
                    {sms.message}
                  </p>
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                      {sms.category}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCheck className="w-3.5 h-3.5" /> {sms.status}
                    </span>
                  </div>
                </div>
              ))
            )
          ) : (
            voiceList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Voice logs empty. Automated voice calls trigger for high-priority maternal and vaccination alerts.
              </div>
            ) : (
              voiceList.map((voice) => (
                <div
                  key={voice.id}
                  className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{voice.recipientName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{voice.timestamp}</span>
                  </div>
                  <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-amber-100">
                    {voice.text}
                  </p>
                  <div className="flex justify-between items-center pt-1">
                    <span className="uppercase text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      IVR • {voice.language}
                    </span>
                    <button
                      onClick={() => handlePlayVoice(voice.text, voice.language)}
                      className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Play Audio Simulation
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Fast Test Sender */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleSendTestSms} className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">Quick Test SMS Simulation</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mobile number"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                className="w-1/3 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-emerald-600"
              />
              <input
                type="text"
                placeholder="Message text"
                value={testMsg}
                onChange={e => setTestMsg(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-emerald-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
              >
                <Send className="w-3 h-3" /> Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

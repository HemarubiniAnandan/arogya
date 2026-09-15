import React, { useState } from 'react';
import { X, Mic, MicOff, Check, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import { abhaService } from '../services/mockAdapters';
import { Patient, UserRole } from '../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (patient: Patient) => void;
  creatorRole?: UserRole;
  creatorName?: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
  creatorRole = 'patient',
  creatorName = 'Self'
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isListening, setIsListening] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [dob, setDob] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [aadhaarRaw, setAadhaarRaw] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [isGeneratingAbha, setIsGeneratingAbha] = useState(false);

  // Address
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [village, setVillage] = useState('Morgaon');
  const [pincode, setPincode] = useState('412304');

  // Medical History
  const [chronicConditions, setChronicConditions] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [currentMedications, setCurrentMedications] = useState<string>('');

  // Emergency & Guardian
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');

  // Credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Auto-calculate age whenever DOB changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCalculatedAge(Math.max(0, age));
    } else {
      setCalculatedAge('');
    }
  };

  // Voice Input Simulator / Web Speech API for rural users
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (!isListening) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'mr-IN'; // Default to Marathi
          recognition.interimResults = false;
          recognition.onstart = () => setIsListening(true);
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAddress(prev => prev ? `${prev}, ${transcript}` : transcript);
            setIsListening(false);
          };
          recognition.onerror = () => {
            setIsListening(false);
            setAddress(prev => prev ? `${prev}, गावठाण वस्ती, हनुमान मंदिराशेजारी` : 'गावठाण वस्ती, हनुमान मंदिराशेजारी, बारामती रस्ता');
          };
          recognition.onend = () => setIsListening(false);
          recognition.start();
        } catch {
          setIsListening(false);
          setAddress('गावठाण वस्ती, हनुमान मंदिराशेजारी, बारामती रस्ता');
        }
      } else {
        setIsListening(false);
      }
    } else {
      // Fallback simulation for browsers without Web Speech
      setIsListening(true);
      setTimeout(() => {
        setAddress('Gavthan Vasti, Near Hanuman Mandir, Morgaon');
        setIsListening(false);
      }, 1200);
    }
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
    storageService.dispatchSMS(phone, fullName || 'Citizen', 'patient', `Your AarogyaRakshak registration OTP is 123456. Valid for 10 minutes.`, 'OTP');
  };

  const handleVerifyOtp = () => {
    if (otp === '123456' || otp.length === 6) {
      setOtpVerified(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid OTP. Use demo OTP 123456.');
    }
  };

  const handleCreateAbha = async () => {
    setIsGeneratingAbha(true);
    const last4 = aadhaarRaw ? aadhaarRaw.replace(/\D/g, '').slice(-4) : '4491';
    const res = await abhaService.generateAbhaCard({ fullName, dob, phone });
    setAbhaId(res.abhaId);
    setIsGeneratingAbha(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setErrorMsg('Please enter patient full name and phone number.');
      return;
    }
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const last4 = aadhaarRaw ? aadhaarRaw.replace(/\D/g, '').slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
    const maskedAadhaar = `XXXX-XXXX-${last4}`;
    const finalAbha = abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${last4}`;
    const patId = `PAT-MH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient: Patient = {
      id: patId,
      fullName,
      phone,
      dob: dob || '1990-01-01',
      age: typeof calculatedAge === 'number' ? calculatedAge : 34,
      gender,
      aadhaarMasked: maskedAadhaar,
      abhaId: finalAbha,
      guardianName: guardianName || undefined,
      guardianContact: guardianContact || undefined,
      address: address || 'Main Road, Morgaon Village',
      state,
      district,
      village,
      pincode,
      chronicConditions: chronicConditions ? chronicConditions.split(',').map(s => s.trim()) : [],
      allergies: allergies ? allergies.split(',').map(s => s.trim()) : [],
      currentMedications: currentMedications ? currentMedications.split(',').map(s => s.trim()) : [],
      emergencyContact: {
        name: emergencyName || 'Family Member',
        phone: emergencyPhone || phone,
        relation: emergencyRelation || 'Relative'
      },
      consent: {
        allowAshaAssistance: true,
        allowRecordSharing: true,
        allowReferralSharing: true,
        allowTeleconsultSharing: true
      },
      registeredViaAshaId: creatorRole === 'asha' ? 'ASHA-MH-PN-042' : undefined
    };

    storageService.addPatient(newPatient, creatorName, creatorRole as UserRole);
    onRegistered(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              {creatorRole === 'asha' ? 'ASHA Assisted Registration' : 'New Citizen Health Account'}
            </span>
            <h3 className="text-lg font-bold">AarogyaRakshak Patient Registration & ABHA Link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step indicator */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-2.5 text-center border-b-2 ${step === 1 ? 'border-emerald-700 text-emerald-800 bg-white font-bold' : 'border-transparent text-slate-500'}`}
          >
            1. Personal & Identity (ABHA)
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex-1 py-2.5 text-center border-b-2 ${step === 2 ? 'border-emerald-700 text-emerald-800 bg-white font-bold' : 'border-transparent text-slate-500'}`}
          >
            2. Address & Voice Input
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex-1 py-2.5 text-center border-b-2 ${step === 3 ? 'border-emerald-700 text-emerald-800 bg-white font-bold' : 'border-transparent text-slate-500'}`}
          >
            3. Medical History & Contact
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-800">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sunita Dattatray Shinde"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Mobile & OTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (with OTP) *</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                  {!otpVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3.5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-medium hover:bg-emerald-800"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  ) : (
                    <span className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                {otpSent && !otpVerified && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP (e.g. 123456)"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      className="w-48 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              {/* DOB & Auto Age calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={handleDobChange}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calculated Age (Years)</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Auto-calculated from DOB"
                    value={calculatedAge !== '' ? `${calculatedAge} years` : ''}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold"
                  />
                </div>
              </div>

              {/* Aadhaar (Masked) & ABHA */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Aadhaar Number (Securely Masked)</label>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-600" /> Masked in compliance with UIDAI
                    </span>
                  </div>
                  <input
                    type="password"
                    maxLength={12}
                    placeholder="Enter 12-digit Aadhaar (stored masked)"
                    value={aadhaarRaw}
                    onChange={e => setAadhaarRaw(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ABHA ID (Ayushman Bharat Health Account)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 91-4412-8819-2041"
                      value={abhaId}
                      onChange={e => setAbhaId(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCreateAbha}
                      disabled={isGeneratingAbha}
                      className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      {isGeneratingAbha ? 'Linking...' : 'Create / Link ABHA'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Detailed Address</label>
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                      isListening
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-emerald-600" />}
                    {isListening ? 'Listening (Speak in Marathi/Hindi)...' : 'Address using Voice Input'}
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="House number, landmark, lane, or use voice input button"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    readOnly
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Satara">Satara</option>
                    <option value="Solapur">Solapur</option>
                    <option value="Ahmednagar">Ahmednagar</option>
                    <option value="Kolhapur">Kolhapur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Town / City</label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Guardian / Caregiver Details (If Minor or Elderly)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sanjay Patil"
                      value={guardianName}
                      onChange={e => setGuardianName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Guardian Contact</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Guardian mobile"
                      value={guardianContact}
                      onChange={e => setGuardianContact(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chronic Medical Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma (comma separated)"
                  value={chronicConditions}
                  onChange={e => setChronicConditions(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa drugs, Dust"
                    value={allergies}
                    onChange={e => setAllergies(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications</label>
                  <input
                    type="text"
                    placeholder="e.g. Metformin 500mg, IFA tablets"
                    value={currentMedications}
                    onChange={e => setCurrentMedications(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Contact name"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Relation (e.g. Spouse)"
                      value={emergencyRelation}
                      onChange={e => setEmergencyRelation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Enter account password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 shadow-xs"
              >
                Continue to Step {step + 1}
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-800 text-white text-sm font-bold hover:bg-emerald-900 shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Complete Registration & Link ABHA
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

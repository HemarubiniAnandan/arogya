export interface NLPTriageResult {
  suggestedDepartment: string;
  secondaryDepartment?: string;
  confidence: number;
  explanation: string;
  isEmergencyAlert: boolean;
  emergencyNotice?: string;
  recommendedKeywords: string[];
}

interface SpecialtyRule {
  department: string;
  secondaryDepartment?: string;
  keywords: string[];
  explanation: string;
  isEmergency?: boolean;
  emergencyKeywords?: string[];
}

const RULES: SpecialtyRule[] = [
  {
    department: 'Cardiology',
    secondaryDepartment: 'General Medicine',
    keywords: [
      'chest pain', 'heart', 'palpitation', 'angina', 'left arm pain', 'crushing chest',
      'छातीत दुखत', 'छातीत कळ', 'हृदय', 'सीने में दर्द', 'दिल', 'घबराहट'
    ],
    explanation: 'Based on mentioned chest discomfort or heart-related symptoms, Cardiology or General Medicine is recommended for immediate evaluation.',
    isEmergency: true,
    emergencyKeywords: ['severe chest', 'crushing', 'breathing difficulty', 'sweating', 'फित', 'दम लागणे', 'सांस फूलना']
  },
  {
    department: 'General Medicine',
    secondaryDepartment: 'Infectious Diseases',
    keywords: [
      'fever', 'chills', 'cold', 'cough', 'headache', 'body pain', 'fatigue', 'weakness', 'vomiting', 'dizziness',
      'ताप', 'थंडी', 'खोकला', 'डोकेदुखी', 'अंगदुखी', 'उलटी', 'चक्कर', 'बुखार', 'सिरदर्द', 'कमजोरी'
    ],
    explanation: 'General constitutional symptoms such as fever, cough, body pain or weakness are best initially evaluated by a General Physician.',
    isEmergency: false
  },
  {
    department: 'Obstetrics & Gynecology',
    secondaryDepartment: 'Maternal Health',
    keywords: [
      'pregnancy', 'pregnant', 'maternal', 'bleeding', 'period', 'menstrual', 'labor', 'trimester', 'fetal', 'delivery',
      'गरोदर', 'बाळंतपण', 'मासिक पाळी', 'रक्तस्त्राव', 'पोटात कळा', 'गर्भवती', 'प्रसव'
    ],
    explanation: 'Reproductive health, pregnancy check-ups, and maternal concerns are managed by Obstetrics & Gynecology.',
    isEmergency: false,
    emergencyKeywords: ['heavy bleeding', 'severe abdominal labor', 'unbearable pain', 'जास्त रक्तस्त्राव']
  },
  {
    department: 'Pediatrics',
    secondaryDepartment: 'General Medicine',
    keywords: [
      'child', 'baby', 'infant', 'toddler', 'kid', 'newborn', 'vaccine for child', 'childhood fever',
      'बाळ', 'लहान मूल', 'शिशू', 'बच्चा', 'शिशु', 'बालरोग'
    ],
    explanation: 'Medical concerns, immunizations, and growth monitoring for children under 14 years are handled by Pediatrics.',
    isEmergency: false
  },
  {
    department: 'Orthopedics',
    secondaryDepartment: 'Physiotherapy',
    keywords: [
      'fracture', 'bone', 'joint', 'knee', 'back pain', 'spine', 'shoulder', 'sprain', 'swelling leg',
      'हाड', 'सांधेदुखी', 'गुडघेदुखी', 'कंबरदुखी', 'हाड मोडणे', 'हड्डी', 'जोड़ों में दर्द', 'पीठ दर्द'
    ],
    explanation: 'Bone fractures, joint pain, ligament injuries, or chronic backaches are evaluated by the Orthopedics department.',
    isEmergency: false
  },
  {
    department: 'Dermatology',
    secondaryDepartment: 'General Medicine',
    keywords: [
      'skin', 'rash', 'itching', 'allergy', 'boil', 'eczema', 'ringworm', 'fungal', 'patches',
      'त्वचा', 'खाज', 'पुरळ', 'फोड', 'गजकर्ण', 'खुजली', 'चकत्ते', 'दाद'
    ],
    explanation: 'Skin eruptions, persistent itching, rashes, or epidermal infections fall under Dermatology.',
    isEmergency: false
  },
  {
    department: 'Ophthalmology',
    secondaryDepartment: 'General Medicine',
    keywords: [
      'eye', 'vision', 'blur', 'cataract', 'redness eye', 'tearing', 'burning eyes',
      'डोळा', 'दृष्टी', 'मोतीबिंदू', 'डोळे लाल', 'आँख', 'धुंधला', 'आंखों में जलन'
    ],
    explanation: 'Vision issues, cataract concerns, eye redness, or irritation are examined by Ophthalmology.',
    isEmergency: false
  },
  {
    department: 'Dentistry',
    secondaryDepartment: 'Oral Surgery',
    keywords: [
      'tooth', 'teeth', 'dental', 'gum', 'cavity', 'toothache', 'jaw pain',
      'दात', 'हिरडी', 'दाढदुखी', 'दात किडणे', 'दांत', 'मसूड़े', 'दांत में दर्द'
    ],
    explanation: 'Toothaches, gum swelling, cavities, and oral hygiene issues should be directed to the Dentistry unit.',
    isEmergency: false
  },
  {
    department: 'Pulmonology / Respiratory',
    secondaryDepartment: 'General Medicine',
    keywords: [
      'breath', 'asthma', 'wheezing', 'chest congestion', 'shortness of breath', 'tb', 'tuberculosis',
      'श्वास', 'दमा', 'दम', 'खोकून रक्त', 'सांस लेने में तकलीफ', 'सांस फूलना'
    ],
    explanation: 'Chronic breathing difficulties, suspected tuberculosis, asthma, or wheezing require Pulmonology care.',
    isEmergency: true,
    emergencyKeywords: ['unable to breathe', 'severe gasping', 'suffocation', 'श्वास घेता येत नाही']
  }
];

const EMERGENCY_RED_FLAGS = [
  'severe chest pain', 'difficulty breathing', 'unconscious', 'unconsciousness', 'heavy blood loss',
  'sudden paralysis', 'convulsions', 'snake bite', 'poisoning', 'accident', 'head injury',
  'साप चावणे', 'विषबाधा', 'बेशुद्ध', 'अति रक्तस्त्राव', 'अपघात', 'सांप का काटना', 'बेहोश', 'गंभीर छाती दर्द'
];

export function analyzeSymptomsNLP(query: string): NLPTriageResult {
  if (!query || query.trim().length === 0) {
    return {
      suggestedDepartment: 'General Medicine',
      confidence: 0.5,
      explanation: 'Please provide more details on your symptoms so we can assist in department direction.',
      isEmergencyAlert: false,
      recommendedKeywords: []
    };
  }

  const normalized = query.toLowerCase().trim();

  // Check emergency red flags
  const isEmergency = EMERGENCY_RED_FLAGS.some(flag => normalized.includes(flag));

  let bestMatch: SpecialtyRule | null = null;
  let maxMatchedKeywords = 0;
  let matchedKeywordsList: string[] = [];

  for (const rule of RULES) {
    const matched = rule.keywords.filter(kw => normalized.includes(kw.toLowerCase()));
    if (matched.length > maxMatchedKeywords) {
      maxMatchedKeywords = matched.length;
      bestMatch = rule;
      matchedKeywordsList = matched;
    }
  }

  // Check emergency keywords in rule
  let ruleTriggeredEmergency = isEmergency;
  if (bestMatch && bestMatch.emergencyKeywords) {
    const matchedEmg = bestMatch.emergencyKeywords.some(kw => normalized.includes(kw.toLowerCase()));
    if (matchedEmg) {
      ruleTriggeredEmergency = true;
    }
  }

  if (bestMatch && maxMatchedKeywords > 0) {
    return {
      suggestedDepartment: bestMatch.department,
      secondaryDepartment: bestMatch.secondaryDepartment,
      confidence: Math.min(0.95, 0.65 + maxMatchedKeywords * 0.1),
      explanation: bestMatch.explanation,
      isEmergencyAlert: ruleTriggeredEmergency,
      emergencyNotice: ruleTriggeredEmergency
        ? 'Severe or sudden onset symptoms (such as acute chest pain, breathing difficulty, or altered consciousness) may require immediate emergency stabilization. Please reach your nearest PHC/District Hospital emergency triage or dial 108.'
        : undefined,
      recommendedKeywords: matchedKeywordsList
    };
  }

  // Default fallback
  return {
    suggestedDepartment: 'General Medicine',
    secondaryDepartment: 'Outpatient Clinic',
    confidence: 0.6,
    explanation: 'Based on the entered description, General Medicine (OPD) is the recommended starting point for comprehensive primary evaluation and clinical triaging.',
    isEmergencyAlert: isEmergency,
    emergencyNotice: isEmergency
      ? 'Emergency keywords detected in your notes. Please do not wait for standard OPD; visit Emergency Services or call 108 immediately.'
      : undefined,
    recommendedKeywords: []
  };
}

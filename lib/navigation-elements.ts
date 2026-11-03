export interface NavElementItem {
  id: string;
  label: string;
  description: string;
  defaultHindiInstruction: string;
  keywords: string[];
}

export const PORTAL_NAV_ELEMENTS: NavElementItem[] = [
  {
    id: 'nav-login',
    label: 'लॉगिन (Login)',
    description: 'Header button to login to user account / पोर्टल लॉगिन बटन',
    defaultHindiInstruction: 'लॉगिन करने के लिए यहाँ ऊपर दिए गए लॉगिन बटन पर क्लिक करें।',
    keywords: ['लॉगिन', 'login', 'साइन इन', 'sign in', 'खाता', 'account', 'लॉग इन']
  },
  {
    id: 'nav-register',
    label: 'नया पंजीकरण (New Registration)',
    description: 'Header button for new applicant registration / नया पंजीकरण या खाता बनाने का बटन',
    defaultHindiInstruction: 'नया छात्रवृत्ति पंजीकरण करने के लिए यहाँ नया पंजीकरण बटन पर क्लिक करें।',
    keywords: ['पंजीकरण', 'रजिस्टर', 'रजिस्ट्रेशन', 'register', 'registration', 'sign up', 'नया खाता']
  },
  {
    id: 'field-name',
    label: 'आवेदक का पूरा नाम (Applicant Name)',
    description: 'Input text box for applicant full name as per Aadhaar / आवेदक का नाम दर्ज करने का बॉक्स',
    defaultHindiInstruction: 'आधार कार्ड के अनुसार अपना पूरा नाम यहाँ दर्ज करें।',
    keywords: ['नाम', 'name', 'applicant', 'आवेदक', 'विद्यार्थी', 'छात्र']
  },
  {
    id: 'field-state',
    label: 'मूल निवास राज्य (Domicile State)',
    description: 'Dropdown select for domicile state / मूल निवास राज्य चुनने का ड्रॉपडाउन',
    defaultHindiInstruction: 'अपने गृह राज्य का चयन करने के लिए इस ड्रॉपडाउन पर क्लिक करें।',
    keywords: ['राज्य', 'state', 'निवास', 'domicile', 'गृह राज्य', 'प्रदेश']
  },
  {
    id: 'field-income',
    label: 'वार्षिक पारिवारिक आय (Family Income)',
    description: 'Input number box for annual household income in Rupees / कुल पारिवारिक आय का बॉक्स',
    defaultHindiInstruction: 'अपने परिवार की कुल वार्षिक आय रुपये में यहाँ दर्ज करें।',
    keywords: ['आय', 'income', 'सैलरी', 'पैसे', 'रुपये', 'कमाई', 'वेतन', 'पारिवारिक आय']
  },
  {
    id: 'field-doc',
    label: 'दस्तावेज़ अपलोड (Upload Documents)',
    description: 'File upload input for Income Certificate / 12th Marksheet / आय प्रमाण पत्र या अंकसूची अपलोड बॉक्स',
    defaultHindiInstruction: 'अपना आय प्रमाण पत्र अथवा अंकसूची यहाँ अपलोड करें।',
    keywords: ['दस्तावेज़', 'डॉक्यूमेंट', 'document', 'अपलोड', 'upload', 'प्रमाण पत्र', 'कागज़', 'अंकसूची', 'marksheet', 'certificate', 'file']
  },
  {
    id: 'btn-submit',
    label: 'आवेदन जमा करें (Submit Application)',
    description: 'Final submission button at the bottom / अंतिम रूप से आवेदन जमा करने का बटन',
    defaultHindiInstruction: 'आवेदन पूरा करने के बाद नीचे दिए गए इस बटन पर क्लिक करके फॉर्म जमा करें।',
    keywords: ['सबमिट', 'submit', 'जमा', 'आवेदन जमा', 'भेजें', 'फाइनल सबमिट', 'फॉर्म जमा']
  }
];

export function findFallbackTarget(query: string): { targetId: string; hindiInstruction: string } {
  const normalized = query.toLowerCase();
  for (const item of PORTAL_NAV_ELEMENTS) {
    if (item.keywords.some((k) => normalized.includes(k.toLowerCase()))) {
      return { targetId: item.id, hindiInstruction: item.defaultHindiInstruction };
    }
  }
  return {
    targetId: 'field-name',
    hindiInstruction: 'आवेदन फॉर्म भरने के लिए यहाँ आवेदक के नाम से शुरुआत करें।',
  };
}

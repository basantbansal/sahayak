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
    id: 'nav-status',
    label: 'आवेदन स्थिति (Track Status)',
    description: 'Button to check application status / आवेदन की स्थिति जांचें',
    defaultHindiInstruction: 'अपने आवेदन की स्थिति जांचने के लिए यहाँ आवेदन स्थिति बटन पर क्लिक करें।',
    keywords: ['स्टेटस', 'स्थिति', 'ट्रैक', 'track', 'status', 'आवेदन स्थिति', 'application status']
  },
  {
    id: 'field-name',
    label: 'आवेदक का पूरा नाम (Applicant Name)',
    description: 'Input text box for applicant full name as per Aadhaar / आवेदक का नाम दर्ज करने का बॉक्स',
    defaultHindiInstruction: 'आधार कार्ड के अनुसार अपना पूरा नाम यहाँ दर्ज करें।',
    keywords: ['पूरा नाम', 'name', 'applicant', 'आवेदक का नाम', 'छात्र का नाम']
  },
  {
    id: 'field-father',
    label: 'पिता का नाम (Father Name)',
    description: 'Input box for father or guardian name / पिता या अभिभावक का नाम',
    defaultHindiInstruction: 'यहाँ अपने पिता अथवा अभिभावक का नाम दर्ज करें।',
    keywords: ['पिता', 'father', 'अभिभावक', 'guardian', 'पापा']
  },
  {
    id: 'field-dob',
    label: 'जन्म तिथि (Date of Birth)',
    description: 'Date picker for date of birth / जन्म तिथि',
    defaultHindiInstruction: 'यहाँ अपनी जन्म तिथि (Date of Birth) चुनें।',
    keywords: ['जन्म तिथि', 'date of birth', 'dob', 'जन्म', 'birthday', 'तारीख']
  },
  {
    id: 'field-gender',
    label: 'लिंग (Gender)',
    description: 'Dropdown for gender selection / लिंग चयन',
    defaultHindiInstruction: 'यहाँ अपने लिंग (पुरुष/महिला/अन्य) का चयन करें।',
    keywords: ['लिंग', 'gender', 'पुरुष', 'महिला', 'male', 'female']
  },
  {
    id: 'field-category',
    label: 'सामाजिक श्रेणी (Category)',
    description: 'Dropdown for caste or social category / सामाजिक श्रेणी',
    defaultHindiInstruction: 'अपनी जाति अथवा सामाजिक श्रेणी (SC/ST/OBC/GEN) का चयन करें।',
    keywords: ['श्रेणी', 'category', 'जाति', 'caste', 'sc', 'st', 'obc', 'सामान्य']
  },
  {
    id: 'field-aadhaar',
    label: 'आधार संख्या (Aadhaar Number)',
    description: 'Input box for 12 digit Aadhaar number / आधार संख्या',
    defaultHindiInstruction: 'अपनी 12 अंकों की आधार संख्या यहाँ दर्ज करें।',
    keywords: ['आधार', 'aadhaar', 'aadhar', 'यूआईडी']
  },
  {
    id: 'field-state',
    label: 'मूल निवास राज्य (Domicile State)',
    description: 'Dropdown select for domicile state / मूल निवास राज्य चुनने का ड्रॉपडाउन',
    defaultHindiInstruction: 'अपने गृह राज्य का चयन करने के लिए इस ड्रॉपडाउन पर क्लिक करें।',
    keywords: ['राज्य', 'state', 'निवास', 'domicile', 'गृह राज्य', 'प्रदेश']
  },
  {
    id: 'field-district',
    label: 'गृह जिला (District)',
    description: 'Input box for home district / गृह जिला',
    defaultHindiInstruction: 'यहाँ अपने गृह जिले का नाम दर्ज करें।',
    keywords: ['जिला', 'district', 'शहर', 'city']
  },
  {
    id: 'field-pincode',
    label: 'पिन कोड (PIN Code)',
    description: 'Input box for postal PIN code / पिन कोड',
    defaultHindiInstruction: 'अपने क्षेत्र का 6 अंकों का पिन कोड यहाँ दर्ज करें।',
    keywords: ['पिन कोड', 'pincode', 'pin', 'डाक']
  },
  {
    id: 'field-income',
    label: 'वार्षिक पारिवारिक आय (Family Income)',
    description: 'Input number box for annual household income in Rupees / कुल पारिवारिक आय का बॉक्स',
    defaultHindiInstruction: 'अपने परिवार की कुल वार्षिक आय रुपये में यहाँ दर्ज करें।',
    keywords: ['आय', 'income', 'सैलरी', 'पैसे', 'रुपये', 'कमाई', 'वेतन', 'पारिवारिक आय']
  },
  {
    id: 'field-college',
    label: 'संस्थान / कॉलेज (Institute)',
    description: 'Input box for institute or college name / कॉलेज या संस्थान का नाम',
    defaultHindiInstruction: 'यहाँ अपने कॉलेज अथवा शैक्षणिक संस्थान का नाम दर्ज करें।',
    keywords: ['कॉलेज', 'संस्थान', 'institute', 'college', 'स्कूल', 'विश्वविद्यालय', 'university']
  },
  {
    id: 'field-course',
    label: 'कोर्स / कक्षा (Course)',
    description: 'Input box for current course / वर्तमान कोर्स',
    defaultHindiInstruction: 'यहाँ अपने वर्तमान कोर्स अथवा कक्षा का नाम लिखें।',
    keywords: ['कोर्स', 'course', 'कक्षा', 'class', 'डिप्लोमा', 'डिग्री']
  },
  {
    id: 'field-account',
    label: 'बैंक खाता संख्या (Bank Account)',
    description: 'Input box for bank account number / बैंक खाता संख्या',
    defaultHindiInstruction: 'अपना आधार-लिंक्ड बैंक खाता संख्या यहाँ दर्ज करें।',
    keywords: ['बैंक खाता', 'खाता संख्या', 'account number', 'bank account', 'खाता']
  },
  {
    id: 'field-ifsc',
    label: 'बैंक IFSC कोड (IFSC Code)',
    description: 'Input box for bank IFSC code / बैंक IFSC कोड',
    defaultHindiInstruction: 'अपने बैंक शाखा का IFSC कोड यहाँ दर्ज करें।',
    keywords: ['ifsc', 'आईएफएससी', 'ब्रांच कोड']
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

export function findFallbackTarget(query: string): { targetId: string; hindiInstruction: string } | null {
  const normalized = query.toLowerCase();
  for (const item of PORTAL_NAV_ELEMENTS) {
    if (item.keywords.some((k) => normalized.includes(k.toLowerCase()))) {
      return { targetId: item.id, hindiInstruction: item.defaultHindiInstruction };
    }
  }
  return null;
}

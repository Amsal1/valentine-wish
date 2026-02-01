/**
 * Website Configuration
 * 
 * Customize this file to personalize the Valentine's website for your special someone.
 * All text, names, and messages can be changed from this single file.
 */

export interface SiteConfig {
  /** Your partner's name */
  partnerName: string;
  /** Your name (optional) */
  yourName?: string;
  /** Shared surname if applicable */
  surname?: string;
  /** Pet names or nicknames for your partner */
  petNames: string[];
  /** Hero section configuration */
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  /** Reasons section configuration */
  reasons: {
    sectionTitle: string;
    cards: Array<{
      id: string;
      text: string;
      icon: string;
      description: string;
    }>;
  };
  /** Gallery section configuration */
  gallery: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  /** Love game section configuration */
  loveGame: {
    sectionTitle: string;
    question: string;
    yesButtonText: string;
    noButtonText: string;
    celebrationTitle: string;
    celebrationSubtitle: string;
    pleadingMessages: string[];
  };
  /** Footer configuration */
  footer: {
    message: string;
    signature: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// 💕 PERSONALIZATION - Change these to customize for your love!
// ═══════════════════════════════════════════════════════════════

const PARTNER_NAME = 'Partner_Name';
const YOUR_NAME = 'Amsal';
const SURNAME = 'Khan';
const PET_NAMES = ['Madam-ji', 'Maalkin'];

// Helper to get "Mrs. Khan" or just the name if no surname
const getMrsName = () => SURNAME ? `Mrs. ${SURNAME}` : PARTNER_NAME;
const getFullName = () => SURNAME ? `${PARTNER_NAME} ${SURNAME}` : PARTNER_NAME;

// Helper to get a name - uses pet name if available, otherwise partner name
const getName = () => PET_NAMES.length > 0 
  ? PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)] ?? PARTNER_NAME
  : PARTNER_NAME;

/**
 * Generates pleading messages with dynamic names (pet names or partner name)
 * Called fresh each time to get random pet names in messages
 */
function generatePleadingMessages(): string[] {
  return [
    `Arey ${getName()} please 🥺`,
    'Ek baar soch lo na 💕',
    `${getName()} plsss plsss plsss 🙏`,
    'Kya yaar, itna bhi nahi? 😢',
    `Bas ek Yes de do na, ${getName()} 💝`,
    'Main wait karunga forever 🥹',
    'Dekho kitna cute button hai, click karo na 👉👈',
    'Acha theek hai, No mat bolo bas 😭',
    `Arre ${getName()}, Yes bol do 💗`,
    `Tumhare bina kuch nahi, ${getName()} 🥺💕`,
    'Okay fine, I\'ll keep trying 😤💕',
    `${getName()} please, meri baat maan lo 🙏`,
    'Itna mushkil hai kya? 😢',
    `Main toh tumhara hi hoon, ${getName()} 💝`,
    'Bas ek click, that\'s all I ask 🥹',
    `Future ${getMrsName()}, please? 💍`,
  ];
}


/**
 * Site configuration - Uses the variables above for easy customization
 */
export const siteConfig: SiteConfig = {
  partnerName: PARTNER_NAME,
  yourName: YOUR_NAME,
  surname: SURNAME,
  petNames: PET_NAMES,

  // ═══════════════════════════════════════════════════════════════
  // 🏠 HERO SECTION
  // ═══════════════════════════════════════════════════════════════
  
  hero: {
    title: `For My ${PARTNER_NAME} 💕`,
    subtitle: 'Every moment with you is a blessing. This is my little corner of the internet, just for you.',
    ctaText: 'See Why I Love You',
  },

  // ═══════════════════════════════════════════════════════════════
  // 💝 REASONS I LOVE YOU
  // ═══════════════════════════════════════════════════════════════
  
  reasons: {
    sectionTitle: `Why I Love You, ${PARTNER_NAME}`,
    cards: [
      { 
        id: '1', 
        text: 'Your beautiful smile', 
        icon: '😊',
        description: `Those dimples when you smile, ${PARTNER_NAME}... they make my heart skip a beat every single time 💕`
      },
      { 
        id: '2', 
        text: 'My future doctor', 
        icon: '👩‍⚕️',
        description: `So proud of you finishing your BAMS, ${PARTNER_NAME}. Watching you become a doctor has been incredible. You inspire me every day 💪`
      },
      { 
        id: '3', 
        text: 'Your presence', 
        icon: '🌸',
        description: `I just love being around you, ${PARTNER_NAME}. Every moment with you feels like home`
      },
      { 
        id: '4', 
        text: 'How you\'ve grown', 
        icon: '✨',
        description: 'The way you\'ve improved yourself over the years, becoming stronger and more amazing every day'
      },
      { 
        id: '5', 
        text: 'No single reason', 
        icon: '❤️',
        description: `Honestly? There's no one reason. I just love you, ${PARTNER_NAME}. That's it. That's the whole thing.`
      },
      { 
        id: '6', 
        text: 'Just... you', 
        icon: '💕',
        description: `You being you is enough. More than enough. It's everything, ${getMrsName()} 💍`
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 📸 GALLERY SECTION
  // ═══════════════════════════════════════════════════════════════
  
  gallery: {
    sectionTitle: `Some Lovely Pics of ${PARTNER_NAME}`,
    sectionSubtitle: 'Tap to reveal the moments I adore 💕',
  },

  // ═══════════════════════════════════════════════════════════════
  // 💘 LOVE GAME SECTION
  // ═══════════════════════════════════════════════════════════════
  
  loveGame: {
    sectionTitle: 'One Last Question...',
    question: `Will you be mine forever, ${PARTNER_NAME}?`,
    yesButtonText: 'Yes! 💕',
    noButtonText: 'No',
    celebrationTitle: 'Yayyyy! 💕🎉',
    celebrationSubtitle: `I knew you'd say yes! Main tumhara, tum meri... forever, ${getMrsName()}! 💝`,
    pleadingMessages: generatePleadingMessages(),
  },

  // ═══════════════════════════════════════════════════════════════
  // 📝 FOOTER
  // ═══════════════════════════════════════════════════════════════
  
  footer: {
    message: `Made with all my love for you, ${PARTNER_NAME} 💕`,
    signature: 'Forever yours',
  },
};

/**
 * Helper function to get a random pet name
 */
export function getRandomPetName(): string {
  const { petNames } = siteConfig;
  return petNames[Math.floor(Math.random() * petNames.length)] ?? petNames[0] ?? 'Love';
}

/**
 * Helper function to get the full name with surname (exported version)
 */
export function getPartnerFullName(): string {
  return getFullName();
}

export default siteConfig;

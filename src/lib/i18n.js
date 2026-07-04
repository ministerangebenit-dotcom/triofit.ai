export const translations = {
  en: {
    langLabel: "EN",
    landingHeadline: "How will you be seen?",
    landingSub: "Know exactly how you'll be perceived before you walk into the room.",
    landingCta: "Begin →",

    nsLabel: "Welcome",
    nsTitle: "What's your name?",
    nsSub: "Your personal stylist is ready.",
    nsPlaceholder: "Your first name",
    nsContinue: "Continue",

    goalTitle: "Why are you here today?",
    goalSub: "This shapes everything I recommend.",
    goalJob: "Get a job",
    goalDate: "Impress on a date",
    goalWealth: "Look wealthier",
    goalWedding: "A wedding",
    goalAuthority: "Build authority",
    goalBrand: "Personal branding",

    greeting: (name) => `Hi ${name}. I'm your TRIOFIT stylist.`,
    situationPrompt: "Tell me about your situation — what's coming up, and what you want people to think of you.",
    situationPlaceholder: "e.g. I have a job interview Thursday at a tech startup. I want to look capable but not overdressed…",
    situationContinue: "Continue →",

    readingBetweenLines: "reading between the lines…",
    thinking: "thinking…",

    confirmTitle: "Here's what I understood",
    confirmYes: "That's right",
    confirmEdit: "Let me rephrase",

    processingTitle: "Building your perception profile",
    processingMessages: [
      "Analyzing communication style…",
      "Evaluating social perception signals…",
      "Mapping psychological impression profile…",
      "Comparing against your stated goal…",
      "Weighing tone against context…",
      "Looking for inconsistencies…",
      "Predicting social outcome…",
      "Finalizing your perception profile…",
    ],

    revealImpression: "Impression",
    revealReasons: "Reasons",
    revealPrediction: "Prediction",
    revealCta: "Let's refine this?",
    revealYes: "Yes, refine it",
    revealNo: "No, just give me quick advice",

    waitingForStylist: "Your stylist is hand-picking your outfit now…",
    perceptionBlueprint: "Perception blueprint",
    quickAdviceIntro: "Here's how to still shift the impression, without changing the outfit.",

    chatPlaceholder: "Ask your stylist",
    catalogTrouble: "Having trouble reaching the outfit catalog right now.",
    noTemplateYet: "I don't have a matching outfit template yet — your stylist will add one shortly.",
    connectionIssue: "Connection issue — is the backend running?",
    stylistBrainTrouble: "I'm having trouble reaching your stylist brain right now.",
    extractTrouble: "I'm having trouble reading that — mind trying again?",

    traitConfidence: "Confidence",
    traitAuthority: "Authority",
    traitTrust: "Trustworthiness",
    traitApproachability: "Approachability",
    traitStyleFit: "Style fit",
  },

  fr: {
    langLabel: "FR",
    landingHeadline: "Comment serez-vous perçu ?",
    landingSub: "Sachez exactement comment vous serez perçu avant de franchir la porte.",
    landingCta: "Commencer →",

    nsLabel: "Bienvenue",
    nsTitle: "Comment vous appelez-vous ?",
    nsSub: "Votre styliste personnel est prêt.",
    nsPlaceholder: "Votre prénom",
    nsContinue: "Continuer",

    goalTitle: "Pourquoi êtes-vous ici aujourd'hui ?",
    goalSub: "Cela oriente tout ce que je recommande.",
    goalJob: "Obtenir un emploi",
    goalDate: "Impressionner lors d'un rendez-vous",
    goalWealth: "Paraître plus aisé",
    goalWedding: "Un mariage",
    goalAuthority: "Asseoir votre autorité",
    goalBrand: "Image personnelle",

    greeting: (name) => `Bonjour ${name}. Je suis votre styliste TRIOFIT.`,
    situationPrompt: "Parlez-moi de votre situation — ce qui s'en vient, et comment vous voulez être perçu.",
    situationPlaceholder: "ex. J'ai un entretien d'embauche jeudi dans une start-up tech. Je veux paraître compétent sans être trop habillé…",
    situationContinue: "Continuer →",

    readingBetweenLines: "je lis entre les lignes…",
    thinking: "réflexion…",

    confirmTitle: "Voici ce que j'ai compris",
    confirmYes: "C'est exact",
    confirmEdit: "Laissez-moi reformuler",

    processingTitle: "Construction de votre profil de perception",
    processingMessages: [
      "Analyse du style de communication…",
      "Évaluation des signaux de perception sociale…",
      "Cartographie du profil psychologique…",
      "Comparaison avec votre objectif…",
      "Analyse du ton et du contexte…",
      "Recherche d'incohérences…",
      "Prédiction du résultat social…",
      "Finalisation de votre profil de perception…",
    ],

    revealImpression: "Impression",
    revealReasons: "Raisons",
    revealPrediction: "Prédiction",
    revealCta: "On affine ?",
    revealYes: "Oui, affinons",
    revealNo: "Non, donnez-moi juste un conseil rapide",

    waitingForStylist: "Votre styliste sélectionne votre tenue en ce moment…",
    perceptionBlueprint: "Profil de perception",
    quickAdviceIntro: "Voici comment améliorer l'impression, sans changer de tenue.",

    chatPlaceholder: "Posez une question à votre styliste",
    catalogTrouble: "Difficulté à accéder au catalogue de tenues pour le moment.",
    noTemplateYet: "Je n'ai pas encore de tenue correspondante — votre styliste en ajoutera une bientôt.",
    connectionIssue: "Problème de connexion — le serveur est-il actif ?",
    stylistBrainTrouble: "J'ai du mal à joindre votre styliste en ce moment.",
    extractTrouble: "J'ai du mal à comprendre — pouvez-vous reformuler ?",

    traitConfidence: "Confiance",
    traitAuthority: "Autorité",
    traitTrust: "Fiabilité",
    traitApproachability: "Accessibilité",
    traitStyleFit: "Adéquation du style",
  },
};

export function useLang() {
  const lang = localStorage.getItem("tf_lang") || "fr";
  return lang;
}

export function setLang(lang) {
  localStorage.setItem("tf_lang", lang);
}

export function t(lang) {
  return translations[lang] || translations.fr;
}

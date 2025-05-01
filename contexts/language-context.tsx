"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "english" | "tamil" | "sinhala"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Simple translations for demonstration
const translations: Record<Language, Record<string, string>> = {
  english: {
    dashboard: "Dashboard",
    obituary: "Obituary",
    packages: "Packages",
    addons: "Addons",
    users: "Users",
    donations: "Donations",
    advertisement: "Advertisement",
    news: "News",
    events: "Events",
    tribute: "Tribute",
    contact: "Contact Us",
    faq: "FAQ",
    adminManagement: "Admin Management",
    logout: "Logout",
    language: "Language",
    english: "English",
    tamil: "Tamil",
    sinhala: "Sinhala",
    welcome: "Welcome",
    superAdmin: "Super Admin",
    admin: "Admin",
    search: "Search...",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    // Add more translations as needed
  },
  tamil: {
    dashboard: "டாஷ்போர்டு",
    obituary: "இரங்கல்",
    packages: "தொகுப்புகள்",
    addons: "கூடுதல்கள்",
    users: "பயனர்கள்",
    donations: "நன்கொடைகள்",
    advertisement: "விளம்பரம்",
    news: "செய்திகள்",
    events: "நிகழ்வுகள்",
    tribute: "அஞ்சலி",
    contact: "தொடர்பு",
    faq: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    adminManagement: "நிர்வாக மேலாண்மை",
    logout: "வெளியேறு",
    language: "மொழி",
    english: "ஆங்கிலம்",
    tamil: "தமிழ்",
    sinhala: "சிங்களம்",
    welcome: "வரவேற்கிறோம்",
    superAdmin: "சூப்பர் நிர்வாகி",
    admin: "நிர்வாகி",
    search: "தேடு...",
    notifications: "அறிவிப்புகள்",
    profile: "சுயவிவரம்",
    settings: "அமைப்புகள்",
    // Add more translations as needed
  },
  sinhala: {
    dashboard: "ඩැෂ්බෝඩ්",
    obituary: "අවමංගල්‍ය",
    packages: "පැකේජ",
    addons: "ඇඩෝන්",
    users: "පරිශීලකයින්",
    donations: "පරිත්‍යාග",
    advertisement: "වෙළඳ දැන්වීම්",
    news: "පුවත්",
    events: "සිදුවීම්",
    tribute: "ගෞරව",
    contact: "අප අමතන්න",
    faq: "නිතර අසන පැණ",
    adminManagement: "පරිපාලක කළමනාකරණය",
    logout: "පිටවීම",
    language: "භාෂාව",
    english: "ඉංග්‍රීසි",
    tamil: "දෙමළ",
    sinhala: "සිංහල",
    welcome: "සාදරයෙන් පිළිගනිමු",
    superAdmin: "සුපිරි පරිපාලක",
    admin: "පරිපාලක",
    search: "සොයන්න...",
    notifications: "දැනුම්දීම්",
    profile: "පැතිකඩ",
    settings: "සැකසුම්",
    // Add more translations as needed
  },
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("english")

  // Load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["english", "tamil", "sinhala"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

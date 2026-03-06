import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define terminology mappings based on organization type/industry
const TERMINOLOGY_MAP: Record<string, { singular: string; plural: string; title: string }> = {
  // Church/Religious
  church: { singular: 'member', plural: 'members', title: 'Member' },
  religious: { singular: 'member', plural: 'members', title: 'Member' },
  nonprofit: { singular: 'member', plural: 'members', title: 'Member' },
  
  // Corporate/Business
  corporate: { singular: 'employee', plural: 'employees', title: 'Employee' },
  business: { singular: 'employee', plural: 'employees', title: 'Employee' },
  
  // Educational
  school: { singular: 'student', plural: 'students', title: 'Student' },
  university: { singular: 'student', plural: 'students', title: 'Student' },
  education: { singular: 'student', plural: 'students', title: 'Student' },
  
  // Healthcare
  hospital: { singular: 'staff', plural: 'staff', title: 'Staff' },
  healthcare: { singular: 'staff', plural: 'staff', title: 'Staff' },
  clinic: { singular: 'staff', plural: 'staff', title: 'Staff' },
  
  // Government
  government: { singular: 'employee', plural: 'employees', title: 'Employee' },
  
  // Default fallback
  other: { singular: 'member', plural: 'members', title: 'Member' },
};

interface TerminologyContextType {
  personSingular: string;
  personPlural: string;
  personTitle: string;
  organizationType: string;
  organizationIndustry: string;
  organizationName: string;
  getTerm: (type: 'singular' | 'plural' | 'title', capitalize?: boolean) => string;
  isLoading: boolean;
  refreshTerminology: () => Promise<void>;
}

const defaultContext: TerminologyContextType = {
  personSingular: 'member',
  personPlural: 'members',
  personTitle: 'Member',
  organizationType: 'other',
  organizationIndustry: '',
  organizationName: '',
  getTerm: (type, capitalize = false) => {
    const term = type === 'singular' ? 'member' : type === 'plural' ? 'members' : 'Member';
    return capitalize ? term.charAt(0).toUpperCase() + term.slice(1) : term;
  },
  isLoading: true,
  refreshTerminology: async () => {},
};

const TerminologyContext = createContext<TerminologyContextType>(defaultContext);

export const useTerminology = () => {
  const context = useContext(TerminologyContext);
  if (!context) {
    return defaultContext;
  }
  return context;
};

interface TerminologyProviderProps {
  children: ReactNode;
  organizationId?: string;
  /** Organization type from profile — avoids Supabase query */
  organizationType?: string;
  /** Organization industry from profile */
  organizationIndustry?: string;
  /** Organization name from profile */
  organizationName?: string;
}

export const TerminologyProvider: React.FC<TerminologyProviderProps> = ({ 
  children, 
  organizationType = 'other',
  organizationIndustry = '',
  organizationName = '',
}) => {
  const determineTerminology = (type: string, industry: string) => {
    const industryLower = industry?.toLowerCase() || '';
    const typeLower = type?.toLowerCase() || 'other';
    
    for (const [key, terms] of Object.entries(TERMINOLOGY_MAP)) {
      if (industryLower.includes(key) || industryLower === key) {
        return terms;
      }
    }
    
    return TERMINOLOGY_MAP[typeLower] || TERMINOLOGY_MAP.other;
  };

  const terms = determineTerminology(organizationType, organizationIndustry);

  const [terminology] = useState(() => ({
    personSingular: terms.singular,
    personPlural: terms.plural,
    personTitle: terms.title,
  }));

  // Re-derive when props change
  const [currentTerms, setCurrentTerms] = useState(terminology);

  useEffect(() => {
    const t = determineTerminology(organizationType, organizationIndustry);
    setCurrentTerms({
      personSingular: t.singular,
      personPlural: t.plural,
      personTitle: t.title,
    });
  }, [organizationType, organizationIndustry]);

  const getTerm = (type: 'singular' | 'plural' | 'title', capitalize = false): string => {
    let term = '';
    switch (type) {
      case 'singular': term = currentTerms.personSingular; break;
      case 'plural': term = currentTerms.personPlural; break;
      case 'title': term = currentTerms.personTitle; break;
    }
    return capitalize ? term.charAt(0).toUpperCase() + term.slice(1) : term;
  };

  const value: TerminologyContextType = {
    ...currentTerms,
    organizationType,
    organizationIndustry,
    organizationName,
    getTerm,
    isLoading: false,
    refreshTerminology: async () => {},
  };

  return (
    <TerminologyContext.Provider value={value}>
      {children}
    </TerminologyContext.Provider>
  );
};

export default TerminologyContext;

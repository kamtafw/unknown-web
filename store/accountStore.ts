import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ReportedProblem {
  problem_type: string;
  feedback?: string;
  timestamp: string;
  id: string;
}

interface AccountState {
  reportedProblems: ReportedProblem[];
  currentTimezone: string | null;
  addReportedProblem: (problem: ReportedProblem) => void;
  clearReportedProblems: () => void;
  setCurrentTimezone: (timezone: string) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      reportedProblems: [],
      currentTimezone: null,
      addReportedProblem: (problem) =>
        set((state) => ({
          reportedProblems: [...state.reportedProblems, problem],
        })),
      clearReportedProblems: () => set({ reportedProblems: [] }),
      setCurrentTimezone: (timezone) => set({ currentTimezone: timezone }),
    }),
    {
      name: "account-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentTimezone: state.currentTimezone,
      }),
    }
  )
);
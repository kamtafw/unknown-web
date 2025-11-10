import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReportedProblem {
  problem_type: string;
  feedback?: string;
  timestamp: string;
  id: string;
}

interface AccountState {
  reportedProblems: ReportedProblem[];
  addReportedProblem: (problem: ReportedProblem) => void;
  clearReportedProblems: () => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      reportedProblems: [],
      addReportedProblem: (problem) =>
        set((state) => ({
          reportedProblems: [...state.reportedProblems, problem],
        })),
      clearReportedProblems: () => set({ reportedProblems: [] }),
    }),
    {
      name: "account-storage",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
"use client";

import React, { useState } from "react";
import AccountSetupForm from "./AccountSetupForm";
import PersonalDetailsForm from "./PersonalDetailsForm";
import DocumentUploadForm from "./DocumentUploadForm";

export default function Page() {
  const [currentStep, setCurrentStep] = useState<
    "business" | "personal" | "documents"
  >("business");

  const [businessData, setBusinessData] = useState<{
    businessName: string;
    businessDescription: string;
    selectedCategories: string[];
  } | null>(null);

  const handleBusinessSubmit = (data: {
    businessName: string;
    businessDescription: string;
    selectedCategories: string[];
  }) => {
    setBusinessData(data);
    setCurrentStep("personal");
  };

  const handlePersonalSubmit = (data: {
    fullName: string;
    phoneNumber: string;
    country: string;
    storeAddress: string;
  }) => {
    console.log("All data:", { businessData, personalData: data });
    setCurrentStep("documents");
  };
  const handleGoBack = () => {
    if (currentStep === "personal") {
      setCurrentStep("business");
    } else if (currentStep === "documents") {
      setCurrentStep("personal");
    }
  };

  return (
    <>
      {currentStep === "business" && (
        <AccountSetupForm onSubmit={handleBusinessSubmit} />
      )}
      {currentStep === "personal" && (
        <PersonalDetailsForm
          onNext={handlePersonalSubmit}
          onPrev={handleGoBack}
        />
      )}
      {currentStep === "documents" && (
        <DocumentUploadForm
          onNext={() => window.location.href = '/market-vendor/goods'}
          onPrev={handleGoBack}
        />
      )}
    </>
  );
}

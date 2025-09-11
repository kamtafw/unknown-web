"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SettingsMainPage from "./SettingsMainPage";
import AccountPage from "./account/AccountPage";
import SecurityNotificationPage from "./account/SecurityNotificationPage";
import ReportProblemPage from "./account/ReportProblemPage";
import TwoStepVerificationPage from "./account/two-step-verification/TwoStepVerificationPage";
import CreatePinPage from "./account/two-step-verification/CreatePinPage";
import ConfirmPinPage from "./account/two-step-verification/ConfirmPinPage";
import GoogleAuthenticatorPage from "./account/two-step-verification/GoogleAuthenticatorPage";
import GoogleAuthenticatorPage2 from "./account/two-step-verification/GoogleAuthenticatorPage2";
import GoogleAuthenticatorPage3 from "./account/two-step-verification/GoogleAuthenticatorPage3";
import ChangeNumberPage from "./account/change-number/ChangeNumberPage";
import ChangeNumberPage2 from "./account/change-number/ChangeNumberPage2";
import ChangeNumberPage3 from "./account/change-number/ChangeNumberPage3";
import ChangeNumberPage4 from "./account/change-number/ChangeNumberPage4";
import AddAccountPage from "./account/AddAccountPage";
import DeleteAccountPage from "./account/delete-account/DeleteAccountPage";
import DeleteAccountPage2 from "./account/delete-account/DeleteAccountPage2";
import AlertPage from "./AlertPage";
import VerificationPage from "./verification/VerificationPage";
import TimeZonePage from "./account/TimeZone";
import LanguagesPage from "./LanguagesPage";
import SupportPage from "./support/SupportPage";
import AskQuestionPage from "./support/AskQuestion";
import FAQPage from "./support/FAQ";
import PrivacyPolicyPage from "./support/PrivacyPolicy";
import ChatPage from "./chat/Chat";
import WallpaperPage from "./chat/Wallpaper";
import ChatBackupPage from "./chat/ChatBackup";
import PrivacyPage from "./privacy/Privacy";
import LastSeenOnlinePage from "./privacy/LastSeenOnline";
import MyContactExceptPage from "./privacy/MyContactExpect";
import StatusPage from "./privacy/Status";
import MyContactExceptStatusPage from "./privacy/MyContactExpectStatus";
import OnlyShareWithStatusPage from "./privacy/OnlyShareWithStatus";
import GroupPage from "./privacy/Group";
import MyContactExceptGroupPage from "./privacy/MyContactExpectGroup";
import ManageStorage from "./data-storage/ManageStorage";
import ForwardManyTimesPage from "./data-storage/ForwardManyTimes";
import LargerThan5MBPage from "./data-storage/LargerThan5MB";
import LargerThan5MBImagePage from "./data-storage/LargerThan5MBImage";
import NetworkUsagePage from "./data-storage/NetworkUsage";
import ChatUserPage from "./data-storage/ChatUser";
import DataAndStorage from "./data-storage/DataAndStorage";
import LiveLocationPage from "./privacy/LiveLocation";
import LiveLocationSharingPage from "./privacy/LiveLocationSharing";
import ChatLockPage from "./privacy/ChatLock";
import BlockedContactsPage from "./privacy/BlockedContact";
import UnblockContactPopup from "./privacy/UnblockContactPopup";


export default function SettingsPage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const [activeView, setActiveView] = useState(viewParam || "settingsMain");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [lastSeenText, setLastSeenText] = useState("Nobody, Same as last seen");
  const [statusText, setStatusText] = useState("My contacts");
  const [groupText, setGroupText] = useState("Everyone");
  const [blockedCount, setBlockedCount] = useState(9);
  const [selectedCount, setSelectedCount] = useState(0);
  const [lastSeenPersonalInfo, setLastSeenPersonalInfo] = useState("");
  const [lastSeenOnlineStatus] = useState("");
  const [lastSeenExcludedCount, setLastSeenExcludedCount] = useState<number>(47);
  const [statusOption, setStatusOption] = useState("");
  const [statusExcludedCount, setStatusExcludedCount] = useState(47);
  const [statusIncludedCount, setStatusIncludedCount] = useState(47);
  const [groupOption, setGroupOption] = useState("");
  const [groupExcludedCount, setGroupExcludedCount] = useState<number>(47);

  useEffect(() => {
    console.log(
      "Current activeView:",
      activeView,
      "Selected Index:",
      selectedImageIndex,
      "Blocked Count:",
      blockedCount
    );
  }, [activeView, selectedImageIndex, blockedCount]);

  const handleViewChange = (view: string, index?: number | null, count?: number) => {
    setActiveView(view);
    if (index !== undefined) {
      setSelectedImageIndex(index);
    } else if (view === "larger-than-5mb") {
      setSelectedImageIndex(null);
    }
    if (count !== undefined) {
      setSelectedCount(count);
    }
  };

  const handleBackToSettingsMain = () => {
    setActiveView("settingsMain");
    setSelectedImageIndex(null);
  };

  const handleBackToDataAndStorage = () => {
    setActiveView("data-and-storage");
    setSelectedImageIndex(null);
  };

  const handleBackToAccount = () => {
    setActiveView("account");
    setSelectedImageIndex(null);
  };

  const handleBackToTwoStepVerification = () => {
    setActiveView("twoStepVerification");
    setSelectedImageIndex(null);
  };

  const handleBackToGoogleAuthenticator = () => {
    setActiveView("googleAuthenticator");
    setSelectedImageIndex(null);
  };

  const handleBackToGoogleAuthenticator2 = () => {
    setActiveView("googleAuthenticator2");
    setSelectedImageIndex(null);
  };

  const handleBackToChangeNumber = () => {
    setActiveView("changeNumber");
    setSelectedImageIndex(null);
  };

  const handleBackToChangeNumber2 = () => {
    setActiveView("changeNumber2");
    setSelectedImageIndex(null);
  };

  const handleBackToChangeNumber3 = () => {
    setActiveView("changeNumber3");
    setSelectedImageIndex(null);
  };

  const handleBackToDeleteAccount = () => {
    setActiveView("deleteAccount");
    setSelectedImageIndex(null);
  };

  const handleBackToSupport = () => {
    setActiveView("support");
    setSelectedImageIndex(null);
  };

  const handleBackToChat = () => {
    setActiveView("chat");
    setSelectedImageIndex(null);
  };

  const handleBackToPrivacy = () => {
    setActiveView("privacy");
    setSelectedImageIndex(null);
    setSelectedCount(0);
  };

  const handleBackToLiveLocation = () => {
    setActiveView("liveLocation");
    setSelectedImageIndex(null);
  };

  const handleBackToLastSeen = () => {
    setActiveView("lastSeen");
    setSelectedImageIndex(null);
  };

  const handleBackFromSubPage = (
    textUpdate: { type?: string; text?: string } = {}
  ) => {
    if (textUpdate.type && textUpdate.text) {
      if (textUpdate.type === "lastSeen") setLastSeenText(textUpdate.text);
      if (textUpdate.type === "status") setStatusText(textUpdate.text);
      if (textUpdate.type === "group") setGroupText(textUpdate.text);
    }
    setActiveView("privacy");
  };

  return (
    <div className="flex flex-col md:flex-row justify-start mb-14">
      <SettingsMainPage
        onVerificationClick={() => handleViewChange("verification")}
        onAccountClick={() => handleViewChange("account")}
        onPrivacyClick={() => handleViewChange("privacy")}
        onAlertClick={() => handleViewChange("alert")}
        onChatClick={() => handleViewChange("chat")}
        onDataAndStorageClick={() => handleViewChange("data-and-storage")}
        onLanguagesClick={() => handleViewChange("languages")}
        onSupportClick={() => handleViewChange("support")}
        onProfileClick={() => handleViewChange("profile")}
      />
      {activeView === "verification" && <VerificationPage />}
      {activeView === "account" && (
        <AccountPage
          onSecurityClick={() => handleViewChange("securityNotification")}
          onTwoStepVerificationClick={() => handleViewChange("twoStepVerification")}
          onReportProblemClick={() => handleViewChange("reportProblem")}
          onChangePhoneNumberClick={() => handleViewChange("changeNumber")}
          onAddAccountClick={() => handleViewChange("addAccount")}
          onDeleteAccountClick={() => handleViewChange("deleteAccount")}
          onTimeZoneClick={() => handleViewChange("timeZone")}
          onLogoutClick={() => handleViewChange("logout")}
        />
      )}
      {activeView === "alert" && (
        <AlertPage onBack={handleBackToSettingsMain} />
      )}
      {activeView === "securityNotification" && (
        <SecurityNotificationPage onBack={handleBackToAccount} />
      )}
      {activeView === "reportProblem" && (
        <ReportProblemPage onBack={handleBackToAccount} />
      )}
      {activeView === "twoStepVerification" && (
        <TwoStepVerificationPage
          onBack={handleBackToAccount}
          onCreatePinClick={() => handleViewChange("createPin")}
          onGoogleAuthenticatorClick={() => handleViewChange("googleAuthenticator")}
        />
      )}
      {activeView === "createPin" && (
        <CreatePinPage
          onBack={handleBackToTwoStepVerification}
          onNext={() => handleViewChange("confirmPin")}
        />
      )}
      {activeView === "confirmPin" && (
        <ConfirmPinPage
          onBack={() => handleViewChange("createPin")}
          onNext={handleBackToAccount}
        />
      )}
      {activeView === "googleAuthenticator" && (
        <GoogleAuthenticatorPage
          onBack={handleBackToTwoStepVerification}
          onNext={() => handleViewChange("googleAuthenticator2")}
        />
      )}
      {activeView === "googleAuthenticator2" && (
        <GoogleAuthenticatorPage2
          onBack={handleBackToGoogleAuthenticator}
          onNext={() => handleViewChange("googleAuthenticator3")}
        />
      )}
      {activeView === "googleAuthenticator3" && (
        <GoogleAuthenticatorPage3
          onBack={handleBackToGoogleAuthenticator2}
          onNext={handleBackToAccount}
        />
      )}
      {activeView === "changeNumber" && (
        <ChangeNumberPage
          onBack={handleBackToAccount}
          onNext={() => handleViewChange("changeNumber2")}
        />
      )}
      {activeView === "changeNumber2" && (
        <ChangeNumberPage2
          onBack={handleBackToChangeNumber}
          onNext={() => handleViewChange("changeNumber3")}
        />
      )}
      {activeView === "changeNumber3" && (
        <ChangeNumberPage3
          onBack={handleBackToChangeNumber2}
          onNext={() => handleViewChange("changeNumber4")}
        />
      )}
      {activeView === "changeNumber4" && (
        <ChangeNumberPage4
          onBack={handleBackToChangeNumber3}
          onNext={handleBackToAccount}
        />
      )}
      {activeView === "addAccount" && (
        <AddAccountPage onBack={handleBackToAccount} />
      )}
      {activeView === "deleteAccount" && (
        <DeleteAccountPage
          onBack={handleBackToAccount}
          onNext={() => handleViewChange("deleteAccount2")}
        />
      )}
      {activeView === "deleteAccount2" && (
        <DeleteAccountPage2
          onBack={handleBackToDeleteAccount}
          onNext={() => handleViewChange("signup")}
        />
      )}
      {activeView === "timeZone" && (
        <TimeZonePage
          onBack={handleBackToAccount}
          onSave={handleBackToAccount}
        />
      )}
      {activeView === "languages" && (
        <LanguagesPage onBack={handleBackToSettingsMain} />
      )}
      {activeView === "support" && (
        <SupportPage
          onBack={handleBackToSettingsMain}
          onNavigate={handleViewChange}
        />
      )}
      {activeView === "support-ask-question" && (
        <AskQuestionPage
          onBack={handleBackToSupport}
          onNavigate={handleViewChange}
        />
      )}
      {activeView === "support-faq" && (
        <FAQPage onBack={handleBackToSupport} onNavigate={handleViewChange} />
      )}
      {activeView === "support-privacy-policy" && (
        <PrivacyPolicyPage onBack={handleBackToSupport} />
      )}
      {activeView === "chat" && (
        <ChatPage
          onBack={handleBackToSettingsMain}
          onNavigate={handleViewChange}
        />
      )}
      {activeView === "chat-wallpaper" && (
        <WallpaperPage onBack={handleBackToChat} />
      )}
      {activeView === "chat-backup" && (
        <ChatBackupPage
          onBack={handleBackToChat}
          onNavigate={handleViewChange}
        />
      )}
      {activeView === "privacy" && (
        <PrivacyPage
          onBack={handleBackToSettingsMain}
          onNavigate={handleViewChange}
          lastSeenText={lastSeenText}
          statusText={statusText}
          groupText={groupText}
          blockedCount={blockedCount}
        />
      )}
      {activeView === "liveLocation" && (
        <LiveLocationPage
          onBack={handleBackToPrivacy}
          onNavigate={handleViewChange}
        />
      )}
      {activeView === "liveLocationSharing" && (
        <LiveLocationSharingPage
          onBack={handleBackToLiveLocation}
          onStopSharing={handleBackToPrivacy}
        />
      )}
      {activeView === "chatLock" && (
        <ChatLockPage onBack={handleBackToPrivacy} />
      )}
      {activeView === "blockedContacts" && (
        <BlockedContactsPage
          onBack={handleBackToPrivacy}
          onNavigate={handleViewChange}
          setBlockedCount={setBlockedCount}
          blockedCount={blockedCount}
        />
      )}
      {activeView === "unblockContactPopup" && (
        <UnblockContactPopup
          onCancel={handleBackToPrivacy}
          onUnblock={handleBackToPrivacy}
          selectedCount={selectedCount}
          setBlockedCount={setBlockedCount}
          blockedCount={blockedCount}
        />
      )}
      {activeView === "lastSeen" && (
        <LastSeenOnlinePage
          onBack={() =>
            handleBackFromSubPage({ type: "lastSeen", text: lastSeenText })
          }
          onNavigate={handleViewChange}
          onUpdateText={(text) => setLastSeenText(text)}
          initialPersonalInfo={lastSeenPersonalInfo}
          initialOnlineStatus={lastSeenOnlineStatus}
          initialExcludedCount={lastSeenExcludedCount}
        />
      )}
      {activeView === "myContactExcept" && (
        <MyContactExceptPage
          onBack={handleBackToLastSeen}
          onUpdateText={(count) => {
            setLastSeenText(`My contact except, ${count} excluded, ${lastSeenOnlineStatus}`);
            setLastSeenPersonalInfo("My contact except");
            setLastSeenExcludedCount(Number(count));
          }}
          initialCount={lastSeenExcludedCount}
          setExcludedCount={setLastSeenExcludedCount}
        />
      )}
      {activeView === "status" && (
        <StatusPage
          activeView={activeView}
          onBack={() =>
            handleBackFromSubPage({ type: "status", text: statusText })
          }
          onNavigate={handleViewChange}
          onUpdateText={(text) => setStatusText(text)}
          initialOption={statusOption}
          initialExcludedCount={statusExcludedCount}
          initialIncludedCount={statusIncludedCount}
        />
      )}
      {activeView === "myContactExceptStatus" && (
        <MyContactExceptStatusPage
          onBack={() =>
            handleBackFromSubPage({ type: "status", text: statusText })
          }
          onUpdateText={(count) => {
            setStatusText(`My contact except, ${count} excluded`);
            setStatusOption("My contact except");
            setStatusExcludedCount(count);
          }}
          initialCount={statusExcludedCount}
          setExcludedCount={setStatusExcludedCount}
        />
      )}
      {activeView === "onlyShareWithStatus" && (
        <OnlyShareWithStatusPage
          onBack={() =>
            handleBackFromSubPage({ type: "status", text: statusText })
          }
          onUpdateText={(count) => {
            setStatusText(`Only share with, ${count} included`);
            setStatusOption("Only share with");
            setStatusIncludedCount(count);
          }}
          initialCount={statusIncludedCount}
          setIncludedCount={setStatusIncludedCount}
        />
      )}
      {activeView === "group" && (
        <GroupPage
          activeView={activeView}
          onBack={() =>
            handleBackFromSubPage({ type: "group", text: groupText })
          }
          onNavigate={handleViewChange}
          onUpdateText={(text) => setGroupText(text)}
          initialOption={groupOption}
          initialExcludedCount={groupExcludedCount}
        />
      )}
      {activeView === "myContactExceptGroup" && (
        <MyContactExceptGroupPage
          onBack={() =>
            handleBackFromSubPage({ type: "group", text: groupText })
          }
          onUpdateText={(count) => {
            setGroupText(`My contact except, ${count} excluded`);
            setGroupOption("My contact except");
            setGroupExcludedCount(count);
          }}
          initialCount={groupExcludedCount}
          setExcludedCount={setGroupExcludedCount}
        />
      )}
      {activeView === "data-and-storage" && (
        <DataAndStorage
          onBack={handleBackToSettingsMain}
          onNavigate={handleViewChange}
        />
      )}
      {activeView === "manage-storage" && (
        <ManageStorage
          onBack={handleBackToDataAndStorage}
          onNavigate={handleViewChange}
        />
      )}
      {activeView === "forward-many-times" && (
        <ForwardManyTimesPage onBack={handleBackToDataAndStorage} />
      )}
      {activeView === "larger-than-5mb" && (
        <LargerThan5MBPage
          onBack={handleBackToDataAndStorage}
          onNavigate={handleViewChange}
          selectedIndex={selectedImageIndex}
        />
      )}
      {activeView.startsWith("larger-than-5mb-image-") && (
        <LargerThan5MBImagePage
          onNavigate={() => {
            const urlParams = new URLSearchParams(window.location.search);
            const index = urlParams.get("selected");
            const parsedIndex = index ? parseInt(index, 10) : undefined;
            handleViewChange("larger-than-5mb", parsedIndex);
          }}
        />
      )}
      {activeView === "network-usage" && (
        <NetworkUsagePage onBack={handleBackToDataAndStorage} />
      )}
      {activeView === "chat-cameron" && (
        <ChatUserPage onBack={handleBackToDataAndStorage} />
      )}
      {activeView === "chat-lucas" && (
        <ChatUserPage onBack={handleBackToDataAndStorage} />
      )}
    </div>
  );
}
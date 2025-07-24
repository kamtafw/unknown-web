"use client";

import { useState } from "react";
import ProfilePage from "./profile";
import FollowersPage from "./followers";
import FollowingPage from "./following";
import ConnectionsPage from "./connections";
import GetVerifiedPage from "./get-verified";
import EditProfilePage from "./Edit-Profile/edit-profile";
import EditNamePage from "./profile-fields/edit-name";
import EditUsernamePage from "./profile-fields/edit-username";
import EditBioPage from "./profile-fields/edit-bio";
import AddLinkPage from "./profile-fields/add-link";
import SetLocationPage from "./profile-fields/SetLocation";
import EditLinkPage from "./profile-fields/EditPortfolio";

export default function EditPage() {
  const [activeView, setActiveView] = useState("followers");

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  return (
    <div className="flex flex-col w-full min-h-screen lg:flex-row lg:w-full">
      <ProfilePage
        onFollowersClick={() => handleViewChange("followers")}
        onFollowingClick={() => handleViewChange("following")}
        onConnectionsClick={() => handleViewChange("connections")}
        onVerifiedClick={() => handleViewChange("verified")}
        onEditProfileClick={() => handleViewChange("editProfile")}
      />
      {activeView === "followers" && <FollowersPage />}
      {activeView === "following" && <FollowingPage />}
      {activeView === "connections" && <ConnectionsPage />}
      {activeView === "verified" && <GetVerifiedPage />}
      {activeView === "editProfile" && <EditProfilePage onFieldEdit={handleViewChange} />}
      {activeView === "editName" && <EditNamePage onBack={() => handleViewChange("editProfile")} />}
      {activeView === "editUsername" && (
        <EditUsernamePage onBack={() => handleViewChange("editProfile")} />
      )}
      {activeView === "editBio" && <EditBioPage onBack={() => handleViewChange("editProfile")} />}
      {activeView === "addLink" && <AddLinkPage onBack={() => handleViewChange("editProfile")} />}
      {activeView === "setLocation" && (
        <SetLocationPage
          onBack={() => handleViewChange("editProfile")}
          onSave={() => handleViewChange("verified")}
        />
      )}
      {activeView === "editPortfolio" && (
        <EditLinkPage linkType="portfolio" onClose={() => handleViewChange("editProfile")} />
      )}
      {activeView === "editShoppingList" && (
        <EditLinkPage linkType="shoppingList" onClose={() => handleViewChange("editProfile")} />
      )}
    </div>
  );
}
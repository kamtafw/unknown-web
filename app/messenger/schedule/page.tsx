"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { IoAlarmSharp } from "react-icons/io5";
import { MdCall } from "react-icons/md";
import { AddMessageSchedulePopup } from "./AddMessageSchedulePopup";
import { AddReminderPopup } from "./AddReminderPopup";
import { AddCallReminderPopup } from "./AddCallReminderPopup";
import { ScheduleTabs } from "./ScheduleTabs";

export default function SchedulePage() {
  const [showMessageSchedulePopup, setShowMessageSchedulePopup] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [showCallReminderPopup, setShowCallReminderPopup] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="w-[480px] border-r bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <button 
            type="button"
            onClick={handleBack} 
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Create Schedule</h1>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowMessageSchedulePopup(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-medium">Add message schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReminderPopup(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <IoAlarmSharp className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-medium">Add reminder</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCallReminderPopup(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <MdCall className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-medium">Add call reminder</span>
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 p-6">
        <ScheduleTabs />
      </div>

      {/* Popups */}
      {showMessageSchedulePopup && (
        <AddMessageSchedulePopup onClose={() => setShowMessageSchedulePopup(false)} />
      )}
      {showReminderPopup && (
        <AddReminderPopup onClose={() => setShowReminderPopup(false)} />
      )}
      {showCallReminderPopup && (
        <AddCallReminderPopup onClose={() => setShowCallReminderPopup(false)} />
      )}
    </div>
  );
}


// export default function SchedulePage() {
//   return <div>Schedule page works</div>;
// }
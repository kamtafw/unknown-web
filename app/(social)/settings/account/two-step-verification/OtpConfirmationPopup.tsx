import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSwitchOtpDefault } from "../../../../../services/auth/useUserAuthService";
import { useAuthStore } from "@/store/userStore";

interface OtpConfirmationPopupProps {
  onClose: () => void;
  onConfirm?: () => void;
}

export default function OtpConfirmationPopup({
  onClose,
  onConfirm,
}: OtpConfirmationPopupProps) {
  const switchOtpMutation = useSwitchOtpDefault();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const userEmail = user?.user?.email || user?.email;


  const handleConfirm = () => {

    if (!userEmail) {
      toast.error("User email not found", {
        style: { background: "red", color: "white" },
      });
      return;
    }

    switchOtpMutation.mutate(
      {
        identifier: userEmail,
        otp_default: "email",
      },
      {
        onSuccess: () => {

          const currentUser = useAuthStore.getState().user;
          setUser({
            ...currentUser,
            otp_default: "email",
            user: {
              ...currentUser?.user,
              otp_default: "email",
            },
          });

          if (onConfirm) {
            onConfirm();
          }
          onClose();
        },
        onError: (error) => {
          console.log("❌ API Error:", error);
        },
      }
    );
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Confirm you want to use OTP Verification for 2FA
        </h2>

        <div className="flex gap-4 justify-end">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            disabled={switchOtpMutation.isPending}
          >
            Close
          </Button>
          <Button
            onClick={handleConfirm}
            variant="ghost"
            className="text-[#2e4377] hover:text-[#425483] font-semibold"
            disabled={switchOtpMutation.isPending}
          >
            {switchOtpMutation.isPending ? "Setting up..." : "Yes, Use OTP"}
          </Button>
        </div>
      </div>
    </div>
  );
}

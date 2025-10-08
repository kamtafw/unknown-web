/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect } from "react";

import AppComboLogo from "@/assets/appcombohallogo.svg";
import Link from "next/link";
import CustomLoader from "@/components/shared/Loader/CustomLoader";
import { payload } from "./SignupFormModule";
import { UseMutateFunction } from "@tanstack/react-query";
import { SignupPayload } from "@/types/signup/user";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface CompProps {
  displayConfirmation: boolean;
  setDisplayConfirmation: Dispatch<SetStateAction<boolean>>;
  isPending: boolean;
  formData: payload;
  mutate: UseMutateFunction<any, any, SignupPayload, unknown>;
  error: any;
}


const SignupConfirmationModule = ({
  displayConfirmation,
  setDisplayConfirmation,
  isPending,
  formData,
  mutate,
  error,
}: CompProps) => {
  const handleSignup = () => {
    mutate(formData);
  };

  useEffect(() => {
    if (error) {

      const emailError =
        error?.response?.data?.errors?.email || error?.errors?.email;
      const phoneError =
        error?.response?.data?.errors?.phone_number ||
        error?.errors?.phone_number;

      if (emailError) {
        toast.error(
          `${emailError?.message || emailError}. Please login instead.`,
          {
            style: { background: "red", color: "white" },
          }
        );
        setDisplayConfirmation(false);
      } else if (phoneError) {
        toast.error(
          `${phoneError?.message || phoneError}.`,
          {
            style: { background: "red", color: "white" },
          }
        );
        setDisplayConfirmation(false);
      } else if (error?.response?.data?.message) {
        toast.error(`${error.response.data.message}. Please login instead.`, {
          style: { background: "red", color: "white" },
        });
        setDisplayConfirmation(false);
      }
    }
  }, [error, setDisplayConfirmation]);

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={displayConfirmation} onOpenChange={setDisplayConfirmation}>
        <DialogContent className="sm:max-w-md sm:w-[640px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-0">
              <Image
                src={AppComboLogo}
                alt="App Combo"
                width={50}
                height={100}
                className=" h-[34px]"
              />
              <span className="text-[#111827] text-2xl font-medium">
                <span className="font-bold text-[#6A88D1]">Apps</span>combo
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center ">
            <span className="text-base font-medium text-[#111827] text-center">
              By signing up with Appscombo, you have agreed to our{" "}
              <Link href="#" className="font-semibold text-[#6A88D1]">
                terms and agreement
              </Link>
              , with{" "}
              <Link href="#" className="font-semibold text-[#6A88D1]">
                Privacy Policy
              </Link>
              .
            </span>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              onClick={handleSignup}
              className="py-[14px] flex items-center justify-center bg-[#6A88D1] rounded-[12px] text-[#FFFFFF] text-base font-semibold h-[52px] hover:bg-[#425483] w-full max-w-[384px]"
            >
              {isPending ? <CustomLoader /> : "Continue to sign up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignupConfirmationModule;

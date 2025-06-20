"use client";
import { useNotifications } from "@/hooks/use-notifications";
import React from "react";
import { Toaster } from "react-hot-toast";

export default function NotificationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotifications();
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </>
  );
}

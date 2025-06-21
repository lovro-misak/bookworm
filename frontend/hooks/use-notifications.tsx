"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useNotifications() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    //const socket = new WebSocket(`ws://localhost:8080?token=${token}`);
    const socket = new WebSocket(
      `wss://bookworm-uahr.onrender.com:10000?token=${token}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const message = event.data;
      console.log("Message received:", message);
      toast.custom((t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
          }}
          className="max-w-sm mx-auto bg-bone border border-bone px-4 py-3 rounded-md shadow cursor-pointer transition"
        >
          <p className="text-blackolive font-medium">{message}</p>
        </div>
      ));
    };

    socket.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    socket.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    return () => {
      console.log("Cleaning up WebSocket");
      socket.close();
    };
  }, []);
}

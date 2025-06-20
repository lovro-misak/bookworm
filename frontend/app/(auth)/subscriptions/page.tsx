"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/api";
import { Sub } from "@/components/ui/sub";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type TopicFormData = {
  topic: string;
};

export default function SubPage() {
  const useGetUser = () => {
    const router = useRouter();
    return useQuery({
      queryKey: ["person"],
      retry: false,
      queryFn: async () => {
        const [data, status] = await apiCall("/auth", { method: "GET" });
        if (status !== 200) {
          router.push("/");
          return null;
        }
        return data;
      },
    });
  };
  useGetUser();

  const queryClient = useQueryClient();

  const subs = useQuery({
    queryKey: ["subs"],
    queryFn: () => apiCall(`/subs/subscriptions`, { method: "GET" }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  console.log("subs: ", subs);

  const [topic, setTopic] = useState("");

  const form = useForm<TopicFormData>({
    defaultValues: {
      topic: topic || "",
    },
  });

  const handleTopic = async (data: TopicFormData) => {
    console.log("Data: ", JSON.stringify(data));
    const response = await apiCall("/subs/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response: ", response);
    if (response?.[1] === 200) {
      await queryClient.invalidateQueries({ queryKey: ["subs"] });
    }
  };

  return (
    <>
      <div className="bg-skyblue">
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col items-center w-screen">
            <div className="sticky top-0 left-0 z-50 self-start p-1">
              <SidebarTrigger />
            </div>
            <div className="flex flex-col items-center m-10">
              <div className="flex w-xl">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleTopic)}
                    className="grid gap-4 py-4"
                  >
                    <div className="flex w-xl">
                      <Input
                        id="subscribe"
                        placeholder="Subscribe to title, author or genre"
                        {...form.register("topic")}
                        className="bg-bone text-blackolive font-raleway mr-5"
                      />
                      <Button
                        type="submit"
                        className="rounded-full bg-blackolive text-bone px-4 py-2 mr-2.5 font-raleway"
                      >
                        Subscribe
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
              {subs.data?.[0].length > 0 ? (
                subs.data?.[0].map((sub: any) => (
                  <Sub
                    key={sub.id}
                    id={sub.id}
                    userid={sub.userid}
                    topic={sub.topic}
                  />
                ))
              ) : (
                <p className="font-raleway text-blackolive">
                  No subscriptions yet.
                </p>
              )}
            </div>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}

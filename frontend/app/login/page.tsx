"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const form = useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  return (
    <>
      <div className="flex flex-col bg-skyblue justify-center items-center h-screen">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-6xl font-raleway text-blackolive mb-5">
            BOOKWORM
          </h1>
          <h1 className="text-3xl mb-20">Welcome back!</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              setIsLoading(true);
              setError(false);
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                  "Content-Type": "application/json",
                },
              })
                .then(async (res) => {
                  console.log(res.status);
                  if (res.status === 401) {
                    console.log("here");
                    setError(true);
                  }
                  if (res.status === 200) {
                    const response = await res.json();
                    if (response.token) {
                      localStorage.setItem("token", response.token);
                      router.push("/homepage");
                    }
                  }
                })
                /*.then((response) => {
                  console.log(response);
                  if (response.status === 401) {
                    setError(true);
                  }
                  if (response.token) {
                    localStorage.setItem("token", response.token);
                    router.push("/homepage");
                  }
                })*/
                .catch((err) => console.error(err));
            })}
            className="bg-bone shadow-lg rounded-2xl px-10 py-8 flex flex-col items-center"
          >
            <h2 className="text-3xl mb-5 font-raleway">Login</h2>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter username"
                      {...field}
                      className="outline-solid"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    {/* <Input
                      placeholder="Enter password"
                      {...field}
                      className="outline-solid"
                    /> */}
                    <input
                      type="password"
                      className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        "outline-solid"
                      )}
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="font-raleway text-red-500 mb-3">
                Incorrect username or password
              </p>
            )}
            {isLoading ? (
              <Button className="rounded-full bg-blackolive text-xl text-bone px-4 py-2 mr-2.5">
                Loading...
              </Button>
            ) : (
              <Button className="rounded-full bg-blackolive text-xl text-bone px-4 py-2 mr-2.5">
                Submit
              </Button>
            )}
          </form>
        </Form>
      </div>
    </>
  );
}

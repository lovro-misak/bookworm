"use client";
import React, { useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiCall } from "@/api";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Book } from "@/components/ui/book";

export default function ProfilePage() {
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

  const router = useRouter();
  const userQuery = useGetUser();
  useEffect(() => {
    if (userQuery.data) {
      setfirstName(userQuery.data.firstname || "");
      setlastName(userQuery.data.lastname || "");
      setEmail(userQuery.data.email || "");
      setuserName(userQuery.data.username || "");
      setBio(userQuery.data.bio || "[no bio yet]");
      setprofilePicture(
        `${process.env.NEXT_PUBLIC_API_URL}${userQuery.data.profilepicture}` ||
          ""
      );
      console.log("Profile picture: ", userQuery.data.profilepicture);
    }
  }, [userQuery.data]);
  const [firstname, setfirstName] = useState("");
  const [lastname, setlastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setuserName] = useState("");
  const [bio, setBio] = useState("");
  const [profilepicture, setprofilePicture] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const posts = useQuery({
    queryKey: ["posted"],
    queryFn: () => apiCall(`/books/posts/`, { method: "GET" }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  console.log("Posts data: ", posts.data);

  const formSchema = z.object({
    firstname: z.string().min(1, "Please type in a first name"),
    lastname: z.string().min(1, "Please type in a last name"),
    email: z.string().email("Invalid e-mail address"),
    username: z.string().min(3, "Must be at least 3 characters"),
    bio: z.string().min(0, "Please type in a bio"),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: firstname || "",
      lastname: lastname || "",
      bio: bio || "",
      username: username || "",
      email: email || "",
    },
  });
  const handleSubmit = async (data: FormData) => {
    console.log("Data: ", JSON.stringify(data));
    const response = await apiCall("/update/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response: ", response);
    if (response?.[1] === 409) {
      if (response?.[0].message == "Username is already taken") {
        form.setError("username", {
          type: "manual",
          message: "This username is already taken",
        });
        return;
      } else if (response?.[0].message == "E-mail is already taken") {
        form.setError("email", {
          type: "manual",
          message: "This email is already taken",
        });
        return;
      }
    }
    if (response?.[1] === 200) {
      setSuccessMessage("Profile successfully updated!");
      await userQuery.refetch();
      router.refresh();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const imgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("here");
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File ", file);

    const formData = new FormData();
    formData.append("profilepicture", file);

    console.log("Form data: ", formData);

    try {
      const response = await apiCall("/update/picture", {
        method: "PATCH",
        body: formData,
      });
      console.log("Response: ", response);
      if (response?.[1] === 200) {
        await userQuery.refetch();
        router.refresh();
      }
    } catch (error) {
      console.error(error);
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
              <div
                className="cursor-pointer hover:opacity-50"
                onClick={handleAvatarClick}
              >
                <Avatar className="w-50 h-50">
                  <AvatarImage src={profilepicture} alt="profile picture" />
                  <AvatarFallback className="bg-moonstone text-7xl">
                    {firstname.substring(0, 1)}
                    {lastname.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={imgUpload}
                className="hidden"
              />
              <h2 className="font-bold mt-5 font-raleway">First name:</h2>
              <h1 className="text-4xl font-raleway">{firstname || ""}</h1>
              <h2 className="font-bold mt-5 font-raleway">Last name:</h2>
              <h1 className="text-4xl font-raleway">{lastname || ""}</h1>
              <h2 className="font-bold mt-5 font-raleway">Bio:</h2>
              <h1 className="text-4xl font-raleway">{bio}</h1>
              <h2 className="font-bold mt-5 font-raleway">Username:</h2>
              <h1 className="text-4xl font-raleway">{username || ""}</h1>
              <h2 className="font-bold mt-5 font-raleway">email:</h2>
              <h1 className="text-4xl font-raleway">{email || ""}</h1>

              <Dialog>
                <DialogTrigger className="rounded-full bg-blackolive font-raleway text-xl text-bone px-4 py-2 mr-2.5 mt-5">
                  Edit profile
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-bone">
                  <DialogHeader>
                    <DialogTitle className="font-raleway">
                      Edit profile
                    </DialogTitle>
                    <DialogDescription className="font-raleway">
                      Update your profile data.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="firstname"
                            className="text-right font-raleway"
                          >
                            First name
                          </Label>
                          <Input
                            id="firstname"
                            placeholder={firstname}
                            {...form.register("firstname")}
                            className="col-span-3 font-raleway"
                          />
                          {form.formState.errors.firstname && (
                            <div className="col-span-4">
                              <h3 className="text-red-500 font-raleway">
                                {form.formState.errors.firstname.message}
                              </h3>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="lastname"
                            className="text-right font-raleway"
                          >
                            Last name
                          </Label>
                          <Input
                            id="lastname"
                            placeholder={lastname}
                            {...form.register("lastname")}
                            className="col-span-3 font-raleway"
                          />
                          {form.formState.errors.lastname && (
                            <div className="col-span-4">
                              <h3 className="text-red-500 font-raleway">
                                {form.formState.errors.lastname.message}
                              </h3>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="bio"
                            className="text-right font-raleway"
                          >
                            Bio
                          </Label>
                          <Input
                            id="bio"
                            placeholder={bio}
                            {...form.register("bio")}
                            className="col-span-3 font-raleway"
                          />
                          {form.formState.errors.bio && (
                            <div className="col-span-4">
                              <h3 className="text-red-500 font-raleway">
                                {form.formState.errors.bio.message}
                              </h3>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="username"
                            className="text-right font-raleway"
                          >
                            Username
                          </Label>
                          <Input
                            id="username"
                            placeholder={username}
                            {...form.register("username")}
                            className="col-span-3 font-raleway"
                          />
                          {form.formState.errors.username && (
                            <div className="col-span-4">
                              <h3 className="text-red-500 font-raleway">
                                {form.formState.errors.username.message}
                              </h3>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="email"
                            className="text-right font-raleway"
                          >
                            email
                          </Label>
                          <Input
                            id="email"
                            placeholder={email}
                            {...form.register("email")}
                            className="col-span-3 font-raleway"
                          />
                          {form.formState.errors.email && (
                            <div className="col-span-4">
                              <h3 className="text-red-500 font-raleway">
                                {form.formState.errors.email.message}
                              </h3>
                            </div>
                          )}
                        </div>
                      </div>
                      {successMessage && (
                        <div>
                          <h3 className="text-green-500 font-raleway">
                            {successMessage}
                          </h3>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="rounded-full bg-blackolive text-bone px-4 py-2 mr-2.5"
                        >
                          Save changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col items-center justify-center w-full">
              <h1 className="font-raleway text-blackolive font-bold">
                Posted books
              </h1>
              <div className="w-[94%] sm:w-[70%] md:w-[62%] lg:w-[43%] h-auto rounded-lg flex flex-col justify-center items-center pt-3 mb-3">
                {posts.data?.[0].length > 0 ? (
                  posts.data?.[0].map((book: any) => (
                    <Book
                      key={book.idbook}
                      id={book.idbook}
                      title={book.title}
                      author={book.author}
                      genre={book.genre}
                      owner={book.username}
                      email={book.email}
                      imageUrl={book.coverimage}
                    />
                  ))
                ) : (
                  <p className="font-raleway text-blackolive">
                    No posted books yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}

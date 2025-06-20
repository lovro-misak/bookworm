"use client";
import { IoMdHeart, IoIosSend } from "react-icons/io";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiCall } from "@/api";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

type BookProps = {
  id: string;
  title: string;
  author: string;
  genre: string;
  owner: string;
  email: string;
  imageUrl: string;
};

type RequestFormData = {
  idbook: string;
  message: string;
};

export function Book({
  id,
  title,
  author,
  genre,
  owner,
  email,
  imageUrl,
}: BookProps) {
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiCall(`/books/addwishlist/${id}`, {
        method: "POST",
        body: JSON.stringify(id),
      });
    },
    onSuccess: () => {
      console.log("Book added to wishlist!");
      setAlert(true);
    },
    onError: (error) => {
      console.error("Failed to add to wishlist", error);
    },
  });

  const form = useForm<RequestFormData>({
    defaultValues: {
      idbook: id || "",
      message: message || "",
    },
  });

  const handleRequest = async (data: RequestFormData) => {
    console.log("Data: ", JSON.stringify(data));
    const response = await apiCall("/request/send", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response: ", response);
    if (response?.[1] === 200) {
      setSuccessMessage("Request successfully sent!");
    }
  };

  return (
    <Card className="bg-bone rounded-xl p-4 w-full min-w-2xl flex justify-between shadow-md mb-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center">
          {imageUrl && imageUrl !== "" ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
              alt="cover image"
              className="min-h-48 min-w-32 max-h-48 max-w-32 object-cover rounded-md border border-gray-300 mr-10"
            ></img>
          ) : (
            <div className="min-h-48 min-w-32 max-h-48 max-w-32 object-cover rounded-md border border-gray-300 mr-10 bg-moonstone flex items-center justify-around">
              <h1 className="font-raleway text-blackolive">No cover image</h1>
            </div>
          )}
          <div className="flex flex-col justify-between">
            <div className="flex flex-col">
              <h1 className="font-raleway text-blackolive text-3xl font-semibold">
                {title}
              </h1>
              <h2 className="font-raleway text-blackolive text-xl">{author}</h2>
              <h2 className="font-raleway text-blackolive text-xl">{genre}</h2>
            </div>
            <div className="flex-flex-col mr-10">
              <h1 className="font-raleway text-blackolive text-lg font-semibold">
                {owner}
              </h1>
              <h1 className="font-raleway text-blackolive text-lg">{email}</h1>
            </div>
          </div>
        </div>
        <TooltipProvider>
          <div className="flex items-center">
            {/*<Tooltip>
              <TooltipTrigger
                onClick={() => {
                  addToWishlistMutation.mutate();
                }}
                className="text-blackolive hover:bg-bone transition bg-bone"
                aria-label="Toggle Wishlist"
                asChild
              >
                <IoMdHeart className="w-10 h-10 text-blackolive mr-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to wishlist</p>
              </TooltipContent>
            </Tooltip>*/}
            <Tooltip>
              <TooltipTrigger
                className="text-blackolive hover:bg-bone transition bg-bone"
                aria-label="Send request"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <IoIosSend className="w-10 h-10 text-blackolive" />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-bone">
                    <DialogHeader>
                      <DialogTitle className="font-raleway">
                        Send a request for this book
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleRequest)}
                        className="grid gap-4 py-4"
                      >
                        <Input
                          type="hidden"
                          value={id}
                          {...form.register("idbook")}
                        />
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="message"
                            className="text-right font-raleway"
                          >
                            Message
                          </Label>
                          <Input
                            id="message"
                            placeholder="Message (optional)"
                            {...form.register("message")}
                            className="col-span-3 font-raleway"
                          />
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
                            className="rounded-full bg-blackolive text-bone px-4 py-2 mr-2.5 font-raleway"
                          >
                            Send request
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send request</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      {/*{alert && (
        <p className="font-raleway text-blackolive">Book added to wishlist!</p>
      )}*/}
    </Card>
  );
}

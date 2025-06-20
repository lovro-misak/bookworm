"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Command, CommandInput } from "@/components/ui/command";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Book } from "@/components/ui/book";
import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/api";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BookFormData = {
  book: string;
  author: string;
  genre: string;
};

const formSchema = z.object({
  book: z.string().min(1, "Please type in a book title"),
  author: z.string().min(1, "Please type in an author"),
  genre: z.string().min(1, "Please type in a genre"),
  coverImage: z.any(),
});

type NewBookFormData = z.infer<typeof formSchema>;

export default function HomePage() {
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

  const books = useQuery({
    queryKey: ["posts"],
    queryFn: () => apiCall(`/books`, { method: "GET" }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  console.log("Books data: ", books.data);

  const foryou = useQuery({
    queryKey: ["foryou"],
    queryFn: () => apiCall(`/books/foryou`, { method: "GET" }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  console.log("for you books: ", foryou.data);

  const [book, setBook] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<BookFormData>({
    defaultValues: {
      book: book || "",
      author: author || "",
      genre: genre || "",
    },
  });

  const newBookForm = useForm<NewBookFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: book || "",
      author: author || "",
      genre: genre || "",
      coverImage: undefined,
    },
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  const handlePost = async (data: NewBookFormData) => {
    const imageFile = data.coverImage?.[0];

    const formData = new FormData();
    formData.append("book", data.book);
    formData.append("author", data.author);
    console.log("Genre: ", data.genre);
    formData.append("genre", data.genre);

    if (imageFile) {
      console.log("cover image", imageFile);
      formData.append("coverimage", imageFile);
      console.log("formData: ", formData);
    }

    const response = await apiCall("/books/post", {
      method: "POST",
      body: formData,
    });
    console.log("Response: ", response);
    if (response?.[1] === 200) {
      setSuccessMessage("Book posted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
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
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => {
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/search`, {
                      method: "POST",
                      body: JSON.stringify(data),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    })
                      .then((res) => res.json())
                      .then((response) => {
                        console.log("Response: ", response);
                        setSearchResults(response);
                      })
                      .catch((err) => console.error(err));
                  })}
                >
                  <div className="flex mb-5">
                    <Controller
                      control={form.control}
                      name="book"
                      render={({ field }) => (
                        <Command className="bg-bone mr-5">
                          <CommandInput
                            placeholder="Search for a book..."
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Command>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <Command className="bg-bone mr-5">
                          <CommandInput
                            placeholder="Search for an author..."
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Command>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <Command className="bg-bone mr-5">
                          <CommandInput
                            placeholder="Search for a genre..."
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Command>
                      )}
                    />
                    {searchResults && (
                      <Button
                        className="rounded-full bg-blackolive font-raleway text-bone px-4 py-2 ml-5"
                        onClick={() => setSearchResults(null)}
                      >
                        Reset search
                      </Button>
                    )}
                    {!searchResults && (
                      <Button className="rounded-full bg-blackolive font-raleway text-bone px-4 py-2 ml-5">
                        Search
                      </Button>
                    )}
                  </div>
                </form>
              </Form>

              <div className="flex mb-5">
                <Dialog>
                  <DialogTrigger className="rounded-full bg-blackolive font-raleway text-bone px-4 py-2 mr-2.5">
                    Post a book
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-bone">
                    <DialogHeader>
                      <DialogTitle className="font-raleway">
                        Post a book
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...newBookForm}>
                      <form onSubmit={newBookForm.handleSubmit(handlePost)}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="title"
                              className="text-right font-raleway"
                            >
                              Title
                            </Label>
                            <Input
                              id="title"
                              placeholder="Title"
                              {...newBookForm.register("book")}
                              className="col-span-3 font-raleway"
                            />
                            {newBookForm.formState.errors.book && (
                              <div className="col-span-4">
                                <h3 className="text-red-500 font-raleway">
                                  {newBookForm.formState.errors.book.message}
                                </h3>
                              </div>
                            )}
                            <Label
                              htmlFor="author"
                              className="text-right font-raleway"
                            >
                              Author
                            </Label>
                            <Input
                              id="author"
                              placeholder="Author"
                              {...newBookForm.register("author")}
                              className="col-span-3 font-raleway"
                            />
                            {newBookForm.formState.errors.author && (
                              <div className="col-span-4">
                                <h3 className="text-red-500 font-raleway">
                                  {newBookForm.formState.errors.author.message}
                                </h3>
                              </div>
                            )}
                            <Label
                              htmlFor="Genre"
                              className="text-right font-raleway"
                            >
                              Genre
                            </Label>
                            {/*<Controller
                              control={newBookForm.control}
                              name="genre"
                              render={({ field }) => (
                                <Combobox
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              )}
                            />*/}
                            <Input
                              id="genre"
                              placeholder="Genre"
                              {...newBookForm.register("genre")}
                              className="col-span-3 font-raleway"
                            />
                            {newBookForm.formState.errors.genre && (
                              <div className="col-span-4">
                                <h3 className="text-red-500 font-raleway">
                                  {newBookForm.formState.errors.genre.message}
                                </h3>
                              </div>
                            )}
                            {/*<div className="col-span-2"></div>*/}
                            <Label htmlFor="Genre" className="font-raleway">
                              Cover image
                            </Label>
                            <Input
                              id="coverimage"
                              {...newBookForm.register("coverImage")}
                              type="file"
                              accept="image/*"
                              className="font-raleway text-blackolive col-span-3"
                            />
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
                            className="rounded-full bg-blackolive text-bone px-4 py-2 mr-2.5 font-raleway"
                          >
                            Post
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs
                defaultValue="foryou"
                className="font-raleway text-blackolive w-full"
              >
                <TabsList className="bg-bone grid w-full grid-cols-2">
                  <TabsTrigger value="foryou">For you</TabsTrigger>
                  <TabsTrigger value="all">All books</TabsTrigger>
                </TabsList>
                <TabsContent value="foryou">
                  <div className="flex justify-center w-full">
                    <div className="w-[94%] sm:w-[70%] md:w-[62%] lg:w-[43%] h-auto rounded-lg flex flex-col justify-center items-center pt-3 mb-3">
                      {(searchResults && foryou.data
                        ? searchResults.filter((book: any) =>
                            foryou.data.some(
                              (f: any) => f.idbook === book.idbook
                            )
                          )
                        : foryou.data ?? []
                      ).length > 0 ? (
                        (searchResults && foryou.data
                          ? searchResults.filter((book: any) =>
                              foryou.data.some(
                                (f: any) => f.idbook === book.idbook
                              )
                            )
                          : foryou.data?.[0] ?? []
                        ).map((book: any) => (
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
                          No books available.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="all">
                  <div className="flex justify-center w-full">
                    <div className="w-[94%] sm:w-[70%] md:w-[62%] lg:w-[43%] h-auto rounded-lg flex flex-col justify-center items-center pt-3 mb-3">
                      {(searchResults?.length ?? books.data?.[0]?.length ?? 0) >
                      0 ? (
                        (searchResults ?? books.data?.[0]).map((book: any) => (
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
                          No books available.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}

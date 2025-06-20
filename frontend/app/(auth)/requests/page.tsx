"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book } from "@/components/ui/book";
import { Request } from "@/components/ui/request";
import { ReceivedRequest } from "@/components/ui/receivedRequest";
import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/api";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
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

  const wishlist = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => apiCall(`/books/wishlist/`, { method: "GET" }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  console.log("Wishlist data: ", wishlist.data);

  const sent = useQuery({
    queryKey: ["sent"],
    queryFn: () => apiCall(`/books/sent/`, { method: "GET" }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  console.log("Sent data: ", sent.data);

  const received = useQuery({
    queryKey: ["received"],
    queryFn: () => apiCall(`/books/received/`, { method: "GET" }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  console.log("Received data: ", received.data);

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
              <Tabs
                defaultValue="sent"
                className="font-raleway text-blackolive w-full"
              >
                <TabsList className="bg-bone grid w-full grid-cols-2">
                  {/*<TabsTrigger value="wishlist">Wishlist</TabsTrigger>*/}
                  <TabsTrigger value="sent">Sent requests</TabsTrigger>
                  <TabsTrigger value="received">Received requests</TabsTrigger>
                </TabsList>
                {/*<TabsContent value="wishlist">
                  <div className="flex justify-center w-full">
                    <div className="w-[94%] sm:w-[70%] md:w-[62%] lg:w-[43%] h-auto rounded-lg flex flex-col justify-center items-center pt-3 mb-3">
                      {wishlist.data?.[0].length > 0 ? (
                        wishlist.data?.[0].map((book: any) => (
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
                          No wishlists yet.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>*/}
                <TabsContent value="sent">
                  <div className="flex justify-center w-full">
                    <div className="w-[94%] sm:w-[70%] md:w-[62%] lg:w-[43%] h-auto rounded-lg flex flex-col justify-center items-center pt-3 mb-3">
                      {sent.data?.[0].length > 0 ? (
                        sent.data?.[0].map((book: any) => (
                          <Request
                            key={book.idbook}
                            id={book.idbook}
                            title={book.title}
                            author={book.author}
                            genre={book.genre}
                            owner={book.username}
                            email={book.email}
                            imageUrl={book.coverimage}
                            status={book.statusreq}
                            message={book.message}
                          />
                        ))
                      ) : (
                        <p className="font-raleway text-blackolive">
                          No sent requests yet.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="received">
                  <div className="flex justify-center w-full">
                    <div className="w-[94%] sm:w-[70%] md:w-[62%] lg:w-[43%] h-auto rounded-lg flex flex-col justify-center items-center pt-3 mb-3">
                      {received.data?.[0].length > 0 ? (
                        received.data?.[0].map((book: any) => (
                          <ReceivedRequest
                            key={book.idbook}
                            requestid={book.id}
                            id={book.idbook}
                            title={book.title}
                            author={book.author}
                            genre={book.genre}
                            owner={book.username}
                            email={book.email}
                            imageUrl={book.coverimage}
                            status={book.statusreq}
                            message={book.message}
                          />
                        ))
                      ) : (
                        <p className="font-raleway text-blackolive">
                          No received requests yet.
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

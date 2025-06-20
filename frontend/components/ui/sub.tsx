"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/api";

type SubProps = {
  id: string;
  userid: string;
  topic: string;
};

export function Sub({ id, userid, topic }: SubProps) {
  const queryClient = useQueryClient();

  const unsubMutation = useMutation({
    mutationFn: async () => {
      const response = await apiCall(`/subs/unsubscribe/${id}`, {
        method: "DELETE",
      });
      if (response?.[1] === 200) {
        await queryClient.invalidateQueries({ queryKey: ["subs"] });
      }
    },
    onSuccess: () => {
      console.log("Book added to wishlist!");
    },
    onError: (error) => {
      console.error("Failed to add to wishlist", error);
    },
  });

  return (
    <Card className="bg-bone mb-5">
      <div className="flex w-xl items-center justify-between p-3">
        <h1 className="font-raleway text-blackolive text-2xl">{topic}</h1>
        <Button
          onClick={() => {
            unsubMutation.mutate();
          }}
          className="rounded-full bg-blackolive text-bone px-4 py-2 mr-2.5 font-raleway"
        >
          Unsubscribe
        </Button>
      </div>
    </Card>
  );
}

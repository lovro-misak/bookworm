import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="flex flex-col bg-skyblue justify-center items-center h-screen">
        <div>
          <h1 className="text-9xl font-raleway text-blackolive mb-20">
            BOOKWORM
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-4xl font-raleway text-blackolive mb-5">
            Join us and start sharing your stories!
          </h1>
          <div>
            <Link href="/login">
              <Button className="rounded-full bg-blackolive text-xl text-bone px-4 py-2 mr-2.5">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-full bg-blackolive text-xl text-bone px-4 py-2 mr-2.5">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

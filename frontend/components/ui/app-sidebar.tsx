"use client";
import { Home, Inbox, LogOut, UserRound, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Home",
    url: "/homepage",
    icon: Home,
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: BookOpen,
  },
  {
    title: "Requests",
    url: "/requests",
    icon: Inbox,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserRound,
  },
];

export function AppSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-moonstone">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blackolive text-4xl mt-5 mb-5 font-raleway">
            BOOKWORM
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="text-blackolive mb-3"
                >
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <div className="app">
                        <item.icon size={30} />
                      </div>
                      <span className="font-raleway text-2xl">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-moonstone">
        <SidebarMenuButton
          className="text-blackolive mb-3"
          onClick={handleLogout}
        >
          <div className="app">
            <LogOut size={30} />
          </div>
          <span className="font-raleway text-2xl">Sign Out</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

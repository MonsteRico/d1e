"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { User } from "better-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { LoaderCircle, type LoaderIcon } from "lucide-react";

function UserDropdown({ user }: { user: User }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.image ?? ""}></AvatarImage>
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Button
          className="min-w-full"
          onClick={async () => {
            setSigningOut(true);
            await authClient.signOut();
            router.replace("/");
          }}
        >
          {signingOut ? <LoaderCircle className="animate-spin" /> : "Sign Out"}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserDropdown;

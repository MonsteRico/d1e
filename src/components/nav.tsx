import Link from "next/link";
import React from "react";
import SignInButton from "./sign-in-button";
import { getServerSession } from "@/lib/getServerSession";
import UserDropdown from "./user-dropdown";

async function Nav() {
  const session = await getServerSession();

  console.log(session);

  return (
    <nav className="flex flex-row justify-between border-b-4 p-4">
      <div className="flex gap-4 my-auto text-xl">
        <Link href="/">Home</Link>
        <Link href="/">Home</Link>
        <Link href="/">Home</Link>
        <Link href="/">Home</Link>
      </div>
      <div>
        {!session && <SignInButton />}
        {session && <UserDropdown user={session.user} />}
      </div>
    </nav>
  );
}

export default Nav;

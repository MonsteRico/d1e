import Link from "next/link";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import Nav from "@/components/nav";

export default async function HomePage() {
  return (
    <main className="flex flex-col">
      <Nav />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>HEJ</p>
      <Link href="/createAccount">Create account</Link>
    </div>
  );
}

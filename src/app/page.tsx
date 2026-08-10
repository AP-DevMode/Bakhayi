import Hero from "@/components/sections/hero/Hero";
import About from "@/components/sections/about/About";
import Rishikesh from "@/components/sections/rishikesh/Rishikesh";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <About />
      <Rishikesh />
    </main>
  );
}

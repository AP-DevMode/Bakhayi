import Hero from "@/components/sections/hero/Hero";
import About from "@/components/sections/about/About";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <About />
    </main>
  );
}

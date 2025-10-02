"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LiquidEther from "@/components/ui/liquid-ether";

const Page = () => {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#ebf1f4]">
      <div className="absolute inset-0">
        <LiquidEther
          autoDemo={true}
          autoIntensity={1.6}
          autoRampDuration={0.4}
          autoResumeDelay={400}
          autoSpeed={0.1}
          colors={["#BFDBFE", "#93C5FD", "#60A5FA"]}
          cursorSize={80}
          isBounce={false}
          isViscous={false}
          iterationsPoisson={16}
          iterationsViscous={16}
          mouseForce={18}
          resolution={0.4}
          takeoverDuration={0.2}
          viscous={25}
        />
      </div>

      <div className="relative z-10 mt-[100px] flex h-full sm:mt-[180px]">
        <div className="mx-auto w-full px-6 sm:w-[55vw]">
          <h1 className="bg-gradient-to-b from-neutral-800 to-neutral-600 bg-clip-text text-left font-bold text-5xl text-neutral-900 text-transparent leading-tight tracking-tight underline opacity-90 md:text-6xl lg:text-7xl xl:text-8xl">
            Never Copy &<br />
            Paste Again.
          </h1>
          <p className="my-6 text-left font-medium text-neutral-600 text-xl md:text-2xl">
            Witely is a browser extension that gives you the answers you need,
            even before you ask
          </p>

          <div className="flex flex-wrap justify-start gap-3">
            <Link href={"/login"}>
              <Button className="hidden sm:flex" size="lg" variant="outline">
                Sign in
              </Button>
            </Link>

            <Link href={"/login"}>
              <Button className="hidden sm:flex" size="lg" variant="default">
                Get Witely Today <ArrowRight size={32} />
              </Button>
            </Link>

            <Input
              className="w-full sm:hidden"
              placeholder="Enter your email"
              type="email"
            />

            <div className="w-full sm:hidden">
              <Button className="w-full sm:hidden" size="lg" variant="default">
                Email me Witely
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex">
          <div className="absolute bottom-80 left-1">
            <Image
              alt="C key"
              className="mb-8"
              height={120}
              src="/images/hero/c-btn-unlit.png"
              width={120}
            />
          </div>

          <div className="absolute bottom-45 left-20">
            <Image
              alt="Ctrl key"
              className="mb-8 animate-fade-out opacity-100 transition-opacity"
              height={120}
              src="/images/hero/ctrl-btn-unlit.png"
              width={120}
            />
          </div>

          <div className="absolute bottom-45 left-20">
            <Image
              alt="Ctrl key"
              className="-rotate-106 -translate-x-13 translate-y-5.5 animate-fade-in opacity-0 transition-opacity"
              height={230}
              src="/images/hero/ctrl-btn-lit.png"
              width={230}
            />
          </div>

          <div className="absolute right-40 bottom-90 animate-fade-out opacity-100 transition-opacity">
            <Image
              alt="Ctrl key"
              className="mb-8"
              height={120}
              src="/images/hero/ctrl-btn-unlit.png"
              width={120}
            />
          </div>

          <div className="-rotate-106 absolute right-40 bottom-90 translate-x-15 translate-y-8 animate-fade-in opacity-0 transition-opacity">
            <Image
              alt="Ctrl key"
              className="mb-8"
              height={230}
              src="/images/hero/ctrl-btn-lit.png"
              width={230}
            />
          </div>

          <div className="absolute right-5 bottom-120">
            <Image
              alt="V key"
              className="mb-8 animate-fade-out opacity-100 transition-opacity"
              height={110}
              src="/images/hero/v-btn-unlit.png"
              width={110}
            />
          </div>

          <div className="absolute right-5 bottom-120">
            <Image
              alt="V key"
              className="mb-8 translate-x-5 translate-y-11 rotate-13 animate-fade-in opacity-0 transition-opacity"
              height={200}
              src="/images/hero/v-btn-lit.png"
              width={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

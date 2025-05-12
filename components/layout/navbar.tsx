"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Gamepad2Icon, Trophy, Loader2Icon, LucideFileImage } from "lucide-react";
import { useState, useEffect } from 'react'


export default function NavBar() {
  const scrolled = useScroll(50);

  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
 
  useEffect(() => {
    fetch('/api/users/rating')
      .then((res) => res.json())
      .then((data) => {
        setData(data) 
        setLoading(false)
      })
  }, [])

  return (
    <>
      <div
        className={`fixed top-0 flex w-full justify-center ${
          scrolled
            ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
            : "bg-white/0"
        } z-30 transition-all`}
      >
        <div className="mx-5 flex h-16 w-full max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center font-display text-2xl">
            <Image
              src="/logo.png"
              alt="ratemepics logo"
              width="130"
              height="90"
              className="mr-2 rounded-sm"
            ></Image> 
            {/* <p>rateme pics</p> */}
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-full border border-black bg-black px-4 py-1.5 text-sm text-white transition-colors hover:bg-white hover:text-black">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              {/* Rating badge */}
              <div className="flex items-center gap-1 rounded-md px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                  <path d="M4 17v2" />
                  <path d="M5 18H3" />
                </svg>
                {isLoading ? (<span><Loader2Icon className="animate-spin h-5 w-5 text-white" /></span>) : (<span>{data}</span>)} 
              </div>

              {/* User button with dropdown */}
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Play"
                    labelIcon={<Gamepad2Icon className="h-4 w-4" />}
                    href="/"
                  />
                  <UserButton.Link
                    label="Join/Unjoin"
                    labelIcon={<LucideFileImage className="h-4 w-4" />}
                    href="/join"
                  />
                  <UserButton.Link
                    label="My Stats"
                    labelIcon={<Trophy className="h-4 w-4" />}
                    href="/stats"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>
        </div>
      </div>
    </>
  );
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { useSession } from "next-auth/react"

const Header: React.FC = () => {
  const { data: userSession } = useSession()

  const router = useRouter()

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleIsOpen = () => {
    setIsOpen((isOpen) => !isOpen)
  }

  return (
    <header className="bg-gray-50 p-6 h-20 flex">
      <nav className="container mx-auto flex justify-between items-center z-40">
        <Link className="text-2xl font-bold" href="/">
          0xDemocracy
        </Link>

        <div className="flex items-center gap-2">
          <AccountCircleIcon
            fontSize="large"
            className="cursor-pointer text-4xl"
            onClick={() => {
              if (userSession) {
                router.push("/profile")
              } else {
                router.push("/auth/signin")
              }
            }}
          />

          {isOpen ? (
            <CloseIcon
              onClick={handleIsOpen}
              className="md:hidden cursor-pointer text-4xl"
            />
          ) : (
            <MenuIcon
              onClick={handleIsOpen}
              className="md:hidden cursor-pointer text-4xl"
            />
          )}

          <ul className="hidden md:flex justify-center items-center absolute right-0 left-0 space-x-10 -z-50">
            <li className="hover:border-b-2 border-b-black ">
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li className="hover:border-b-2 border-b-black ">
              <Link href="/about">About</Link>
            </li>
            <li className="hover:border-b-2 border-b-black ">
              {userSession ? (
                <Link href="/contact">Contact Us</Link>
              ) : (
                <Link href="/auth/signin">Contact Us</Link>
              )}
            </li>
          </ul>

          {isOpen && (
            <>
              <nav className="md:hidden absolute top-20 left-0 w-full bg-black text-gray-50 shadow-md">
                <ul className="flex flex-col py-4 items-center space-y-3">
                  <li className="hover:border-b-2" onClick={handleIsOpen}>
                    <Link href="/dashboard">Dashboard</Link>
                  </li>
                  <li className="hover:border-b-2" onClick={handleIsOpen}>
                    <Link href="/about">About</Link>
                  </li>
                  <li className="hover:border-b-2" onClick={handleIsOpen}>
                    {userSession ? (
                      <Link href="/contact">Contact Us</Link>
                    ) : (
                      <Link href="/auth/signin">Contact Us</Link>
                    )}
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header

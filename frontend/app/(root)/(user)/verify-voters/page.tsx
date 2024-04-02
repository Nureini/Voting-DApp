"use client"

import { API_ENDPOINT_URL } from "@/constants"
import { User } from "@/typings"
import axios from "axios"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const VerifyVoters = () => {
  const router = useRouter()
  const { data: userSession } = useSession()
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false)

  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUserDetails = async () => {
      const response = await axios.get(
        `${API_ENDPOINT_URL}/user/${userSession?.user?.id}`
      )

      if ((response.data.user as User)?.admin) {
        setIsUserAdmin(true)
        return
      }
    }

    fetchUserDetails()

    if (isUserAdmin) {
      const fetchAllUsers = async () => {
        const response = await axios.get(`${API_ENDPOINT_URL}/user/`)
        setUsers(response.data.users)
      }

      fetchAllUsers()
    }
  }, [isUserAdmin, userSession])

  if (!isUserAdmin) return null

  return (
    <div className="flex flex-col p-6 sm:p-12 md:p-24">
      <Link
        href="/dashboard"
        className="text-white text-xl font-semibold mb-2 cursor-pointer"
      >
        CLICK HERE to return to previous page
      </Link>

      <section className="text-black bg-gray-50 p-4 rounded-md">
        <h1 className="text-2xl font-semibold mb-4">Verify Voters: </h1>
        {users.map((user, index) => {
          if (user.polygonAddress && user.userImage && user.userValidIdMethod)
            return (
              <div
                className="flex items-center justify-between border border-blue-600 rounded-md p-4"
                key={index}
              >
                <h3>User ID: {user._id}</h3>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold p-2 rounded"
                  onClick={() => router.push(`verify-voters/${user._id}`)}
                >
                  View
                </button>
              </div>
            )
        })}
      </section>
    </div>
  )
}

export default VerifyVoters

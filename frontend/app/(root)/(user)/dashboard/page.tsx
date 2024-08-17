"use client"

import { API_ENDPOINT_URL } from "@/constants"
import { User } from "@/typings"
import { useAccount, useReadContract } from "wagmi"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import RegisterVoter from "@/components/RegisterVoter"
import Elections from "@/components/Elections"
import { useRouter } from "next/navigation"
import VerifiedIcon from "@mui/icons-material/Verified"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { VoterRegistrationABI, VoterRegistrationAddress } from "@/contracts"

const Dashboard = () => {
  const router = useRouter()
  const { data: userSession } = useSession()
  const { isConnected } = useAccount()

  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false)

  const [polygonAddress, setPolygonAddress] = useState<string>("")
  const [userValidIdMethodExists, setUserValidIdMethodExists] =
    useState<boolean>(false)
  const [userImageExists, setUserImageExists] = useState<boolean>(false)

  useEffect(() => {
    const fetchUserDetails = async () => {
      const response = await axios.get(
        `${API_ENDPOINT_URL}/user/${userSession?.user?.id}`
      )

      if ((response.data.user as User)?.admin) {
        setIsUserAdmin(true)
      }

      if ((response.data.user as User)?.polygonAddress) {
        setPolygonAddress((response.data.user as User)?.polygonAddress)
      }

      if ((response.data.user as User)?.userValidIdMethod) {
        setUserValidIdMethodExists(true)
      }

      if ((response.data.user as User)?.userImage) {
        setUserImageExists(true)
      }
    }

    fetchUserDetails()
  }, [
    userSession,
    isConnected,
    isUserAdmin,
    userValidIdMethodExists,
    userImageExists,
    userSession,
  ])

  const { data: isRegisteredVoter } = useReadContract({
    address: VoterRegistrationAddress,
    abi: VoterRegistrationABI,
    functionName: "isRegisteredVoter",
    args: [polygonAddress],
  })

  return (
    <div className="flex flex-col p-6 sm:p-12 md:p-24">
      <section className="text-black bg-gray-50 p-4 rounded-md">
        {isUserAdmin && (
          <div className="flex flex-col">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg w-72 mt-1"
              onClick={() => router.push("verify-voters")}
            >
              Verify New Voters
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg w-72 mt-1"
              onClick={() => router.push("/election/create")}
            >
              Create New Election
            </button>
          </div>
        )}

        <h1 className="text-3xl font-bold capitalize mt-4">
          {userSession?.user?.name
            ? `Welcome to 0xDemocracy, ${userSession?.user?.name}`
            : " Welcome to 0xDemocracy"}
        </h1>

        {userSession &&
          (isRegisteredVoter ? (
            <>
              <div className="flex items-center text-md mb-2">
                <VerifiedIcon color="success" /> You are a registered voter
              </div>
            </>
          ) : (
            <RegisterVoter
              userValidIdMethodExists={userValidIdMethodExists}
              userImageExists={userImageExists}
            />
          ))}

        {userSession && (isRegisteredVoter as boolean) && (
          <>
            <ConnectButton
              label="CLICK HERE to Connect Wallet"
              showBalance={false}
            />
            <Elections />
          </>
        )}

        {!userSession && <Elections />}
      </section>
    </div>
  )
}

export default Dashboard

"use client"

import { API_ENDPOINT_URL } from "@/constants"
import { VoterRegistrationABI, VoterRegistrationAddress } from "@/contracts"
import { User } from "@/typings"
import axios from "axios"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

const Verify = () => {
  const { id } = useParams()
  const { data: userSession } = useSession()
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false)

  const [user, setUser] = useState<User>()

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string>("")

  const {
    writeContract,
    isError: isWriteContractError,
    error: writeContractError,
    data: writeContractData,
  } = useWriteContract()
  const { isSuccess: isTransactionSuccesful, isLoading: isTransactionLoading } =
    useWaitForTransactionReceipt({
      hash: writeContractData,
    })

  useEffect(() => {
    if (isTransactionSuccesful) {
      location.reload()
    } else if (isWriteContractError) {
      setErrMsg(writeContractError?.message!)
    }
  }, [isTransactionSuccesful, isWriteContractError])

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
      const fetchUserToVerify = async () => {
        const response = await axios.get(`${API_ENDPOINT_URL}/user/${id}`)
        setUser(response.data.user)
      }

      fetchUserToVerify()
    }
  }, [isUserAdmin, userSession])

  const { data: isRegisteredVoter } = useReadContract({
    address: VoterRegistrationAddress,
    abi: VoterRegistrationABI,
    functionName: "isRegisteredVoter",
    args: [user?.polygonAddress],
  })

  const handleRegisterToBlockchainBtn = async () => {
    writeContract({
      address: VoterRegistrationAddress,
      abi: VoterRegistrationABI,
      functionName: "registerVoter",
      args: [user?.polygonAddress],
    })
  }

  const handleUpdateDbForVerification = async () => {
    setSubmitting(true)
    await axios.patch(`${API_ENDPOINT_URL}/user/`, {
      id: user?._id,
      userValidIdMethod: null,
      userImage: null,
    })

    setSubmitting(false)
    location.reload()
  }

  const handleRejectBtn = async () => {
    setSubmitting(true)

    await axios.patch(`${API_ENDPOINT_URL}/user/`, {
      id: user?._id,
      userValidIdMethod: null,
      userImage: null,
      polygonAddress: null,
    })

    setSubmitting(false)
  }

  if (!isUserAdmin) return null

  return (
    <div className="flex flex-col p-6 sm:p-12 md:p-24">
      <Link
        href="/verify-voters"
        className="text-white text-xl font-semibold mb-2 cursor-pointer"
      >
        CLICK HERE to return to previous page
      </Link>
      <section className="text-black bg-gray-50 p-4 rounded-md">
        {errMsg && (
          <p className=" text-lg text-red-500 font-semibold text-center">
            {errMsg}
          </p>
        )}

        <h2 className="capitalize">User ID: {user?._id}</h2>
        <h3 className="capitalize">User Name: {user?.username}</h3>
        <h3 className="capitalize">
          Submitted Polygon Address: {user?.polygonAddress}
        </h3>

        {(isRegisteredVoter as boolean) && (
          <h3 className="text-green-600 font-bold text-2xl">
            User Is a Registered Voter
          </h3>
        )}

        {(!isRegisteredVoter as boolean) && (
          <>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div>
                <label className="font-semibold text-xl">Submitted ID: </label>
                <img
                  src={user?.userValidIdMethod}
                  alt={user?.username}
                  className="w-72 h-72 border border-black rounded-md object-contain"
                />
              </div>
              <div>
                <label className="font-semibold text-xl">
                  Submitted Image:{" "}
                </label>
                <img
                  src={user?.userImage}
                  alt={user?.username}
                  className="w-72 h-72 border border-black rounded-md object-contain"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold p-2 rounded mr-2"
              onClick={handleRegisterToBlockchainBtn}
              disabled={isTransactionLoading || (isRegisteredVoter as boolean)}
            >
              {isTransactionLoading ? "Submitting..." : "Verify Voter"}
            </button>

            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-gray-50 font-bold p-2 rounded"
              onClick={handleRejectBtn}
              disabled={
                submitting ||
                (!isRegisteredVoter as boolean) ||
                isTransactionLoading
              }
            >
              {submitting ? "Submitting..." : "Reject Voter"}
            </button>
          </>
        )}

        {user?.userImage &&
          user?.userValidIdMethod &&
          (isRegisteredVoter as boolean) && (
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold p-2 rounded mr-2"
              onClick={handleUpdateDbForVerification}
              disabled={
                submitting ||
                !user.userImage ||
                !user?.userValidIdMethod ||
                !isRegisteredVoter ||
                isTransactionLoading
              }
            >
              {submitting ? "Submitting..." : "Update Db"}
            </button>
          )}
      </section>
    </div>
  )
}
export default Verify

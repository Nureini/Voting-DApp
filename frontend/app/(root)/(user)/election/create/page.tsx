"use client"

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { VoteCreationNFTAddress, VoteCreationNFTABI } from "@/contracts"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { API_ENDPOINT_URL } from "@/constants"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { convertDateTimeToSeconds } from "@/lib/utils"

const Create = () => {
  const { data: userSession } = useSession()

  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false)

  const router = useRouter()

  const [successMsg, setSuccessMsg] = useState<string>("")
  const [errMsg, setErrMsg] = useState<string>("")

  const [electionName, setElectionName] = useState<string>("")
  const [electionDescription, setElectionDescription] = useState<string>("")
  const [electionStartTime, setElectionStartTime] = useState<string>("")
  const [electionEndTime, setElectionEndTime] = useState<string>("")
  const [electionChoices, setElectionChoices] = useState<string[]>([])

  const onChangeChoiceHandler = (index: number, value: string) => {
    setElectionChoices((prevChoices) => {
      const newChoices = [...prevChoices]
      newChoices[index] = value
      return newChoices
    })
  }

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
      setSuccessMsg("Your transaction was completed succesfully.")
      router.push("/dashboard")
    } else if (isWriteContractError) {
      setErrMsg(writeContractError?.message!)
    }
  }, [isTransactionSuccesful, isWriteContractError])

  const mintNft = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setErrMsg("")

    if (
      !electionName ||
      !electionDescription ||
      !electionStartTime ||
      !electionEndTime
    ) {
      setErrMsg("Error, you must fill in all fields")
      return
    }

    if (
      convertDateTimeToSeconds(electionEndTime) <
        convertDateTimeToSeconds(electionStartTime) ||
      convertDateTimeToSeconds(electionEndTime) ==
        convertDateTimeToSeconds(electionStartTime)
    ) {
      setErrMsg("Error, select valid start and end times!")
      return
    }

    if (electionChoices.length < 2) {
      setErrMsg("Error, you must select more choices (minimum 2)")
      return
    }

    if (convertDateTimeToSeconds(electionStartTime) < 0) {
      const newElectionStartTime = 0

      writeContract({
        address: VoteCreationNFTAddress,
        abi: VoteCreationNFTABI,
        functionName: "mintNft",
        args: [
          electionName,
          electionDescription,
          newElectionStartTime,
          convertDateTimeToSeconds(electionEndTime),
          electionChoices,
        ],
      })
    } else {
      writeContract({
        address: VoteCreationNFTAddress,
        abi: VoteCreationNFTABI,
        functionName: "mintNft",
        args: [
          electionName,
          electionDescription,
          convertDateTimeToSeconds(electionStartTime),
          convertDateTimeToSeconds(electionEndTime),
          electionChoices,
        ],
      })
    }
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      await axios
        .get(`${API_ENDPOINT_URL}/user/${userSession?.user?.id}`)
        .then((response) => {
          if (response.data.user) {
            if (response.data.user?.admin === true) {
              setIsUserAdmin(true)
              return
            } else {
              router.push("/dashboard")
              return
            }
          }
        })
    }

    fetchUserDetails()
  }, [userSession])

  if (!isUserAdmin) return null

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 sm:p-12 md:p-24">
      <Link
        href="/dashboard"
        className="text-white text-xl font-semibold mb-2 cursor-pointer"
      >
        CLICK HERE to return to previous page
      </Link>

      <section className="text-black bg-gray-50 p-4 rounded-md flex flex-col items-center justify-center md:w-1/2 w-full">
        <h1 className="text-3xl font-bold mb-4">Create a New Election</h1>

        <form className="flex flex-col items-start" onSubmit={mintNft}>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="name">Election Name:</label>
            <input
              className="bg-gray-50 text-black font-semibold border border-blue-600 rounded-md py-2 px-4 mb-4 w-full focus:outline-none"
              type="text"
              name="name"
              id="name"
              value={electionName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setElectionName(e.target.value)
              }
              placeholder="Enter election name"
              disabled={isTransactionLoading || isTransactionSuccesful}
            />
          </div>

          <div className="flex flex-col items-start w-full">
            <label htmlFor="description">Election description:</label>
            <textarea
              className="bg-gray-50 text-black font-semibold border border-blue-600 rounded-md py-2 px-4 mb-4 w-full resize-none focus:outline-none"
              id="description"
              name="description"
              rows={7}
              cols={50}
              value={electionDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setElectionDescription(e.target.value)
              }
              placeholder="Enter election description"
              required
              disabled={isTransactionLoading || isTransactionSuccesful}
            />
          </div>

          <div className="flex flex-col items-start w-full">
            <label htmlFor="startDate">Election Start Time</label>
            <input
              className="bg-gray-50 text-black font-semibold border border-blue-600 rounded-md py-2 px-4 mb-4 w-full focus:outline-none"
              type="datetime-local"
              name="startDate"
              id="startDate"
              value={electionStartTime}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setElectionStartTime(e.target.value)
              }
              placeholder="Enter Election Start Time"
              required
              disabled={isTransactionLoading || isTransactionSuccesful}
            />
          </div>

          <div className="flex flex-col items-start w-full">
            <label htmlFor="endDate">Election End Time:</label>
            <input
              className="bg-gray-50 text-black font-semibold border border-blue-600 rounded-md py-2 px-4 mb-4 w-full focus:outline-none"
              type="datetime-local"
              name="endDate"
              id="endDate"
              value={electionEndTime}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setElectionEndTime(e.target.value)
              }
              placeholder="Enter Election End Time"
              required
              disabled={isTransactionLoading || isTransactionSuccesful}
            />
          </div>

          <div className="flex flex-col items-start w-full mb-4">
            <label htmlFor="choices">Election Choices:</label>
            {electionChoices.map((choice, index) => (
              <div key={index} className="flex space-x-2 w-full mb-1">
                <input
                  type="text"
                  value={choice}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChangeChoiceHandler(index, e.target.value)
                  }
                  placeholder={`Choice ${index + 1}`}
                  className="bg-gray-50 text-black font-semibold border border-blue-600 rounded-md py-2 px-4 focus:outline-none w-3/4"
                  disabled={isTransactionLoading || isTransactionSuccesful}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setElectionChoices((prevChoices) =>
                      prevChoices.filter((_, i) => i !== index)
                    )
                  }
                  className="bg-red-500 hover:bg-red-600 text-gray-50 font-bold py-2 px-4 rounded-md w-1/4"
                  disabled={isTransactionLoading || isTransactionSuccesful}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setElectionChoices((prevChoices) => [...prevChoices, ""])
              }
              className="bg-green-500 hover:bg-green-600 text-gray-50 font-bold py-2 px-4 rounded-md mt-2"
              disabled={isTransactionLoading || isTransactionSuccesful}
            >
              Add New Choice
            </button>
          </div>

          {errMsg && (
            <p className="text-lg text-red-500 font-semibold text-center self-center mb-1">
              {errMsg}
            </p>
          )}

          {successMsg && (
            <p className=" text-lg text-green-500 font-semibold text-center self-center mb-1">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-md w-full"
            disabled={isTransactionLoading || isTransactionSuccesful}
          >
            {isTransactionLoading
              ? "Creating..."
              : isTransactionSuccesful
              ? "Created"
              : "Create Election"}
          </button>
        </form>
      </section>
    </div>
  )
}

export default Create

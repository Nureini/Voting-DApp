"use client"

import { API_ENDPOINT_URL } from "@/constants"
import {
  VoteCreationNFTABI,
  VoteCreationNFTAddress,
  VoteManagementABI,
  VoteManagementAddress,
  VoterRegistrationABI,
  VoterRegistrationAddress,
} from "@/contracts"
import {
  convertIntTo32BitHex,
  formatTimestamp,
  isVoteEndTimeReached,
  isVoteStartTimeReached,
} from "@/lib/utils"
import axios from "axios"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"

const Election = () => {
  const { id } = useParams()

  const { data: userSession } = useSession()

  const [isPolygonAddressSetCorrect, setIsPolygonAddressSetCorrect] =
    useState<boolean>(false)
  const { address, isConnected } = useAccount()

  const [delegate, setDelegate] = useState<boolean>(false)
  const [delegatePolygonAddress, setDelegatePolygonAddress] =
    useState<string>("")

  const [selectedChoice, setSelectedChoice] = useState({
    choice: "",
    index: -1,
  })
  const [delegateToVoterSelectedChoice, setDelegateToVoterSelectedChoice] =
    useState({
      choice: "",
      index: -1,
    })
  const [errMsg, setErrMsg] = useState<string>("")

  useEffect(() => {
    setErrMsg("")

    if (!userSession) {
      setErrMsg("Must Signin To Vote")
      return
    }

    if (!address) {
      setErrMsg(
        "Please return to the dashboard and connect your Polygon wallet"
      )
      return
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINT_URL}/user/${userSession?.user?.id}`
        )

        const userPolygonAddress = response.data.user?.polygonAddress
          ?.toLowerCase()
          .trim()
        const connectedAddress = address.toLowerCase().trim()
        if (userPolygonAddress === connectedAddress) {
          setIsPolygonAddressSetCorrect(true)
          return
        } else {
          setErrMsg(
            "Please connect to the correct polygon address associated with your account if you would like to vote"
          )
          return
        }
      } catch (error: any) {
        setErrMsg(`Error: ${error.message}`)
      }
    }

    fetchUserDetails()
  }, [userSession, address])

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

  const [updateNftOnOpensea, setUpdateNftOnOpensea] = useState(false)

  useEffect(() => {
    const refreshNftMetadataOnOpensea = async () => {
      await axios.post(
        `https://testnets-api.opensea.io/api/v2/chain/amoy/contract/${VoteCreationNFTAddress}/nfts/${id}/refresh`
      )
    }

    if (isTransactionSuccesful) {
      if (updateNftOnOpensea) {
        refreshNftMetadataOnOpensea()
        setUpdateNftOnOpensea(false)
      }

      location.reload()
    } else if (isWriteContractError) {
      setErrMsg(writeContractError?.message!)
    }
  }, [isTransactionSuccesful, isWriteContractError])

  const handleSelectedChoice = async (e: ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.selectedIndex - 1
    setSelectedChoice({ choice: e.target.value, index })
  }

  const handleDelegateToVoterSelectedChoice = async (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const index = e.target.selectedIndex - 1
    setDelegateToVoterSelectedChoice({ choice: e.target.value, index })
  }

  const { data: getVotersDelegate } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "getVotersDelegate",
    args: [id, address],
  })

  const { data: getDelegateToVoter } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "getDelegateToVoter",
    args: [id, address],
  })

  const handleSettingDelegatesPolygonAddress = async () => {
    if (!delegatePolygonAddress) {
      return
    }

    if (getDelegateToVoter !== "0x0000000000000000000000000000000000000000") {
      setErrMsg(
        "Delegate Voter Address Given Is Already In Use By Someone Else"
      )
      return
    }

    if (delegatePolygonAddress === address) {
      setErrMsg("Error, Not Allowed to Assign Yourself as a Delegate Voter")
      return
    }

    writeContract({
      abi: VoteManagementABI,
      address: VoteManagementAddress,
      functionName: "setDelegateVoter",
      args: [id, address, delegatePolygonAddress],
    })
  }

  const updateVoteCount = async () => {
    if (!isPolygonAddressSetCorrect) {
      setErrMsg(
        "Please connect to the correct polygon address associated with your account if you would like to vote"
      )
      return
    }

    writeContract({
      abi: VoteManagementABI,
      address: VoteManagementAddress,
      functionName: "updateVoteCount",
      args: [address, id, selectedChoice.index],
    })
  }

  const changeVote = async () => {
    if (!isPolygonAddressSetCorrect) {
      setErrMsg(
        "Please connect to the correct polygon address associated with your account if you would like to vote"
      )
      return
    }

    writeContract({
      abi: VoteManagementABI,
      address: VoteManagementAddress,
      functionName: "changeVote",
      args: [address, id, selectedChoice.index],
    })
  }

  const updateDelegateVoteCount = async () => {
    if (!isPolygonAddressSetCorrect) {
      setErrMsg(
        "Please connect to the correct polygon address associated with your account if you would like to vote"
      )
      return
    }

    writeContract({
      abi: VoteManagementABI,
      address: VoteManagementAddress,
      functionName: "updateVoteCount",
      args: [getDelegateToVoter, id, delegateToVoterSelectedChoice.index],
    })
  }

  const changeDelegateVote = async () => {
    if (!isPolygonAddressSetCorrect) {
      setErrMsg(
        "Please connect to the correct polygon address associated with your account if you would like to vote"
      )
      return
    }

    writeContract({
      abi: VoteManagementABI,
      address: VoteManagementAddress,
      functionName: "changeVote",
      args: [getDelegateToVoter, id, delegateToVoterSelectedChoice.index],
    })
  }

  const { data: isRegisteredVoterData } = useReadContract({
    abi: VoterRegistrationABI,
    address: VoterRegistrationAddress,
    args: [address],
    functionName: "isRegisteredVoter",
  })

  const { data: getHasVotedData } = useReadContract({
    abi: VoteManagementABI,
    address: VoteManagementAddress,
    args: [id, address],
    functionName: "getHasVoted",
  })

  const { data: getIsChangeVoteLimitReachedData } = useReadContract({
    abi: VoteManagementABI,
    address: VoteManagementAddress,
    args: [id, address],
    functionName: "getIsChangeVoteLimitReached",
  })

  const { data: getHasDelegateVotedData } = useReadContract({
    abi: VoteManagementABI,
    address: VoteManagementAddress,
    args: [id, getDelegateToVoter],
    functionName: "getHasVoted",
  })

  const { data: getIsDelegateChangeVoteLimitReachedData } = useReadContract({
    abi: VoteManagementABI,
    address: VoteManagementAddress,
    args: [id, getDelegateToVoter],
    functionName: "getIsChangeVoteLimitReached",
  })

  const { data: getVotersChoiceData } = useReadContract({
    abi: VoteManagementABI,
    address: VoteManagementAddress,
    args: [id, address],
    functionName: "getVotersChoice",
  })

  const { data: getDelegateVotersChoiceData } = useReadContract({
    abi: VoteManagementABI,
    address: VoteManagementAddress,
    args: [id, getDelegateToVoter],
    functionName: "getVotersChoice",
  })

  const {
    data: getVoteNameData,
    isLoading: isGetVoteNameLoading,
    error: getVoteNameError,
  } = useReadContract({
    abi: VoteManagementABI,
    address: VoteManagementAddress,
    args: [id],
    functionName: "getVoteName",
  })

  const {
    data: getVoteDescriptionData,
    isLoading: isGetVoteDescriptionLoading,
    error: getVoteDescriptionError,
  } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "getVoteDescription",
    args: [id],
  })

  const {
    data: getVoteStartTimeData,
    isLoading: isGetVoteStartTimeLoading,
    error: getVoteStartTimeError,
  } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "getVoteStartTime",
    args: [id],
  })

  const {
    data: getVoteEndTimeData,
    isLoading: isGetVoteEndTimeLoading,
    error: getVoteEndTimeError,
  } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "getVoteEndTime",
    args: [id],
  })

  const {
    data: getVoteChoicesData,
    isLoading: isGetVoteChoicesLoading,
    error: getVoteChoicesError,
  } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "getVoteChoices",
    args: [id],
  })

  const {
    data: getImageURIData,
    isLoading: isGetImageURILoading,
    error: getImageURIError,
  } = useReadContract({
    address: VoteCreationNFTAddress,
    abi: VoteCreationNFTABI,
    functionName: "getImageURI",
    args: [id],
  })

  const {
    data: getVotingStatusData,
    isLoading: isgetVotingStatusLoading,
    error: getVotingStatusDataError,
  } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "_getVotingStatus",
    args: [id],
  })

  const handleEndElectionBtn = async () => {
    const hexValue = convertIntTo32BitHex(id as any)
    writeContract({
      address: VoteManagementAddress,
      abi: VoteManagementABI,
      functionName: "performUpkeep",
      args: [hexValue],
    })

    setUpdateNftOnOpensea(true)
  }

  if (
    isGetVoteNameLoading ||
    isGetVoteDescriptionLoading ||
    isGetVoteStartTimeLoading ||
    isGetVoteEndTimeLoading ||
    isGetVoteChoicesLoading ||
    isGetImageURILoading ||
    isgetVotingStatusLoading
  ) {
    return <p> Loading...</p>
  }

  if (
    getVoteNameError ||
    getVoteDescriptionError ||
    getVoteStartTimeError ||
    getVoteEndTimeError ||
    getVoteChoicesError ||
    getImageURIError ||
    getVotingStatusDataError
  ) {
    return (
      <p>
        An error occured while trying to retrieve the data. Please try again
        later.
      </p>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 sm:p-12 md:p-24">
      <Link
        href="/dashboard"
        className="text-white text-xl font-semibold mb-2 cursor-pointer"
      >
        CLICK HERE to return to previous page
      </Link>

      <section className="text-black bg-gray-50 p-4 rounded-md flex flex-col items-center justify-center md:w-1/2 w-full">
        {errMsg && (
          <p className=" text-lg text-red-500 font-semibold text-center">
            {errMsg}
          </p>
        )}

        <h1 className="text-3xl font-bold">{getVoteNameData as string}</h1>
        <p className="text-md mb-3 text-center uppercase">
          {getVoteDescriptionData as string}
        </p>

        <Link
          href={`https://testnets.opensea.io/assets/amoy/${VoteCreationNFTAddress}/${id}`}
          target="_blank"
        >
          <Image
            src={getImageURIData as string}
            alt={getVoteNameData as string}
            width={300}
            height={300}
            className="rounded-md mb-4"
          />
        </Link>
        <p className="text-md font-bold text-center">
          Vote Start Time: {formatTimestamp(getVoteStartTimeData as number)}
        </p>
        <p className="text-md font-bold text-center mb-2">
          Vote End Time: {formatTimestamp(getVoteEndTimeData as number)}
        </p>

        {userSession &&
        getVotersDelegate &&
        getVotersDelegate !== "0x0000000000000000000000000000000000000000" ? (
          <p className="text-center mb-2">
            Your delegate voter is:{" "}
            {(getVotersDelegate as string).substring(0, 6)}...
            {(getVotersDelegate as string).substring(
              (getVotersDelegate as string).length - 4,
              (getVotersDelegate as string).length
            )}
          </p>
        ) : (
          <>
            {!delegate &&
              !getIsChangeVoteLimitReachedData &&
              isPolygonAddressSetCorrect &&
              userSession &&
              !isVoteEndTimeReached(getVoteEndTimeData as number) && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg mb-2"
                  onClick={() => setDelegate(true)}
                >
                  Set Your Delegate Voter
                </button>
              )}

            {userSession &&
              isPolygonAddressSetCorrect &&
              !getIsChangeVoteLimitReachedData &&
              delegate && (
                <>
                  <label
                    htmlFor="delegate"
                    className="font-semibold mt-2 text-center"
                  >
                    Delegate Voter's Polygon Address
                  </label>
                  <p>(Delegate must also be a registered voter)</p>
                  <div>
                    <input
                      id="delegate"
                      type="text"
                      placeholder="Enter your delegate"
                      value={delegatePolygonAddress}
                      onChange={(e) =>
                        setDelegatePolygonAddress(e.target.value)
                      }
                      className="bg-gray-50 text-black font-semibold rounded-lg py-2 px-4 mb-4 w-72 focus:outline-none border"
                      disabled={isTransactionLoading || isTransactionSuccesful}
                    />
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg mb-2"
                      onClick={handleSettingDelegatesPolygonAddress}
                      disabled={isTransactionLoading || isTransactionSuccesful}
                    >
                      {isTransactionLoading
                        ? "Submitting..."
                        : isTransactionSuccesful
                        ? "Submitted"
                        : "Submit"}
                    </button>
                  </div>
                </>
              )}
          </>
        )}

        {(getVotersChoiceData as string) !== "" &&
          getVotersChoiceData !== undefined && (
            <p className="text-xl font-bold capitalize text-green-600">
              You voted for Option: {getVotersChoiceData as string}
            </p>
          )}

        {!isVoteEndTimeReached(getVoteEndTimeData as number) &&
          userSession &&
          isVoteStartTimeReached(getVoteStartTimeData as number) &&
          isPolygonAddressSetCorrect &&
          (isRegisteredVoterData as boolean) && (
            <div className="flex items-center justify-center gap-2 mb-2">
              {((!getHasVotedData as boolean) ||
                (!getIsChangeVoteLimitReachedData as boolean)) && (
                <select
                  value={selectedChoice.choice}
                  onChange={(e) => handleSelectedChoice(e)}
                  className="border border-black rounded p-2"
                  disabled={isTransactionLoading || isTransactionSuccesful}
                >
                  <option disabled value="">
                    Select a choice
                  </option>
                  {(getVoteChoicesData as []).map((choice, index) => (
                    <option key={index} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              )}

              {(!getHasVotedData as boolean) && (
                <button
                  type="button"
                  onClick={updateVoteCount}
                  className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold p-2 rounded"
                  disabled={
                    !isPolygonAddressSetCorrect ||
                    (getHasVotedData as boolean) ||
                    isVoteEndTimeReached(getVoteEndTimeData as number) ||
                    isTransactionLoading ||
                    isTransactionSuccesful
                  }
                >
                  {isTransactionLoading
                    ? "Casting Vote..."
                    : isTransactionSuccesful
                    ? "Vote Casted"
                    : "Cast Vote"}
                </button>
              )}

              {(getHasVotedData as boolean) &&
                (!getIsChangeVoteLimitReachedData as boolean) && (
                  <button
                    type="button"
                    onClick={changeVote}
                    className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold p-2 rounded"
                    disabled={
                      !isPolygonAddressSetCorrect ||
                      ((getHasVotedData as boolean) &&
                        (getIsChangeVoteLimitReachedData as boolean)) ||
                      isVoteEndTimeReached(getVoteEndTimeData as number) ||
                      isTransactionLoading ||
                      isTransactionSuccesful
                    }
                  >
                    {isTransactionLoading
                      ? "Changing Vote..."
                      : isTransactionSuccesful
                      ? "Vote Changed"
                      : "Change Vote"}
                  </button>
                )}
            </div>
          )}

        {(getDelegateVotersChoiceData as string) !== "" &&
          getDelegateVotersChoiceData !== undefined && (
            <p className="text-center text-xl font-bold capitalize text-green-600 mb-1">
              For the delegate you voted for Option:{" "}
              {getDelegateVotersChoiceData as string}
            </p>
          )}

        {(getDelegateToVoter as boolean) &&
          (getDelegateToVoter as string) !==
            "0x0000000000000000000000000000000000000000" &&
          !isVoteEndTimeReached(getVoteEndTimeData as number) &&
          userSession &&
          isVoteStartTimeReached(getVoteStartTimeData as number) &&
          isPolygonAddressSetCorrect &&
          (isRegisteredVoterData as boolean) && (
            <>
              <p className="text-center mb-1">
                Your are a delegate voter for: {getDelegateToVoter as string}
              </p>

              <div className="flex items-center justify-center gap-2 ">
                {((!getHasDelegateVotedData as boolean) ||
                  (!getIsDelegateChangeVoteLimitReachedData as boolean)) && (
                  <select
                    value={delegateToVoterSelectedChoice.choice}
                    onChange={(e) => handleDelegateToVoterSelectedChoice(e)}
                    className="border border-black rounded p-2"
                    disabled={isTransactionLoading || isTransactionSuccesful}
                  >
                    <option disabled value="">
                      Select a choice
                    </option>
                    {(getVoteChoicesData as []).map((choice, index) => (
                      <option key={index} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                )}

                {(!getHasDelegateVotedData as boolean) && (
                  <button
                    type="button"
                    onClick={updateDelegateVoteCount}
                    className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold p-2 rounded"
                    disabled={
                      !isPolygonAddressSetCorrect ||
                      (getHasDelegateVotedData as boolean) ||
                      isVoteEndTimeReached(getVoteEndTimeData as number) ||
                      isTransactionLoading ||
                      isTransactionSuccesful
                    }
                  >
                    {isTransactionLoading
                      ? "Casting Delegate Vote..."
                      : isTransactionSuccesful
                      ? "Delegate Vote Casted"
                      : "Cast Delegate Vote"}
                  </button>
                )}

                {(getHasDelegateVotedData as boolean) &&
                  (!getIsDelegateChangeVoteLimitReachedData as boolean) && (
                    <button
                      type="button"
                      onClick={changeDelegateVote}
                      className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold p-2 rounded"
                      disabled={
                        !isPolygonAddressSetCorrect ||
                        ((getHasDelegateVotedData as boolean) &&
                          (getIsDelegateChangeVoteLimitReachedData as boolean)) ||
                        isVoteEndTimeReached(getVoteEndTimeData as number) ||
                        isTransactionLoading ||
                        isTransactionSuccesful
                      }
                    >
                      {isTransactionLoading
                        ? "Changing Delegate Vote..."
                        : isTransactionSuccesful
                        ? "Delegate Vote Changed"
                        : "Change Delegate Vote"}
                    </button>
                  )}
              </div>
            </>
          )}

        {isVoteEndTimeReached(getVoteEndTimeData as number) && (
          <h3 className="text-3xl uppercase font-bold text-red-500 text-center">
            This Election is now closed
          </h3>
        )}

        {isConnected &&
          getVotingStatusData !== "CLOSED" &&
          isVoteEndTimeReached(getVoteEndTimeData as number) && (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg"
                onClick={handleEndElectionBtn}
                disabled={isTransactionLoading || isTransactionSuccesful}
              >
                {isTransactionLoading
                  ? "Ending Election..."
                  : isTransactionSuccesful
                  ? "Election Ended"
                  : " End Election"}
              </button>
              <p className="text-xl font-semibold text-center">
                Winner will be revealed shortly
              </p>
            </>
          )}
      </section>
    </div>
  )
}

export default Election

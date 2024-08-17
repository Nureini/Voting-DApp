"use client"

import { VoteManagementABI, VoteManagementAddress } from "@/contracts"
import { useRouter } from "next/navigation"
import { useReadContract } from "wagmi"

const Elections = () => {
  const router = useRouter()

  const { data: getAllVoteNamesData } = useReadContract({
    address: VoteManagementAddress,
    abi: VoteManagementABI,
    functionName: "getAllVoteNames",
  })

  const sortByMostRecentlyCreated = ((getAllVoteNamesData as []) || [])
    .map((name, index) => ({ name, index }))
    .sort((a, b) => b.index - a.index)

  return (
    <section>
      <h3 className="mt-2 mb-2 text-4xl font-bold">All Elections</h3>
      <div className="flex flex-col gap-2">
        {sortByMostRecentlyCreated?.length ? (
          sortByMostRecentlyCreated?.map((each) => (
            <div
              className="flex justify-between items-center text-black bg-gray-50 p-4 rounded-md border border-blue-600"
              key={each.index}
            >
              <p className="text-2xl font-semibold">{each.name}</p>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg"
                onClick={() => router.push(`/election/${each.index}`)}
              >
                View Election
              </button>
            </div>
          ))
        ) : (
          <p>Currently there are not any elections...</p>
        )}
      </div>
    </section>
  )
}

export default Elections

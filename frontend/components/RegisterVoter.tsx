'use client'

import { API_ENDPOINT_URL } from '@/constants'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { ChangeEvent, useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface RegisterVoterProps {
    userValidIdMethodExists: boolean
    userImageExists: boolean
}

const RegisterVoter = ({
    userValidIdMethodExists,
    userImageExists,
}: RegisterVoterProps) => {
    const { address } = useAccount()
    const { data: userSession } = useSession()
    const [userValidIdMethod, setUserValidIdMethod] = useState<string>('')
    const [userImage, setUserImage] = useState<string>('')

    const [submitting, setSubmitting] = useState<boolean>(false)
    const [updateSuccessful, setUpdateSuccessful] = useState<boolean>(false)
    const [errMsg, setErrMsg] = useState<string | null>()

    // custom base64 conversion function
    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
        setFile: (file: string) => void,
    ) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFile(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleSubmitBtn = async () => {
        setSubmitting(true)

        if (!userValidIdMethod || !userImage || !address) {
            setErrMsg('You must submit a Valid ID and an Image of yourself')
            return
        }

        try {
            await axios
                .patch(`${API_ENDPOINT_URL}/user/`, {
                    id: userSession?.user?.id,
                    userValidIdMethod,
                    userImage,
                    polygonAddress: address,
                })
                .then(response => {
                    console.log(response)
                    if (response.data.status === 200) {
                        setUpdateSuccessful(true)
                    }
                })
                .catch((error: Error) => {
                    setErrMsg(`Error: ${error.message}`)
                })
        } catch (error: any) {
            setErrMsg(`Error: ${error.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            {updateSuccessful ||
            (userValidIdMethodExists && userImageExists) ? (
                <div className="mt-2 flex flex-col items-center justify-center p-6">
                    <CheckCircleIcon
                        fontSize="large"
                        className="text-[10rem] text-blue-600"
                    />
                    <p className="text-2xl font-semibold text-center">
                        You verification process was submitted and is now
                        pending verification
                    </p>
                    <p className="text-xl text-center">
                        This may take between 24-48 hours
                    </p>
                </div>
            ) : (
                <div className="mt-2 flex flex-col gap-2">
                    <p className="font-semibold text-xl text-blue-700">
                        Complete the Registration Process
                    </p>

                    {errMsg && (
                        <p className="mt-2 text-lg text-red-500 font-semibold">
                            {errMsg}
                        </p>
                    )}

                    <ConnectButton
                        label="CLICK HERE to Connect Wallet"
                        showBalance={false}
                    />

                    <div className="space-y-2">
                        <div className="flex flex-col">
                            <label className="font-semibold text-xl">
                                Upload Valid ID
                            </label>
                            <input
                                type="file"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleFileChange(e, setUserValidIdMethod)
                                }
                            />
                        </div>
                        {userValidIdMethod && (
                            <img
                                src={userValidIdMethod}
                                alt="userValidIdMethod"
                                className="w-72 h-72 border border-black rounded-md object-contain"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-col">
                            <label className="font-semibold text-xl">
                                Photo of yourself
                            </label>
                            <input
                                type="file"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleFileChange(e, setUserImage)
                                }
                            />
                        </div>
                        {userImage && (
                            <img
                                src={userImage}
                                alt="userImage"
                                className="w-72 h-72 border border-black rounded-md object-contain"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-lg md:w-72"
                        onClick={handleSubmitBtn}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            )}
        </>
    )
}

export default RegisterVoter

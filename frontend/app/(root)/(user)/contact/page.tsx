'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

const Contact = () => {
  const { data: userSession } = useSession()

  useEffect(() => {
    if (!userSession) {
      router.push('/auth/signin')
      return
    }
  }, [userSession])

  const router = useRouter()

  const [message, setMessage] = useState<string>('')

  const handleContactFormSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    router.push('contact/submitted')
    setMessage('')
  }

  return (
    <div className="custom-height flex items-center justify-center p-6 sm:p-12 md:p-24">
      <div className="text-gray-50 text-center">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>

        <form
          onSubmit={handleContactFormSubmission}
          className="flex flex-col items-start"
        >
          <textarea
            className="bg-gray-50 text-black font-semibold rounded-md py-2 px-4 mb-4 w-full resize-none focus:outline-none"
            id="message"
            name="message"
            rows={7}
            cols={50}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How may we help?"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded-md w-full"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact

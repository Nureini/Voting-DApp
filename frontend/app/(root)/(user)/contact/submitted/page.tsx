import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const Submitted = () => {
  return (
    <div className="custom-height p-6 sm:p-12 md:p-24 space-y-2 flex flex-col items-center">
      <div className="text-black bg-gray-50 p-4 rounded-md flex flex-col items-center justify-center">
        <CheckCircleIcon className="text-green-600 text-9xl" />
        <p className="leading-7">
          We have received your message. We will aim to respond as soon as
          possible by email.
        </p>
      </div>
    </div>
  )
}

export default Submitted

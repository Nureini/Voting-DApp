const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-blue-600 text-gray-50 p-6 h-14 flex justify-center items-center">
      <div className="container mx-auto text-center">
        <p>&copy; {currentYear} 0xDemocracy. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

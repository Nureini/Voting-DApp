import { API_ENDPOINT_URL } from '@/constants'
import { User } from '@/typings'
import axios from 'axios'

export const convertDateTimeToSeconds = (datetime: string): number => {
  const selectedDate = new Date(datetime);
  const now = new Date();

  const inMilliseconds = selectedDate.getTime() - now.getTime();
  const inSeconds = Math.floor(inMilliseconds / 1000);
  return inSeconds
}

export const formatTimestamp = (timestamp: number): string => {
  const convertTimestampToMilliseconds = timestamp * 1000
  const date = new Date(convertTimestampToMilliseconds)

  return date.toLocaleString()
}

export const isVoteStartTimeReached = (electionStartTime: number): boolean => {
  const currentTime = Date.now() / 1000
  return currentTime >= electionStartTime
}

export const isVoteEndTimeReached = (electionEndTime: number): boolean => {
  const currentTime = Date.now() / 1000
  return currentTime >= electionEndTime
}

export const isTheUserAdmin = async (userId: string) => {
  try {
    const response = await axios.get(`${API_ENDPOINT_URL}/user/${userId}`)
    if ((response.data.user as User).admin) {
      return true
    }
    return false
  } catch (error: any) {
    console.log(error.message)
    return false
  }
}

export const convertIntTo32BitHex = (id: number) => {
  const conversionToHex = id.toString(16)
  const adaptedHexVersion = conversionToHex.padStart(64, '0')
  const formattedHex = '0x' + adaptedHexVersion
  return formattedHex
}

import { NextResponse } from 'next/server'

type ErrorResponse = {
  success: false
  error: string
}

export default function errorResponse(
  message: string,
  status: number,
) {
  let errMessage = '' 
  if (status === 401) {
    errMessage = 'You do not have permission to perform this request, missing API key'
  } else if (status === 403) {
    errMessage = 'You do not have permission to perform this request, invalid API key or URL'
  }else if (status === 429) {
    errMessage = 'Too many requests, please wait and try again later'
  } else { 
    errMessage = message
  }
  const body: ErrorResponse = {
    success: false,
    error: errMessage
  }

  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

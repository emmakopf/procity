import { NextResponse } from 'next/server'
import errorHandler from '../../util/errorHandler'

const RIOTAPIKEY = process.env.RIOT_API_KEY!

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get('gameName')
  const tagLine = searchParams.get('tagLine')
  const region = searchParams.get('region')

  if (!gameName || !tagLine || !region) {
    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 })
  }

  try {
    const getPuuid = await fetch(`https://${region.toLowerCase()}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`, {
      method: 'GET',
      headers: {
        'X-Riot-Token': RIOTAPIKEY
      }
    })
    const data = await getPuuid.json()
    // Riot API returns { status: { message: 'errMessage', status_code: 400 }} on error
    if (data.status && data.status.status_code !== 200) return errorHandler(data.status?.message, data.status.status_code)
    return NextResponse.json({...data, success: true}, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error occurred' }, { status: 500 })
  }
}
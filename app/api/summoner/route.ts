import { NextResponse } from 'next/server'
import errorHandler from '../../util/errorHandler'

const RIOTAPIKEY = process.env.RIOT_API_KEY!

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const puuid = searchParams.get('puuid')
  const region = searchParams.get('region')

  if (!puuid || !region) {
    return NextResponse.json({ error: `Missing query params ${searchParams.toString()}` }, { status: 400 })
  }

  try {
    const getSummoner = await fetch(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
      method: 'GET',
      headers: {
        'X-Riot-Token': RIOTAPIKEY
      }
    })
    const data = await getSummoner.json()
    if (data.status && data.status.status_code !== 200) return errorHandler(data.status.message, data.status.status_code)
    return NextResponse.json({...data, success: true}, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error occurred' }, { status: 500 })
  }
}
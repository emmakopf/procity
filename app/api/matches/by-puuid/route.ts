import { NextResponse } from 'next/server'
import errorHandler from '../../../util/errorHandler'

const RIOTAPIKEY = process.env.RIOT_API_KEY!

type Participant = {
  puuid: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const puuid = searchParams.get('puuid')
  const region = searchParams.get('region')

  if (!puuid || !region) {
    return NextResponse.json({ error: 'Missing user information' }, { status: 400 })
  }

  try {
    const getMatches = await fetch(`https://${region.toLowerCase()}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=6`, {
      method: 'GET',
      headers: {
        'X-Riot-Token': RIOTAPIKEY
      }
    })
    const data = await getMatches.json()

    // Riot API returns { status: { message: 'errMessage', status_code: 400 }} on error
    if (data.status && data.status.status_code !== 200) {
      return errorHandler(data.status?.message, data.status.status_code)
    } else { 
      // Successfully got matches, get individual match data 
      const allMatches: Array<Match> = []
      for (const match of data) {
        const matchInfo = await fetch(`https://${region.toLowerCase()}.api.riotgames.com/lol/match/v5/matches/${match}`, {
          method: 'GET',
          headers: {
            'X-Riot-Token': RIOTAPIKEY
          }
        })
        const matchInfoJson = await matchInfo.json()
        
        // Handling data to get specific info for user that is being searched 
        const userP = matchInfoJson.info.participants.find((p: Participant) => p.puuid = puuid)
        const matchRes: Match = {
          gameDuration: matchInfoJson.info.gameDuration,
          assists: userP.assists, 
          championName: userP.championName,
          deaths: userP.deaths,
          kills: userP.kills,
          win: userP.win
        }
        allMatches.push(matchRes)
      }
      return NextResponse.json({ allMatches, success: true }, { status: 200 })
    } 
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal error occurred' }, { status: 500 })
  }
}
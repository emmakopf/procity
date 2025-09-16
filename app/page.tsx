'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import SelectDropdown from './components/select'
import styles from "./page.module.css"

const regionMap: { [key: string]: string } = {
  Americas: 'na1',
  Asia: 'kr', 
  Europe: 'euw1'
}

const queueMap: { [key: string]: string } = {
  RANKED_SOLO_5x5: 'Ranked Solo/Duo',
  RANKED_FLEX_SR: 'Ranked Flex'
}

type League = {
  freshBlood?: boolean,
  hotStreak?: boolean,
  inactive?: boolean,
  leagueId?: string,
  leaguePoints?: number,
  losses: number,
  queueType: string,
  rank: string,
  tier?: string,
  veteran?: boolean,
  wins: number
}

type RiotAccount = {
  league?: Array<League>,
  region?: string,
  summonerLevel?: number,
  username?: string,
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false)
  const [riotId, setRiotId] = useState<string>('')
  const [region, setRegion] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [accountInfo, setAccountInfo] = useState<RiotAccount>({})

  const selectRegion = (regionStr: string) => {
    setRegion(regionStr)
  }

  const getStats = async (e: React.FormEvent) => {
    e.preventDefault()
    // Reset error & account information 
    setError('')
    setAccountInfo({})

    // Riot ID parsing & basic error handling 
    const gameName:string = riotId.split('#')[0]
    const tagLine:string = riotId.split('#')[1]
    if (!gameName || !tagLine || gameName.length < 3 || gameName.length > 16 || tagLine.length < 3 || tagLine.length > 5) {
      setError('Invalid Riot ID')
      return
    }

    setLoading(true)
    const userAccount: RiotAccount = {}
    userAccount.username = riotId
    userAccount.region = region

    try {
      // Get PUUID from Riot account name
      const res = await fetch(`/api/account?gameName=${gameName}&tagLine=${tagLine}&region=${region}`)
      const data = await res.json()
      if (!data.success) {
        setLoading(false)
        return setError(data.error)
      }

      if (data.puuid) {
        // Get summoner information
        const summonerRes = await fetch(`/api/summoner?puuid=${data.puuid}&region=${regionMap[region]}`)
        const summonerData = await summonerRes.json()
        if (summonerData.summonerLevel) userAccount.summonerLevel = summonerData.summonerLevel
        
        // Get league queue information 
        const leagueRes = await fetch(`/api/league?puuid=${data.puuid}&region=${regionMap[region]}`)
        const leagueData = await leagueRes.json()
        if (leagueData.leagues.length > 0) userAccount.league = leagueData.leagues

        // If one of these errored out, note some information may be missing
        if (!summonerData.success || !leagueData.success)
          setError('Some information may be missing due to failed API requests')
      }
      
      setAccountInfo(userAccount)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
    return 
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.form}>
          <span>Select your Account Region </span>
          <SelectDropdown 
            options={['Americas', 'Asia', 'Europe']}
            onChange={selectRegion}
            placeholder={'Select Region...'}
          />
          <span>Input your Riot ID (gameName#tagLine)</span>
          <form onSubmit={getStats}>
            <input 
              type='text' 
              name='Riot ID' 
              value={riotId} 
              onChange={(e: React.FormEvent<HTMLInputElement>) => { setRiotId(e.currentTarget.value) }} />
            <button type='submit' disabled={loading}>Submit</button>
          </form>
        </section>
        <section>
          {error && (
            <div className={styles.error}>{error}</div>
          )}
          {loading && (
            <Image 
              className={styles.loading} 
              src={'/riot.png'} 
              alt='Loading' 
              width="36" 
              height="36" />
          )}
        </section>
        <section>
          {Object.keys(accountInfo).length > 0 && (
            <div>
              <div className={styles.account}>
                <span><b>Riot ID: </b>{accountInfo.username}</span>
                <span><b>Region: </b>{accountInfo.region}</span>
                <span><b>Level: </b>{accountInfo.summonerLevel || 'N/A'}</span>
              </div>
              {!accountInfo.league || accountInfo.league?.length === 0 ? (
                <div>This user has not played a ranked game yet!</div>
              ) : (
                <>
                  {accountInfo.league?.map((leagueQ, idx) => {
                    return (
                      <ul className={styles.account} key={idx}>
                        <li><b>{queueMap[leagueQ.queueType]}</b></li>
                        <li><b>Rank: </b>{leagueQ.tier}</li>
                        <li><b>LP: </b>{leagueQ.leaguePoints}</li>
                        <li><b>Win %: </b>{Math.ceil(leagueQ.wins / (leagueQ.wins + leagueQ.losses) * 100)}%</li>
                        <li><b>Matches Played: </b>{leagueQ.wins + leagueQ.losses}</li>
                      </ul>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </section>
      </main>
      <footer className={styles.footer}>
        Created by
        <a
          href="https://github.com/emmakopf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Emma Kopf
        </a>
        for Pro City Application 2025
      </footer>
    </div>
  )
}

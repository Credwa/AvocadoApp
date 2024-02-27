import { Fragment } from 'react'
import { View } from 'react-native'

import { truncate_number } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { ArtistProfile, displayedStats } from '@/services/ArtistService'
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'

import { Typography } from '../atoms/Typography'

type ArtistLinksProps = {
  artistStats: ArtistProfile['artist_stats']
}

export default function ArtistStats({ artistStats }: ArtistLinksProps) {
  const defaultStyle =
    'flex h-8 w-8 cursor-pointer justify-center items-center rounded-full shadow-sm dark:bg-slate-800 hover:dark:bg-slate-700'

  const defaultSize = 38

  if (!artistStats) return null

  const iconMappings = {
    spotify: <FontAwesome style={tw``} color={tw.color('bg-secondary-main')} name="spotify" size={defaultSize} />,
    deezer: <FontAwesome5 style={tw``} color={tw.color('text-[#ff0000]')} name="deezer" size={defaultSize} />,
    soundcloud: <FontAwesome style={tw``} color={tw.color('text-[#ff7700]')} name="soundcloud" size={defaultSize} />,
    youtube: <FontAwesome5 style={tw``} color={tw.color('text-[#FF0000]')} name="youtube" size={defaultSize} />,
    instagram: <FontAwesome5 style={tw``} color={tw.color('text-[#C13584]')} name="instagram" size={defaultSize} />,
    tiktok: <FontAwesome5 style={tw``} color={tw.color('text-[#FF9900]')} name="tiktok" size={defaultSize} />,
    twitter: <FontAwesome5 style={tw``} color={tw.color('text-[#1DA1F2]')} name="twitter" size={defaultSize} />
  } as Record<string, JSX.Element>

  const shownStatsSet = new Set(artistStats?.shown_stats ?? null)
  const stats = displayedStats
  const supabaseArtistStats = new Map(Object.entries(artistStats))

  Object.keys(stats).forEach((key) => {
    Object.keys(stats[key]).forEach((stat) => {
      if (supabaseArtistStats.has(stat) && shownStatsSet.has(stat)) {
        stats[key][stat] = supabaseArtistStats.get(stat) as number | null
      }
    })
  })

  return (
    <View style={tw`flex-col flex-wrap px-8`}>
      {Object.keys(stats).map((key) => {
        return (
          <View key={key} style={tw`pt-0`}>
            {Object.keys(stats[key]).length > 0 &&
            Object.keys(stats[key]).find((stat_key) => shownStatsSet.has(stat_key)) ? (
              <Typography weight={500} style={tw.style(' pb-1 pt-6  text-2xl', null, key !== 'streams' ? 'pt-10' : '')}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Typography>
            ) : null}
            <View style={tw`flex-row w-full flex-wrap gap-x-6`}>
              {Object.entries(stats[key]).map(([stat, value]) => {
                return (
                  <Fragment key={stat}>
                    {value && shownStatsSet.has(stat) ? (
                      <View style={tw``}>
                        <Typography style={tw`pt-4`}>{iconMappings[stat.split('_')[0]]} </Typography>
                        <Typography weight={500} style={tw`justify-center text-base self-center items-center`}>
                          {truncate_number(value as number)}
                        </Typography>
                      </View>
                    ) : null}
                  </Fragment>
                )
              })}
            </View>
          </View>
        )
      })}
    </View>
  )
}

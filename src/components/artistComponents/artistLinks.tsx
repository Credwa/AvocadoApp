import { Link } from 'expo-router'
import { View } from 'react-native'

import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { ArtistProfile } from '@/services/ArtistService'
import { FontAwesome, FontAwesome5, Fontisto } from '@expo/vector-icons'

type ArtistLinksProps = {
  artistLinks: ArtistProfile['artist_links']
}

export default function ArtistLinks({ artistLinks }: ArtistLinksProps) {
  const defaultSize = 38

  if (!artistLinks) return null

  const links = {
    spotify: {
      element: <FontAwesome style={tw``} color={tw.color('bg-secondary-main')} name="spotify" size={defaultSize} />,
      link: null
    },
    apple_music: {
      element: <FontAwesome style={tw``} color={tw.color('text-[#fc3c44]')} name="apple" size={defaultSize} />,
      link: null
    },
    soundcloud: {
      element: <FontAwesome style={tw``} color={tw.color('text-[#ff7700]')} name="soundcloud" size={defaultSize} />,
      link: null
    },
    deezer: {
      element: <FontAwesome5 style={tw``} color={tw.color('text-[#ff0000]')} name="deezer" size={defaultSize} />,
      link: null
    },
    amazon: {
      element: <FontAwesome5 style={tw``} color={tw.color('text-[#FF9900]')} name="amazon" size={defaultSize} />,
      link: null
    },
    // tidal: {
    //   element: <Image src="/images/tidal-icon.svg" width={22} height={22} alt="tidal icon" />,
    //   link: null
    // },
    shazam: {
      element: <Fontisto style={tw``} color={tw.color('text-[#0088FF]')} name="shazam" size={defaultSize} />,
      link: null
    },
    tiktok: {
      element: <FontAwesome5 style={tw``} color={tw.color('text-[#FF9900]')} name="tiktok" size={defaultSize} />,
      link: null
    },
    facebook: {
      element: <FontAwesome5 style={tw``} color={tw.color('text-[#4267B2]')} name="facebook" size={defaultSize} />,
      link: null
    },
    instagram: {
      element: <FontAwesome5 style={tw``} color={tw.color('text-[#C13584]')} name="instagram" size={defaultSize} />,
      link: null
    },
    youtube: {
      element: <FontAwesome5 style={tw``} color={tw.color('text-[#FF0000]')} name="youtube" size={defaultSize} />,
      link: null
    },
    twitter: {
      element: <FontAwesome5 style={tw``} color={tw.color('text-[#1DA1F2]')} name="twitter" size={defaultSize} />,
      link: null
    }
  } as Record<string, { element: JSX.Element; link: string | null }>

  const supabaseArtistLinks = new Map(Object.entries(artistLinks))

  Object.entries(links).forEach(([key, value]) => {
    if (value && supabaseArtistLinks.has(`${key}_url`)) {
      links[`${key}`].link = supabaseArtistLinks.get(`${key}_url`) as string
    }
  })

  return (
    <>
      {Boolean(links) && (
        <View style={tw`w-full justify-center flex-row gap-x-6 gap-y-6 py-8 flex-wrap`}>
          {Object.entries(links).map(([key, value]) => {
            if (value.link) {
              return (
                <Link href={value.link} key={key} style={tw.style('self-center rounded-md shadow-sm ')}>
                  {value.element}
                </Link>
              )
            }
          })}
        </View>
      )}
    </>
  )
}

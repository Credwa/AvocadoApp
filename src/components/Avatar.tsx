import { Image } from 'expo-image'
import { Pressable, View } from 'react-native'

import tw from '@/helpers/lib/tailwind'

type AvatarProps = {
  size: number
  src: string
  blurHash?: string
  styles?: string
  onPress?: () => void
}

const defaultBlurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

export const Avatar = ({ size, src, blurHash = defaultBlurhash, onPress, styles }: AvatarProps) => {
  return (
    <View style={[tw`rounded-full w-${size} h-${size} dark:bg-zinc-700 bg-zinc-200`, tw.style(styles)]}>
      {onPress ? (
        <Pressable onPress={onPress}>
          {({ pressed }) => (
            <Image
              source={src}
              placeholder={blurHash}
              contentFit="fill"
              transition={200}
              cachePolicy="memory"
              style={[tw.style(`w-${size} h-${size} rounded-full`), tw.style({ 'opacity-50': pressed })]}
              alt="avatar image"
            />
          )}
        </Pressable>
      ) : (
        <Image
          source={src}
          placeholder={blurHash}
          contentFit="fill"
          transition={500}
          style={tw`w-${size} h-${size} rounded-full`}
          alt="avatar image"
        />
      )}
    </View>
  )
}

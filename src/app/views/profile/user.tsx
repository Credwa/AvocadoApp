import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, Pressable, SafeAreaView, View } from 'react-native'

import { Button } from '@/components/atoms/Button'
import ShowToast from '@/components/atoms/Toast'
import { Typography } from '@/components/atoms/Typography'
import { getRandomBlurhash } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getPurchasedCampaigns } from '@/services/CampaignService'
import { getFollowingCount } from '@/services/RelationshipService'
import { getCurrentUserProfile, roles, uploadNewAvatar } from '@/services/UserService'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const UserProfile = () => {
  const colorScheme = useColorScheme()
  const screenHeight = Dimensions.get('window').height
  const [image, setImage] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: currentUser } = useQuery({ ...getCurrentUserProfile() })
  const { data: purchasedCampaigns } = useQuery({
    ...getPurchasedCampaigns(currentUser?.id),
    enabled: !!currentUser?.id
  })
  const { data: followerCount } = useQuery({
    ...getFollowingCount(currentUser?.id as string),
    enabled: !!currentUser?.id
  })

  const uploadedPhotoRegex =
    /profilephotos\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpeg$/i

  const { mutateAsync } = useMutation({
    mutationFn: async (uri: string) => {
      const imageAsString = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
      const base64 = `${imageAsString}`
      return uploadNewAvatar({
        id: currentUser?.id as string,
        imageBase64: base64,
        currentAvatar: uploadedPhotoRegex.test(currentUser?.avatar_url as string)
          ? currentUser?.avatar_url.split('/').pop()?.split('?').shift()
          : undefined
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/me'] })
      ShowToast('Successfully uploaded new profile picture.', {
        backgroundColor: colorScheme === 'dark' ? tw.color('bg-zinc-800') : tw.color('bg-zinc-200')
      })
    },
    onError: (error) => {
      console.log(error)
      setImage(null)
      ShowToast('Error uploading image. Please try again later.', {
        backgroundColor: colorScheme === 'dark' ? tw.color('bg-zinc-800') : tw.color('bg-zinc-200')
      })
    }
  })

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    })

    if (!result.canceled) {
      const asset = result.assets[0]

      if (asset.fileSize && asset.fileSize > 20000000) {
        ShowToast('Image size is too large. Please upload an image smaller than 20MB.', {
          backgroundColor: colorScheme === 'dark' ? tw.color('bg-zinc-800') : tw.color('bg-zinc-200')
        })
        setImage(null)
        return
      }
      setImage(asset.uri)
      await mutateAsync(asset.uri)
    }
  }

  return (
    <View style={tw`relative flex flex-col flex-1 background-default`}>
      <View style={tw`relative h-[${screenHeight / 3}px]`}>
        <Image
          source=""
          placeholder={getRandomBlurhash()}
          contentFit="fill"
          cachePolicy="disk"
          style={[tw.style(`w-full absolute h-[${screenHeight / 3}px]`)]}
          alt="Your profile picture"
        />
        <View style={tw`flex flex-col items-center justify-between flex-1 gutter-md`}>
          <SafeAreaView style={tw`flex flex-row items-center justify-between w-full p-4`}>
            <Pressable style={tw`p-1.5 rounded-full bg-zinc-600`} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={tw.color('text-zinc-100')} />
            </Pressable>
            <Pressable style={tw`p-1.5 rounded-full bg-zinc-600`} onPress={() => router.push('/settings')}>
              <Ionicons name="settings" size={24} color={tw.color('text-zinc-100')} />
            </Pressable>
          </SafeAreaView>
          <Pressable onPress={pickImage}>
            <Image
              source={image ? image : currentUser?.avatar_url}
              placeholder={getRandomBlurhash()}
              contentFit="fill"
              cachePolicy="disk"
              style={[tw.style(`w-40 rounded-full h-40 top-20 border-2 bg-zinc-100 border-zinc-300`)]}
              alt="Your profile picture"
            />
          </Pressable>
        </View>
      </View>

      <View style={tw`w-full top-28 gutter-md gap-y-8`}>
        <View style={tw`flex-row justify-around w-full`}>
          <View style={tw`flex-col items-center justify-center`}>
            <Typography weight={500} style={tw`text-lg dark:text-zinc-300 text-zinc-700`}>
              Songs
            </Typography>
            <Typography weight={600} style={tw`text-2xl`}>
              {purchasedCampaigns?.length}
            </Typography>
          </View>
          <View style={tw`flex-col items-center justify-center`}>
            <Typography weight={500} style={tw`text-lg dark:text-zinc-300 text-zinc-700`}>
              Following
            </Typography>
            <Typography weight={600} style={tw`text-2xl`}>
              {followerCount?.count ?? 0}
            </Typography>
          </View>
        </View>
        <View>
          {currentUser?.role === roles.Enum.artist && (
            <Button outline onPress={() => router.push(`/views/artist/${currentUser?.id}`)}>
              View Artist Profile
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}

export default UserProfile

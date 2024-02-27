import LottieView from 'lottie-react-native'
import { FC, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Ionicons } from '@expo/vector-icons'

import { Typography } from './atoms/Typography'

type SearchBarProps = {
  styles?: string
  onFocusStatusChange?: (status: boolean) => void
  searching: boolean
} & React.ComponentProps<typeof TextInput>

export const SearchBar: FC<SearchBarProps> = (props) => {
  const [hasValue, setHasValue] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const textInputRef = useRef<TextInput>(null) // Creating a ref for the TextInput
  const loadingAnim = require('~/assets/lottie/Loading.json')

  const colorScheme = useColorScheme()
  const newProps = { ...props }
  delete newProps.styles

  useEffect(() => {
    if (isFocused) {
      props.onFocusStatusChange?.(isFocused)
    }
  }, [isFocused])

  useEffect(() => {
    if (props.value && props.value.length > 0 && !hasValue) {
      setHasValue(true)
    } else if (!props.value && hasValue) {
      setHasValue(false)
    }
  }, [props.value])

  const handleFocus = () => {
    setIsFocused(true)
    setIsActive(true)
  }

  const handleEndEditing = () => {
    setIsFocused(false)
  }

  const handleClear = () => {
    if (textInputRef.current) {
      console.log('handleClear')
      textInputRef.current.blur()
      textInputRef.current.clear()
      props.onFocusStatusChange?.(false)
      setIsActive(false)
    }
  }

  return (
    <View style={tw.style(`flex-row gap-x-4`, props.styles)}>
      <Animated.View style={tw.style(`relative w-full`, { flex: 1 })}>
        <Pressable style={tw`absolute left-0 z-10 mt-2.5 ml-2`}>
          <Ionicons
            name="search"
            size={22}
            color={colorScheme === 'dark' ? tw.color('text-zinc-400') : tw.color('text-zinc-700')}
          />
        </Pressable>
        <TextInput
          blurOnSubmit={false}
          ref={textInputRef}
          onFocus={handleFocus}
          onEndEditing={handleEndEditing}
          style={[
            tw.style(
              `dark:bg-zinc-900 flex bg-zinc-200 dark:text-zinc-300 text-zinc-700 rounded-md h-11 px-9 no-underline`,
              props.styles
            ),
            { fontFamily: 'REM' }
          ]}
          placeholderTextColor={colorScheme === 'dark' ? tw.color('text-zinc-600') : tw.color('text-zinc-400')}
          {...newProps}
          underlineColorAndroid="transparent"
          placeholder={props.placeholder}
          selectionColor={colorScheme === 'dark' ? tw.color('text-primary-light') : tw.color('text-primary-main')}
        />

        {props.searching && (
          <View style={tw`absolute right-0 z-10 mt-3 mr-2`}>
            {/* <LottieView autoPlay source={loadingAnim} /> */}
            <ActivityIndicator
              color={colorScheme === 'dark' ? tw.color('text-primary-lighter') : tw.color('text-primary-main')}
            />
          </View>
        )}
      </Animated.View>
      {isActive && (
        <Animated.View style={tw.style(`relative self-center`)} entering={FadeIn}>
          <Pressable onPress={handleClear} style={tw`left-0 z-10`} hitSlop={{ top: 20, bottom: 20, left: 10 }}>
            <Typography style={tw`dark:text-primary-lighter text-primary-main`}>Cancel</Typography>
          </Pressable>
        </Animated.View>
      )}
    </View>
  )
}

import { FC, useEffect, useState } from 'react'
import { Pressable, TextInput as DefaultTextInput, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated'

import tw from '@/helpers/lib/tailwind'
import Entypo from '@expo/vector-icons/Entypo'

export type TextInputProps = {
  styles?: string
} & React.ComponentProps<typeof DefaultTextInput>

export const TextInput: FC<TextInputProps> = (props) => {
  const [hasValue, setHasValue] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showSecureText, setShowSecureText] = useState(!!props.secureTextEntry)
  const newProps = { ...props }
  delete newProps.styles

  useEffect(() => {
    if (props.value && props.value.length > 0 && !hasValue) {
      setHasValue(true)
    } else if (!props.value && hasValue) {
      setHasValue(false)
    }
  }, [props.value])

  const config = {
    duration: 500,
    easing: Easing.bezier(0.5, 0.01, 0, 1)
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused || hasValue ? 1 : 0, config),
      transform: [
        {
          translateY: withTiming(isFocused || hasValue ? -10 : 0, config)
        }
      ]
    }
  })

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleEndEditing = () => {
    setIsFocused(false)
  }

  return (
    <View style={tw`relative flex`}>
      {isFocused || (props.value && props.value.length > 0) ? (
        <Animated.Text style={[tw`absolute z-50 px-4 pt-4 text-xs dark:text-zinc-300 text-zinc-500`, animatedStyle]}>
          {props.placeholder}
        </Animated.Text>
      ) : null}
      <DefaultTextInput
        onFocus={handleFocus}
        onEndEditing={handleEndEditing}
        style={[
          tw.style(
            `w-full flex dark:bg-[#0F202A] shadow-md dark:shadow-zinc-500 shadow-zinc-100 bg-zinc-50 border dark:border-zinc-600 border-zinc-300 dark:text-zinc-50 text-zinc-900 rounded-xl h-14 px-4 no-underline`,
            props.styles
          ),
          tw.style({ 'border-primary-lighter': isFocused }),
          tw.style({ 'pt-3': hasValue || isFocused }),
          { fontFamily: 'REM' }
        ]}
        selectionColor={tw.color('primary-main')}
        underlineColorAndroid="transparent"
        placeholderTextColor={tw.color('dark:text-zinc-300 text-zinc-400')}
        {...newProps}
        placeholder={isFocused ? '' : newProps.placeholder}
        secureTextEntry={showSecureText}
      />
      {props.secureTextEntry === true ? (
        <Pressable style={tw`absolute right-0 mt-5 mr-4`} onPress={() => setShowSecureText((val) => !val)}>
          {showSecureText ? (
            <Entypo name="eye-with-line" size={18} color={tw.color('text-zinc-500')} />
          ) : (
            <Entypo name="eye" size={18} color={tw.color('text-zinc-500')} />
          )}
        </Pressable>
      ) : null}
    </View>
  )
}

import { FC, useState } from 'react'
import { Animated, TextInput as DefaultTextInput, View } from 'react-native'

import tw from '@/helpers/lib/tailwind'

export type TextInputProps = {
  styles?: string
} & React.ComponentProps<typeof DefaultTextInput>

export const TextInput: FC<TextInputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false)
  const newProps = { ...props }
  delete newProps.styles
  const handleFocus = () => {
    setIsFocused(true)
  }
  console.log(props.value)

  const handleEndEditing = () => {
    setIsFocused(false)
  }

  return (
    <View style={tw`relative flex`}>
      {(isFocused || (props.value && props.value.length > 0)) && (
        <Animated.Text style={tw`absolute z-50 px-4 pt-1 text-xs dark:text-zinc-300 text-zinc-900`}>
          {props.placeholder}
        </Animated.Text>
      )}
      <DefaultTextInput
        onFocus={handleFocus}
        onEndEditing={handleEndEditing}
        style={[
          tw.style(
            `w-full flex dark:bg-[#0F202A] shadow-md dark:shadow-zinc-500 shadow-zinc-100 bg-zinc-50 border dark:border-zinc-600 border-zinc-300 dark:text-zinc-50 text-zinc-900 rounded-lg h-14 px-4 no-underline`,
            props.styles
          ),
          tw.style({ 'border-primary-lighter': isFocused }),
          tw.style({ 'pt-3': !!(props.value && props.value.length > 0) })
        ]}
        selectionColor={tw.color('primary-main')}
        underlineColorAndroid="transparent"
        placeholderTextColor={tw.color('dark:text-zinc-300 text-zinc-400')}
        {...newProps}
        placeholder={isFocused ? '' : newProps.placeholder}
      />
    </View>
  )
}

import React, { FC, ReactElement, useState } from 'react'
import { Pressable, View } from 'react-native'

import tw from '@/helpers/lib/tailwind'

import { Typography } from './Typography'

type RadioButtonProps = {
  label: string
  value: string
  selected?: string
  onPress?: () => void
  styles?: string
}

const RadioButton: FC<RadioButtonProps> & { Group: typeof RadioButtonGroup } = ({
  label,
  selected,
  onPress,
  value,
  styles
}) => {
  return (
    <Pressable style={tw.style(`flex-row items-center`, styles)} onPress={onPress}>
      <View
        style={tw.style(
          `items-center justify-center w-5 h-5 bg-transparent border rounded-full border-zinc-300 dark:border-zinc-500`,
          selected === value ? 'border-primary-dark dark:border-primary-light' : ''
        )}
      >
        {selected === value ? <View style={tw`w-2.5 h-2.5 rounded-full bg-primary-main dark:bg-primary-main`} /> : null}
      </View>
      <Typography style={tw.style(`ml-4 text-base dark:text-zinc-100 text-zinc-950`)}>{label}</Typography>
    </Pressable>
  )
}

type RadioButtonGroupProps = {
  children: ReactElement<typeof RadioButton>[] | ReactElement<typeof RadioButton>
  onValueChange: (value: string) => void
  value: string
  styles?: string
}

const RadioButtonGroup: FC<RadioButtonGroupProps> = ({ onValueChange, children, value, styles }) => {
  const [selectedValue, setSelectedValue] = useState(value)

  const handlePress = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange(newValue)
  }

  return (
    <View style={tw.style(styles)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            // @ts-expect-error
            onPress: () => handlePress(child.props.value),
            selected: selectedValue,
            // @ts-expect-error
            value: child.props.value
          })
        }
        return child
      })}
    </View>
  )
}

RadioButton.Group = RadioButtonGroup

export { RadioButton }

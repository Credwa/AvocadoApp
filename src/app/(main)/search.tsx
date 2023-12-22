import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Typography } from '@/components/atoms/Typography'
import { SearchBar } from '@/components/SearchBar'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getSearchResults } from '@/services/CampaignService'
import { useQuery } from '@tanstack/react-query'

const SearchList = () => {
  return (
    <View style={tw`absolute flex self-center flex-1 w-full h-screen px-0 background-default top-11`}>
      <Typography>Search List</Typography>
    </View>
  )
}

const Search = () => {
  useColorScheme()
  const [query, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const { data, isLoading } = useQuery({
    ...getSearchResults(query),
    // only run when search length is a minimum of 3 characters and debouncedQuery is equal to query which is set after specified timeout
    enabled: debouncedQuery.length > 2 && debouncedQuery === query
  })

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  console.log(data)
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.length > 2) {
      setSearchQuery(searchQuery)
    }
  }
  return (
    <SafeAreaView style={tw`flex-1 pt-4 background-default gutter-sm`}>
      <View style={tw`relative`}>
        <SearchBar searching={isLoading} placeholder="Search artists and songs..." onChangeText={handleSearch} />
        <SearchList />
      </View>
    </SafeAreaView>
  )
}

export default Search

import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Pill } from '@/components/atoms/Pill'
import { Typography } from '@/components/atoms/Typography'
import LoadingScreen from '@/components/LoadingScreen'
import { SearchBar } from '@/components/SearchBar'
import tw from '@/helpers/lib/tailwind'
import { getSearchResults } from '@/services/CampaignService'
import { useQuery } from '@tanstack/react-query'

const Search = () => {
  const [query, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const { isLoading, data } = useQuery({
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
      <SearchBar searching={isLoading} placeholder="Search artists and songs..." onChangeText={handleSearch} />
    </SafeAreaView>
  )
}

export default Search

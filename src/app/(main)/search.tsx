import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FeaturedView } from '@/components/campaigns/FeaturedView'
import { RecentCampaignView } from '@/components/campaigns/RecentCampaignView'
import { SearchBar } from '@/components/SearchBar'
import { SearchList } from '@/components/SearchList'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getFeaturedArtists } from '@/services/ArtistService'
import {
  getFeaturedCampaigns,
  getRecentCampaigns,
  getSearchResults,
  getUpcomingCampaigns
} from '@/services/CampaignService'
import { useQuery } from '@tanstack/react-query'

const Search = () => {
  useColorScheme()
  const [query, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [showSearchList, setShowSearchList] = useState(true)
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
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

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.length > 2) {
      setSearchQuery(searchQuery)
    }
  }

  const handleFocusStatusChange = (status: boolean) => {
    setShowSearchList(status)
  }

  return (
    <SafeAreaView style={tw`flex-1 pt-4 background-default gutter-sm`}>
      <View style={tw`relative`}>
        <SearchBar
          searching={isSearchLoading}
          placeholder="Search artists and songs..."
          onChangeText={handleSearch}
          onFocusStatusChange={handleFocusStatusChange}
        />
        <SearchList searchResults={searchData} />
      </View>
    </SafeAreaView>
  )
}

export default Search

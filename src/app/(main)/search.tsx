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
  const [showSearchList, setShowSearchList] = useState(false)
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    ...getSearchResults(query),
    // only run when search length is a minimum of 3 characters and debouncedQuery is equal to query which is set after specified timeout
    enabled: debouncedQuery.length > 2 && debouncedQuery === query
  })

  const { data: recentCampaigns } = useQuery({
    ...getRecentCampaigns()
  })

  const { data: featuredCampaigns } = useQuery({
    ...getFeaturedCampaigns()
  })

  const { data: upcomingCampaigns } = useQuery({
    ...getUpcomingCampaigns()
  })

  const { data: featuredArtists } = useQuery({
    ...getFeaturedArtists()
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
        {showSearchList && <SearchList searchResults={searchData} />}
      </View>
      {!showSearchList && (
        <ScrollView style={tw``}>
          <View style={tw.style(`flex-col pt-8 gap-y-8 pb-20`, { 'opacity-0': showSearchList })}>
            <FeaturedView data={featuredCampaigns} title="Featured Songs" />
            <RecentCampaignView data={recentCampaigns} />
            {featuredCampaigns?.length === 0 && recentCampaigns?.length === 0 && (
              <FeaturedView data={upcomingCampaigns} title="Upcoming Songs" />
            )}
            <FeaturedView data={featuredArtists} title="Artist Spotlight" />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default Search

import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FeaturedView } from '@/components/campaigns/FeaturedCampaignsView'
import { RecentCampaignView } from '@/components/campaigns/RecentCampaignView'
import { SearchBar } from '@/components/SearchBar'
import { SearchList } from '@/components/SearchList'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getFeaturedCampaigns, getRecentCampaigns, getSearchResults } from '@/services/CampaignService'
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

  const { data: recentCampaigns, isLoading: isRecentCampaignsLoading } = useQuery({
    ...getRecentCampaigns()
  })

  const { data: featuredCampaigns, isLoading: isFeaturedCampaignsLoading } = useQuery({
    ...getFeaturedCampaigns()
  })

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  const newData2 = recentCampaigns?.concat(recentCampaigns).concat(recentCampaigns).concat(recentCampaigns)
  const newData = newData2?.concat(newData2).concat(newData2).concat(newData2)
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
            <FeaturedView data={featuredCampaigns?.concat(featuredCampaigns)} title="Featured Songs" />
            <RecentCampaignView data={newData} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default Search

import { Platform, StatusBar } from 'react-native'

export const music_genres = [
  'Alternative',
  'Anime',
  'Blues',
  "Children's Music",
  'Classical',
  'Comedy',
  'Country',
  'Dance',
  'Electronic',
  'Folk',
  'Hip-Hop',
  'Indie',
  'Jazz',
  'Movie Soundtrack',
  'Opera',
  'Pop',
  'R&B',
  'Rap',
  'Reggae',
  'Rock',
  'Singer/Songwriter',
  'Soul',
  'World'
]

export const AndroidSafeAreaPaddingTop = {
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
}

export const WEB_URL = __DEV__ ? 'http://192.168.1.23:3000' : 'https://myavocado.app'

export const environments = {
  dev: {
    BASE_URL: 'http://192.168.1.23:8080/api/v1',
    stripePublishableKey:
      'pk_test_51OEgCAD0PCnrjk8E0WhE2BnEJ5Ij9zgjD2lITATKCg8vzdEsYcAELFYFcJqMPsDjy0LlhgBBnt6WLHsxhYdMeZ3c00YW7Bp8el'
  },
  staging: {
    BASE_URL: 'https://seashell-app-n3uvl.ondigitalocean.app/api/v1',
    stripePublishableKey:
      'pk_test_51OEgCAD0PCnrjk8E0WhE2BnEJ5Ij9zgjD2lITATKCg8vzdEsYcAELFYFcJqMPsDjy0LlhgBBnt6WLHsxhYdMeZ3c00YW7Bp8el'
  },
  prod: {
    BASE_URL: 'https://seashell-app-n3uvl.ondigitalocean.app/api/v1',
    stripePublishableKey:
      'pk_live_51OEgCAD0PCnrjk8EHWlxvrS7MlMjxpjNw6r20BfRfi4Rl2j73J0tZNtCxROddtczjO4opBbUkj2hERncWImDpxPn00wT8t7PRS'
  }
} as const

export const getEnvironment = () => {
  if (__DEV__ && process.env.NODE_ENV === 'development') {
    return environments['dev']
  } else if (__DEV__ && process.env.NODE_ENV !== 'development') {
    // development builds NODE_ENV is production we want to use staging there
    // TODO create proper staging env
    return environments['prod']
  } else if (!__DEV__ && process.env.NODE_ENV === 'production') {
    return environments['prod']
  } else {
    throw new Error('Unknown environment')
  }
}

export const BASE_URL = getEnvironment().BASE_URL

export const defaultBlurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

export const blurhashes = [
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[',
  'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH',
  'LEHLh[WB2yk8pyoJadR*.7kCMdnj',
  'LGF5?xYk^6#M@-5c,1J5@[or[Q6.'
]

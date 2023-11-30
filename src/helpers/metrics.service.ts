import { useAppStore } from '@/store'

export function send_event(event_name: string, properties?: Record<string, string | number>) {
  const newProperties = { ...properties }
  const distinct_id = useAppStore.getState().user_id
  // fetch('https://artists.myavocado.app/api/events', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     event_name,
  //     distinct_id,
  //     newProperties
  //   })
  // })
}

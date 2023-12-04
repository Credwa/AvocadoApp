import { PostgrestError } from '@supabase/supabase-js'

export const handleErrors = (...errors: (Error | PostgrestError | null)[]) => {
  let thrownMessage: string | null = null

  for (const error of errors) {
    // throw first error message found
    if (error && !thrownMessage) {
      thrownMessage = error.message
    } else if (error) {
      // log other errors TODO use proper logging
      console.log('handled error: ', error)
    }
  }

  if (thrownMessage) {
    throw new Error(thrownMessage)
  }
}

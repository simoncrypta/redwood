import type { AuthContextInterface, SupportedAuthTypes } from '@redwoodjs/auth'

export interface FetchConfig {
  uri: string
  headers?: { 'auth-provider': SupportedAuthTypes; authorization: string }
}
export const FetchConfigContext = React.createContext<FetchConfig>({
  uri: `${global.__REDWOOD__API_PROXY_PATH}/graphql`,
})

/**
 * The `FetchConfigProvider` understands Redwood's Auth and determines the
 * correct request-headers based on a user's authentication state.
 */
export const FetchConfigProvider: React.FunctionComponent<{
  useAuth?: () => AuthContextInterface
}> = ({
  useAuth = global.__REDWOOD__USE_AUTH ??
    (() => ({ loading: false, isAuthenticated: false })),
  ...rest
}) => {
  const { isAuthenticated, authToken, type } = useAuth()

  // Even though the user may be authenticated and we may require `authToken` to continue
  // This should be handled by the `Private` route.
  if (!isAuthenticated || !authToken) {
    return (
      <FetchConfigContext.Provider
        value={{ uri: `${global.__REDWOOD__API_PROXY_PATH}/graphql` }}
        {...rest}
      />
    )
  }

  return (
    <FetchConfigContext.Provider
      value={{
        uri: `${global.__REDWOOD__API_PROXY_PATH}/graphql`,
        headers: {
          'auth-provider': type,
          authorization: `Bearer ${authToken}`,
        },
      }}
      {...rest}
    />
  )
}

export const useFetchConfig = () => React.useContext(FetchConfigContext)

import { forwardRef, useEffect } from 'react'

import { navigate, matchPath, useLocation } from './internal'

/**
 * Returns true if the URL for the given "route" value matches the current URL.
 * This is useful for components that need to know "active" state, e.g.
 * <NavLink>.
 */
const useMatch = (route: string) => {
  const location = useLocation()
  if (!location) {
    return { match: false }
  }

  return matchPath(route, location.pathname)
}

interface LinkProps {
  to: string
}

const Link = forwardRef<
  HTMLAnchorElement,
  LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ to, ...rest }, ref) => (
  <a
    href={to}
    ref={ref}
    {...rest}
    onClick={(event) => {
      if (
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return
      }

      event.preventDefault()
      navigate(to)
    }}
  />
))

interface NavLinkProps {
  to: string
  activeClassName: string
}

const NavLink = forwardRef<
  HTMLAnchorElement,
  NavLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ to, activeClassName, className, ...rest }, ref) => {
  const matchInfo = useMatch(to)
  const theClassName = [className, matchInfo.match && activeClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <a
      href={to}
      ref={ref}
      className={theClassName}
      {...rest}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return
        }

        event.preventDefault()
        navigate(to)
      }}
    />
  )
})

interface RedirectProps {
  /** The name of the route to redirect to */
  to: string
}

/**
 * A declarative way to redirect to a route name
 */
const Redirect = ({ to }: RedirectProps) => {
  useEffect(() => navigate(to), [to])
  return null
}

export { Link, NavLink, useMatch, Redirect }

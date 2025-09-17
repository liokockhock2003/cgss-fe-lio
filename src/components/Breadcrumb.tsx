import {
  Breadcrumb as _Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useMatches } from 'react-router-dom'

export function Breadcrumb() {
  const matches = useMatches()
  const crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => match.handle.crumb(match))

  return (
    <ol className='mb-0 flex'>
      {crumbs.map((crumb, index, arr) => (
        <li key={index}>
          {crumb}
          {arr[index + 1] && <span className='px-2'>/</span>}
        </li>
      ))}
    </ol>
  )
}

export function Breadcrumbs2() {
  const matches = useMatches()
  const crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => match.handle.crumb(match))

  return (
    <_Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index, arr) => (
          <BreadcrumbItem key={index}>
            {arr[index + 1] ?
              <BreadcrumbLink asChild>{crumb}</BreadcrumbLink>
            : <BreadcrumbPage>{crumb}</BreadcrumbPage>}
            {arr[index + 1] && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </_Breadcrumb>
  )
}

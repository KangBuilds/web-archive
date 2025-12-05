import Empty from './empty'

interface EmptyWrapperProps {
  children: React.ReactNode
  empty: boolean
  emptyElement?: React.ReactNode
}

function EmptyWrapper({ children, empty, emptyElement }: EmptyWrapperProps) {
  if (empty) {
    return emptyElement ?? <Empty className="h-full" />
  }
  return children
}

export default EmptyWrapper

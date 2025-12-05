import AutoCompleteTagInput from '@web-archive/shared/components/auto-complete-tag-input'
import { useRequest } from 'ahooks'
import { sendMessage } from 'webext-bridge/popup'

async function getAllTags() {
  const { tags } = await sendMessage('get-all-tags', {})
  return tags
}

interface TagInputWithCacheProps {
  onValueChange: (value: string[]) => void
}

function TagInputWithCache({ onValueChange }: TagInputWithCacheProps) {
  const { data: tagList } = useRequest(getAllTags, {
    cacheKey: 'tagList',
    setCache: (data) => {
      localStorage.setItem('tagList', JSON.stringify(data))
    },
    getCache: () => {
      const cache = localStorage.getItem('tagList')
      return cache ? JSON.parse(cache) : []
    },
  })

  return (
    <AutoCompleteTagInput
      tags={tagList ?? []}
      shouldLimitHeight
      onChange={({ bindTags }) => {
        onValueChange(bindTags)
      }}
    >
    </AutoCompleteTagInput>
  )
}

export default TagInputWithCache

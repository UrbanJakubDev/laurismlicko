import FeedItem from "./feedItem"
import type { FeedListItem } from "./feedItem"


type FeedListProps = {
    feeds: FeedListItem[]
}

export default function FeedList({ feeds }: FeedListProps) {
    return <div>
        {feeds.map((feed) => (
            <FeedItem key={feed.id} feed={feed} />
        ))}
    </div>
}

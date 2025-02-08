import { Feed } from "@prisma/client"
import FeedItem from "./feedItem"


type FeedListProps = {
    feeds: Feed[]
}

export default function FeedList({ feeds }: FeedListProps) {
    return <div>
        {feeds.map((feed) => (
            <FeedItem key={feed.id} feed={feed} />
        ))}
    </div>
}

import { useState } from 'react';
// Define the props for the FeedItem component
interface FeedItemProps {
    feed: FeedItem
}

type FeedItem = {
    id: number
    createdAt: string
    updatedAt: string
    babyId: number
    feedTime: string
    amount: number
    type: string
    foodId: number
    food: {
        name: string
        emoji: string
        unit: {
            name: string
            emoji: string
        }
    }
    timeSinceLastFeed: string
}

// Define the FeedItem component

// {
//     "id": 897,
//     "createdAt": "2025-02-08T15:16:01.495Z",
//     "updatedAt": "2025-02-08T15:16:01.495Z",
//     "babyId": 3,
//     "feedTime": "2025-02-08T16:15:00.000Z",
//     "amount": 20,
//     "type": "additional",
//     "foodId": 4,
//     "food": {
//       "name": "Mléko",
//       "emoji": "🍼",
//       "unit": {
//         "name": "ml",
//         "emoji": "💧"
//       }
//     },
//     "timeSinceLastFeed": "00:00"
//   }

export default function FeedItem({ feed }: FeedItemProps) {

    const [isExpanded, setIsExpanded] = useState(false);

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/feeds/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                console.error('Failed to delete feed');
                return;
            }

            // Refresh the page to show updated data
            window.location.reload();
        } catch (error) {
            console.error('Error deleting feed:', error);
        }
    }

    const renderExpandedFeed = () => {
        return (
            <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => handleDelete(feed.id)}>Smazat</button>
        )
    }


    const renderMainFeed = () => {
        return (
            <div className="bg-white shadow-md rounded-lg p-4 mb-4" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col items-start gap-2">
                        <p className="text-2xl font-semibold">{feed.food?.emoji} {feed.food?.name || 'N/A'}</p>
                        <p className="text-xl font-semibold text-baby-accent">{new Date(feed.feedTime).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <p className="text-xl font-semibold ">{feed.food?.unit?.emoji} {feed.amount} {feed.food?.unit?.name || 'ml'}</p>
                        <p className="font-semibold">{feed.type === 'main' ? 'Hlavní' : 'Doplnkové'}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 text-right">od posledního krmení: {feed.timeSinceLastFeed || 'N/A'}</p>

                {isExpanded && renderExpandedFeed()}
            </div>
        )
    }

    const renderAdditionalFeed = () => {
        return (
            <div className="bg-gray-200 shadow-md rounded-lg p-4 mb-4" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col items-start gap-2">
                        <p className="">{feed.food?.emoji} {feed.food?.name || 'N/A'}</p>
                        <p className=" text-baby-accent">{new Date(feed.feedTime).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <p className=" ">{feed.food?.unit?.emoji} {feed.amount} {feed.food?.unit?.name || 'ml'}</p>
                        <p className="">{feed.type === 'main' ? 'Hlavní' : 'Doplnkové'}</p>
                    </div>
                </div>

                {isExpanded && renderExpandedFeed()}
            </div>
        )
    }
    

    return (
        <>
            {feed.type === 'main' ? renderMainFeed() : renderAdditionalFeed()}
        </>
    )
}
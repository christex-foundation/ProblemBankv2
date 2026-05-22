import Link from 'next/link';
import {
  STATUS_LABELS,
  URGENCY_LABELS,
  type DisplayStatus,
  type UrgencyKey,
} from '@/lib/enums';
import VoteButton from '@/components/feed/VoteButton';

interface Props {
  id: string;
  title: string;
  category: string;
  urgency: UrgencyKey;
  status: DisplayStatus;
  voteCount: number;
  commentCount: number;
  authorName: string | null;
  /** ISO timestamp of the current user's vote, if any */
  myVotedAt: string | null;
}

export default function FeedCard({
  id,
  title,
  category,
  urgency,
  status,
  voteCount,
  commentCount,
  authorName,
  myVotedAt,
}: Props) {
  const isNotViable = status === 'not_viable';
  const isLive = status === 'live';
  const votingDisabled = isLive || isNotViable;

  return (
    <li className="border rounded p-4 hover:shadow-sm transition-shadow flex gap-4">
      <div className="shrink-0">
        <VoteButton
          submissionId={id}
          initialCount={voteCount}
          initialVotedAt={myVotedAt}
          disabled={votingDisabled}
          disabledReason={
            isLive ? 'This problem is now a Library entry.' : 'This problem was determined not viable.'
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/feed/${id}`} className="block">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold leading-tight">{title}</h2>
            {isNotViable && (
              <span className="shrink-0 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                Not Viable
              </span>
            )}
            {isLive && (
              <span className="shrink-0 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                Live
              </span>
            )}
          </div>
          <div className="text-xs text-gray-600 mt-2 flex flex-wrap gap-3">
            <span>{category}</span>
            <span>Urgency: {URGENCY_LABELS[urgency]}</span>
            <span>Status: {STATUS_LABELS[status]}</span>
            <span>{commentCount} comments</span>
            {authorName && <span className="text-gray-400">by {authorName}</span>}
          </div>
        </Link>
      </div>
    </li>
  );
}

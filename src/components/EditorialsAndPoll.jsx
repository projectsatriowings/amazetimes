import React from 'react';
import EditorialView from './EditorialView';
import QuizPoll from './QuizPoll';

export default function EditorialsAndPoll({
  onOpenArticle,
  onSpeak,
  onShareWhatsApp,
  onBookmark,
  savedBookmarks = [],
  onToggleLike,
  likedArticles = []
}) {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-2.5 sm:px-4 my-8 space-y-8 font-tamil">
      {/* Editorials View */}
      <EditorialView
        onOpenArticle={onOpenArticle}
        onSpeak={onSpeak}
        onShareWhatsApp={onShareWhatsApp}
        onBookmark={onBookmark}
        savedBookmarks={savedBookmarks}
        onToggleLike={onToggleLike}
        likedArticles={likedArticles}
      />

      {/* Reader Opinion Poll */}
      <div className="w-full">
        <QuizPoll />
      </div>
    </div>
  );
}

export { EditorialsAndPoll };

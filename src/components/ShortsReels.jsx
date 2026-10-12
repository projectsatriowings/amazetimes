import React from 'react';

export default function ShortsReels({
  stories = [],
  onOpenStory,
  isAdmin,
  onNewVideo,
  onEditVideo,
  onDeleteVideo
}) {
  return (
    <div class="bg-white dark:bg-[#0D1424] rounded-2xl p-4 shadow-sm border border-slate-300 dark:border-slate-800 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap gap-1">
        <h3 class="font-subtitle font-extrabold text-sm text-slate-900 dark:text-amber-400 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-400 text-[18px]">play_circle</span>
          <span>அமேஸ் ஷாட்ஸ் (வீடியோ)</span>
        </h3>

        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-black bg-red-500/15 text-brand-red dark:text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
            60 வினாடிகள்
          </span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        {stories.map((story, idx) => {
          const isVideo = story.media_type === 'video' || story.img?.match(/\.(mp4|webm|mov)(\?.*)?$/i);
          return (
            <div
              key={story.id || idx}
              onClick={() => onOpenStory(idx)}
              class="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-950"
            >
              {isVideo ? (
                <video
                  src={story.img}
                  muted
                  playsInline
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <img
                  src={story.img}
                  alt={story.headline}
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              )}

              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 flex flex-col justify-between">
                <span class="w-5 h-5 rounded-full bg-brand-red/90 text-white flex items-center justify-center text-[10px] shadow font-bold">
                  <span class="material-symbols-outlined text-[12px]">
                    {isVideo ? 'videocam' : 'play_arrow'}
                  </span>
                </span>
                <p class="font-subtitle text-[10px] font-bold text-white line-clamp-2 leading-tight drop-shadow">
                  {story.headline}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

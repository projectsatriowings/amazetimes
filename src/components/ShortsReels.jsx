import React from 'react';
import { PlayCircle, Video, Play } from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageHelper';

export default function ShortsReels({
  stories = [],
  onOpenStory
}) {
  return (
    <div className="bg-white dark:bg-[#0D1424] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap gap-1">
        <h3 className="font-subtitle font-extrabold text-sm text-slate-900 dark:text-amber-400 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-amber-500" />
          <span>அமேஸ் ஷாட்ஸ் (வீடியோ)</span>
        </h3>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
            60 வினாடிகள்
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stories.map((story, idx) => {
          const isVideo = story.media_type === 'video' || story.img?.match(/\.(mp4|webm|mov)(\?.*)?$/i);
          const thumb = getResponsiveImageProps(story.img, 200, 355);
          return (
            <div
              key={story.id || idx}
              onClick={() => onOpenStory(idx)}
              className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-950"
            >
              {isVideo ? (
                <video
                  src={story.img}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <img
                  src={thumb.src}
                  srcSet={thumb.srcSet}
                  sizes="(max-width: 640px) 33vw, 150px"
                  width="200"
                  height="355"
                  loading="lazy"
                  decoding="async"
                  alt={story.headline}
                  className="w-full h-full aspect-[9/16] object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => { e.target.src = '/og-image.webp'; }}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 flex flex-col justify-between">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow font-bold">
                  {isVideo ? <Video className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white fill-white" />}
                </span>
                <p className="font-subtitle text-[10px] font-bold text-white line-clamp-2 leading-tight drop-shadow">
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

{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Bold;\f1\fnil\fcharset0 Menlo-Regular;\f2\fnil\fcharset0 Menlo-Italic;
\f3\fswiss\fcharset0 Helvetica;\f4\fnil\fcharset0 HelveticaNeue;\f5\fnil\fcharset0 HelveticaNeue-Bold;
}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;\red104\green177\blue255;\red173\green176\blue178;
\red189\green198\blue208;\red252\green99\blue95;\red202\green202\blue202;\red183\green111\blue179;\red198\green146\blue255;
\red150\green204\blue255;\red109\green109\blue109;\red111\green230\blue116;\red140\green211\blue254;\red253\green141\blue134;
\red167\green197\blue152;\red120\green129\blue140;\red70\green137\blue204;\red212\green214\blue154;\red67\green192\blue160;
\red253\green149\blue70;\red205\green173\blue106;\red194\green126\blue101;\red247\green249\blue250;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;\cssrgb\c47451\c75294\c100000;\cssrgb\c73333\c74510\c74902;
\cssrgb\c78824\c81961\c85098;\cssrgb\c100000\c48235\c44706;\cssrgb\c83137\c83137\c83137;\cssrgb\c77255\c52549\c75294;\cssrgb\c82353\c65882\c100000;
\cssrgb\c64706\c83922\c100000;\cssrgb\c50196\c50196\c50196;\cssrgb\c49412\c90588\c52941;\cssrgb\c61176\c86275\c99608;\cssrgb\c100000\c63137\c59608;
\cssrgb\c70980\c80784\c65882;\cssrgb\c54510\c58039\c61961;\cssrgb\c33725\c61176\c83922;\cssrgb\c86275\c86275\c66667;\cssrgb\c30588\c78824\c69020;
\cssrgb\c100000\c65098\c34118;\cssrgb\c84314\c72941\c49020;\cssrgb\c80784\c56863\c47059;\cssrgb\c97647\c98039\c98431;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\b\fs24 \cf2 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec3 # The Scrub Pipeline and Engineering Standard
\f1\b0 \strokec4 \
\
This is the proven standard for the scroll-scrubbed hero and the quality floor around it. Use all of it, every time. Each rule either created the polish or prevented a bug that actually shipped and got caught.\
\

\f0\b \strokec3 ## The hero structure
\f1\b0 \strokec4 \
\
A tall pinned hero containing a sticky full-viewport stage. Scroll progress through the pinned region maps 0 to 1, and that progress drives the video's time. The page settles exactly when the video reaches its composed resting ending, and the real website begins there.\
\

\f0\b \strokec5 **Size the hero in scroll distance (vh), not seconds.**
\f1\b0 \strokec4  A Tier 1 single 6-second shot wants about 400vh of hero. A chained 18-second journey needs about 1000vh, so each beat gets room. Under-sizing a long journey makes every caption flash past no matter how well the bands are tuned; the pacing numbers live in the caption-band section below.\
\

\f0\b \strokec3 ## Fetch the video as a Blob (the Range rule)
\f1\b0 \strokec4 \
\
Many hosts silently lack partial-download (HTTP Range) support. Without it, every seek clamps to zero and scrubbing does nothing on the live site while working perfectly locally. Fetch the whole file as a Blob (the complete video held in memory) and play the object URL; it works everywhere.\
\
For a small clip (under about 8 MB) the plain form is fine:\
\
```js\
\strokec6 const\strokec7  \strokec3 res\strokec7  = \strokec8 await\strokec7  \strokec9 fetch\strokec7 (\strokec10 'assets/hero-scrub.mp4'\strokec7 );\strokec4 \
\strokec6 const\strokec7  \strokec3 blob\strokec7  = \strokec8 await\strokec7  \strokec5 res\strokec7 .\strokec9 blob\strokec7 ();\strokec4 \
\strokec5 video\strokec7 .\strokec5 src\strokec7  = \strokec3 URL\strokec7 .\strokec9 createObjectURL\strokec7 (\strokec5 blob\strokec7 );\strokec4 \
```\
\
Set the poster from JavaScript at the same time, inside the same code path that decides to load the video at all. That way phones and reduced-motion visitors, who get the static hero instead, never download either file.\
\

\f0\b \strokec3 ### The streamed Blob with a loading ring (any video over about 8 MB)
\f1\b0 \strokec4 \
\
A bare \strokec3 `await fetch().blob()`\strokec4  on a large chained video silently freezes the page's first impression: nothing visibly happens until the whole file lands. Over about 8 MB, stream it instead. The page is fully usable instantly, the poster shows first, an honest progress ring fills while the Blob streams, and the page is complete if the video never arrives.\
\
The video element ships with \strokec3 `preload="none"`\strokec4  and no \strokec3 `src`\strokec4 . The ring is an SVG circle of radius 20 (circumference about 126), driven by one CSS variable:\
\
```html\
\strokec11 <\strokec12 video\strokec7  \strokec13 id\strokec7 =\strokec10 "hero"\strokec7  \strokec13 preload\strokec7 =\strokec10 "none"\strokec7  \strokec13 muted\strokec7  \strokec13 playsinline\strokec7  \strokec13 aria-hidden\strokec7 =\strokec10 "true"\strokec7  \strokec13 tabindex\strokec7 =\strokec10 "-1"\strokec11 ></\strokec12 video\strokec11 >\strokec4 \
\strokec11 <\strokec12 svg\strokec7  \strokec13 class\strokec7 =\strokec10 "ring"\strokec7  \strokec13 viewBox\strokec7 =\strokec10 "0 0 48 48"\strokec7  \strokec13 aria-hidden\strokec7 =\strokec10 "true"\strokec11 >\strokec4 \
\strokec7   
\f2\i \strokec14 <circle
\f1\i0 \strokec7  \strokec13 cx\strokec7 =\strokec10 "24"\strokec7  \strokec13 cy\strokec7 =\strokec10 "24"\strokec7  \strokec13 r\strokec7 =\strokec10 "20"\strokec7  \strokec13 fill\strokec7 =\strokec10 "none"\strokec7  \strokec13 stroke\strokec7 =\strokec10 "currentColor"\strokec7  \strokec13 stroke-width\strokec7 =\strokec10 "3"\strokec4 \
\strokec7           \strokec13 stroke-dasharray\strokec7 =\strokec10 "126"\strokec7  \strokec13 style\strokec7 =\strokec10 "stroke-dashoffset:var(--ld,126)"
\f2\i \strokec14 /
\f1\i0 \strokec11 >\strokec4 \
\strokec11 </\strokec12 svg\strokec11 >\strokec4 \
```\
\
```js\
\strokec6 const\strokec7  \strokec3 VIDEO_URL\strokec7  = \strokec10 'assets/hero-scrub.mp4'\strokec7 ;\strokec4 \
\strokec6 const\strokec7  \strokec3 VIDEO_BYTES\strokec7  = \strokec15 14476000\strokec7 ;   \strokec16 // hardcode the real byte size: the fallback when Content-Length is missing\strokec4 \
\strokec6 const\strokec7  \strokec3 ring\strokec7  = \strokec5 document\strokec7 .\strokec9 querySelector\strokec7 (\strokec10 '.ring'\strokec7 );\strokec4 \
\strokec6 const\strokec7  \strokec3 posterLayer\strokec7  = \strokec5 document\strokec7 .\strokec9 querySelector\strokec7 (\strokec10 '.poster'\strokec7 );\strokec4 \
\
\strokec16 // 1. The poster wins the bandwidth race by design: paint it first,\strokec4 \
\strokec16 //    and start the blob fetch only once the poster is in (or has failed).\strokec4 \
\strokec5 posterLayer\strokec7 .\strokec5 style\strokec7 .\strokec5 backgroundImage\strokec7  = \strokec10 "url('assets/hero-poster.jpg')"\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 started\strokec7  = \strokec17 false\strokec7 ;\strokec4 \
\strokec6 function\strokec7  \strokec9 startBlobFetch\strokec7 () \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (started) \strokec8 return\strokec5 ;\strokec4 \
\strokec5   started \strokec7 =\strokec5  \strokec17 true\strokec5 ;\strokec4 \
\strokec5   \strokec9 loadHeroBlob\strokec5 ().\strokec9 catch\strokec5 (failVideo);\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 const\strokec7  \strokec3 posterImg\strokec7  = \strokec17 new\strokec7  \strokec9 Image\strokec7 ();\strokec4 \
\strokec5 posterImg\strokec7 .\strokec5 onload\strokec7  = \strokec5 startBlobFetch\strokec7 ;\strokec4 \
\strokec5 posterImg\strokec7 .\strokec5 onerror\strokec7  = \strokec5 startBlobFetch\strokec7 ;\strokec4 \
\strokec5 posterImg\strokec7 .\strokec5 src\strokec7  = \strokec10 'assets/hero-poster.jpg'\strokec7 ;\strokec4 \
\strokec18 setTimeout\strokec7 (\strokec5 startBlobFetch\strokec7 , \strokec15 4000\strokec7 );   \strokec16 // safety: a hung poster never blocks the video forever\strokec4 \
\
\strokec17 async\strokec7  \strokec6 function\strokec7  \strokec9 loadHeroBlob\strokec7 () \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 ctrl\strokec5  \strokec7 =\strokec5  \strokec17 new\strokec5  \strokec9 AbortController\strokec5 ();\strokec4 \
\strokec5   \strokec6 let\strokec5  watchdog \strokec7 =\strokec5  \strokec18 setTimeout\strokec5 (() \strokec6 =>\strokec5  ctrl.\strokec9 abort\strokec5 (), \strokec15 20000\strokec5 );\strokec4 \
\strokec5   \strokec16 // priority:'low' makes the blob yield to critical resources\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 res\strokec5  \strokec7 =\strokec5  \strokec8 await\strokec5  \strokec9 fetch\strokec5 (\strokec3 VIDEO_URL\strokec5 , \{ \strokec13 priority:\strokec5  \strokec10 'low'\strokec5 , \strokec13 signal:\strokec5  ctrl.signal \});\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 total\strokec5  \strokec7 =\strokec5  \strokec19 Number\strokec5 (res.headers.\strokec9 get\strokec5 (\strokec10 'Content-Length'\strokec5 )) \strokec7 ||\strokec5  \strokec3 VIDEO_BYTES\strokec5 ;\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 reader\strokec5  \strokec7 =\strokec5  res.body.\strokec9 getReader\strokec5 ();\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 chunks\strokec5  \strokec7 =\strokec5  [];\strokec4 \
\strokec5   \strokec6 let\strokec5  got \strokec7 =\strokec5  \strokec15 0\strokec5 , lastRing \strokec7 =\strokec5  \strokec15 0\strokec5 ;\strokec4 \
\strokec5   \strokec8 for\strokec5  (;;) \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \{ \strokec3 done\strokec5 , \strokec3 value\strokec5  \} \strokec7 =\strokec5  \strokec8 await\strokec5  reader.\strokec9 read\strokec5 ();\strokec4 \
\strokec5     \strokec8 if\strokec5  (done) \strokec8 break\strokec5 ;\strokec4 \
\strokec5     \strokec18 clearTimeout\strokec5 (watchdog);                        \strokec16 // re-arm on every chunk:\strokec4 \
\strokec5     watchdog \strokec7 =\strokec5  \strokec18 setTimeout\strokec5 (() \strokec6 =>\strokec5  ctrl.\strokec9 abort\strokec5 (), \strokec15 20000\strokec5 );   \strokec16 // 20s with no progress aborts the stream\strokec4 \
\strokec5     chunks.\strokec9 push\strokec5 (value);\strokec4 \
\strokec5     got \strokec7 +=\strokec5  value.\strokec3 length\strokec5 ;\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 frac\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (\strokec15 1\strokec5 , got \strokec7 /\strokec5  total);\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 now\strokec5  \strokec7 =\strokec5  performance.\strokec9 now\strokec5 ();\strokec4 \
\strokec5     \strokec8 if\strokec5  (now \strokec7 -\strokec5  lastRing \strokec7 >\strokec5  \strokec15 100\strokec5  \strokec7 ||\strokec5  frac \strokec7 ===\strokec5  \strokec15 1\strokec5 ) \{      \strokec16 // throttled to 100ms, but the terminal\strokec4 \
\strokec5       lastRing \strokec7 =\strokec5  now;                              \strokec16 // write always lands so the ring completes\strokec4 \
\strokec5       ring.style.\strokec9 setProperty\strokec5 (\strokec10 '--ld'\strokec5 , \strokec19 Math\strokec5 .\strokec18 round\strokec5 (\strokec15 126\strokec5  \strokec7 *\strokec5  (\strokec15 1\strokec5  \strokec7 -\strokec5  frac)));\strokec4 \
\strokec5     \}\strokec4 \
\strokec5   \}\strokec4 \
\strokec5   \strokec18 clearTimeout\strokec5 (watchdog);\strokec4 \
\strokec5   ring.style.\strokec9 setProperty\strokec5 (\strokec10 '--ld'\strokec5 , \strokec15 0\strokec5 );\strokec4 \
\strokec5   video.src \strokec7 =\strokec5  \strokec3 URL\strokec5 .\strokec9 createObjectURL\strokec5 (\strokec17 new\strokec5  \strokec9 Blob\strokec5 (chunks));\strokec4 \
\strokec5   video.\strokec9 load\strokec5 ();\strokec4 \
\strokec5   video.\strokec9 addEventListener\strokec5 (\strokec10 'canplay'\strokec5 , () \strokec6 =>\strokec5  \{\strokec4 \
\strokec5     \strokec9 requestSeek\strokec5 (\strokec9 heroProgress\strokec5 () \strokec7 *\strokec5  video.duration);  \strokec16 // land on the current scroll position\strokec4 \
\strokec5     stage.classList.\strokec9 add\strokec5 (\strokec10 'video-ready'\strokec5 );            \strokec16 // CSS fades the video in over the poster\strokec4 \
\strokec5   \}, \{ \strokec13 once:\strokec5  \strokec17 true\strokec5  \});\strokec4 \
\strokec5 \}\strokec4 \
\
\strokec6 function\strokec7  \strokec9 failVideo\strokec7 () \strokec5 \{\strokec4 \
\strokec5   ring.\strokec9 replaceWith\strokec5 (\strokec9 makeScrollChevron\strokec5 ());  \strokec16 // an honest scroll cue, never a stuck ring\strokec4 \
\strokec5   stage.classList.\strokec9 add\strokec5 (\strokec10 'video-failed'\strokec5 );    \strokec16 // still-image fallbacks carry the full journey\strokec4 \
\strokec5 \}\strokec4 \
```\
\
The watchdog matters: without it, a hung stream freezes the ring forever, which is worse than no ring. With it, a stall for 20 seconds aborts into the still-image fallback and the site simply works as a still site.\
\
The trade this pattern buys: even a chained journey weighing a dozen MB streams in quietly behind the ring over some seconds, while the page itself is usable almost instantly.\
\

\f0\b \strokec3 ## Lerp the displayed time (a rAF loop that rests)
\f1\b0 \strokec4 \
\
Never write scroll position straight into \strokec3 `currentTime`\strokec4 ; ease toward it. The loop must go idle when converged and when the hero is off-screen. Loops that free-run from page load waste battery and mark the build as amateur.\
\
```js\
\strokec6 let\strokec7  \strokec5 target\strokec7  = \strokec15 0\strokec7 ;      \strokec16 // 0..1, set by the scroll handler\strokec4 \
\strokec6 let\strokec7  \strokec5 shown\strokec7  = \strokec15 0\strokec7 ;       \strokec16 // what we are displaying\strokec4 \
\strokec6 let\strokec7  \strokec5 rafId\strokec7  = \strokec17 null\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 lastTick\strokec7  = \strokec15 0\strokec7 ;\strokec4 \
\
\strokec6 function\strokec7  \strokec9 tick\strokec7 (\strokec20 now\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 dt\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (\strokec15 100\strokec5 , now \strokec7 -\strokec5  (lastTick \strokec7 ||\strokec5  now));   \strokec16 // ms since last frame, capped\strokec4 \
\strokec5   lastTick \strokec7 =\strokec5  now;\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 k\strokec5  \strokec7 =\strokec5  \strokec15 0.16\strokec5 ;    \strokec16 // smoothing per 60fps frame; a starting point, tune by feel while scrubbing\strokec4 \
\strokec5   shown \strokec7 +=\strokec5  (target \strokec7 -\strokec5  shown) \strokec7 *\strokec5  (\strokec15 1\strokec5  \strokec7 -\strokec5  \strokec19 Math\strokec5 .\strokec18 pow\strokec5 (\strokec15 1\strokec5  \strokec7 -\strokec5  k, dt \strokec7 /\strokec5  \strokec15 16.667\strokec5 ));\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec19 Math\strokec5 .\strokec18 abs\strokec5 (target \strokec7 -\strokec5  shown) \strokec7 <\strokec5  \strokec15 0.0005\strokec5 ) \{\strokec4 \
\strokec5     shown \strokec7 =\strokec5  target;\strokec4 \
\strokec5     rafId \strokec7 =\strokec5  \strokec17 null\strokec5 ;\strokec4 \
\strokec5     lastTick \strokec7 =\strokec5  \strokec15 0\strokec5 ;                     \strokec16 // converged: rest\strokec4 \
\strokec5   \} \strokec8 else\strokec5  \{\strokec4 \
\strokec5     rafId \strokec7 =\strokec5  \strokec9 requestAnimationFrame\strokec5 (tick);\strokec4 \
\strokec5   \}\strokec4 \
\strokec5   \strokec9 requestSeek\strokec5 (shown \strokec7 *\strokec5  video.duration);\strokec4 \
\strokec5   \strokec9 updateCaptions\strokec5 (shown);\strokec4 \
\strokec5 \}\strokec4 \
\
\strokec6 function\strokec7  \strokec9 onScroll\strokec7 () \strokec5 \{\strokec4 \
\strokec5   target \strokec7 =\strokec5  \strokec9 heroProgress\strokec5 ();            \strokec16 // 0..1 through the pinned hero\strokec4 \
\strokec5   \strokec8 if\strokec5  (rafId \strokec7 ===\strokec5  \strokec17 null\strokec5  \strokec7 &&\strokec5  heroOnScreen) rafId \strokec7 =\strokec5  \strokec9 requestAnimationFrame\strokec5 (tick);\strokec4 \
\strokec5 \}\strokec4 \
```\
\
The \strokec3 `Math.pow`\strokec4  line is what makes the feel frame-rate independent: the exponent normalizes the smoothing to a 60fps reference, so every refresh rate converges at the same speed. A plain per-frame constant (\strokec3 `shown += (target - shown) * 0.18`\strokec4 ) converges twice as fast on a 120Hz screen as on a 60Hz one, and the site feels different per machine.\
\
Track \strokec3 `heroOnScreen`\strokec4  with an IntersectionObserver so the loop never runs while the hero is scrolled past.\
\

\f0\b \strokec3 ## Gate the seeks (the deadlock-safe pattern)
\f1\b0 \strokec4 \
\
Never write \strokec3 `currentTime`\strokec4  while a previous seek is still in flight. Un-gated seeks pile up and this is the difference between smooth and choppy in Chrome. Coalesce to the newest target, issue exactly one follow-up when the seek completes, and reset the busy flag on error so the gate can never deadlock:\
\
```js\
\strokec6 let\strokec7  \strokec5 seekBusy\strokec7  = \strokec17 false\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 pendingTime\strokec7  = \strokec17 null\strokec7 ;\strokec4 \
\
\strokec6 function\strokec7  \strokec9 requestSeek\strokec7 (\strokec20 t\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec7 !\strokec5 video.duration) \strokec8 return\strokec5 ;\strokec4 \
\strokec5   \strokec8 if\strokec5  (seekBusy) \{ pendingTime \strokec7 =\strokec5  t; \strokec8 return\strokec5 ; \}   \strokec16 // coalesce: keep only newest\strokec4 \
\strokec5   seekBusy \strokec7 =\strokec5  \strokec17 true\strokec5 ;\strokec4 \
\strokec5   video.currentTime \strokec7 =\strokec5  t;\strokec4 \
\strokec5 \}\strokec4 \
\
\strokec5 video\strokec7 .\strokec9 addEventListener\strokec7 (\strokec10 'seeked'\strokec7 , () \strokec6 =>\strokec7  \strokec5 \{\strokec4 \
\strokec5   seekBusy \strokec7 =\strokec5  \strokec17 false\strokec5 ;\strokec4 \
\strokec5   \strokec8 if\strokec5  (pendingTime \strokec7 !==\strokec5  \strokec17 null\strokec5 ) \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 t\strokec5  \strokec7 =\strokec5  pendingTime;\strokec4 \
\strokec5     pendingTime \strokec7 =\strokec5  \strokec17 null\strokec5 ;\strokec4 \
\strokec5     \strokec9 requestSeek\strokec5 (t);                            \strokec16 // exactly one follow-up\strokec4 \
\strokec5   \}\strokec4 \
\strokec5 \}\strokec7 );\strokec4 \
\
\strokec5 video\strokec7 .\strokec9 addEventListener\strokec7 (\strokec10 'error'\strokec7 , () \strokec6 =>\strokec7  \strokec5 \{        \strokec16 // the deadlock escape\strokec4 \
\strokec5   seekBusy \strokec7 =\strokec5  \strokec17 false\strokec5 ;\strokec4 \
\strokec5   pendingTime \strokec7 =\strokec5  \strokec17 null\strokec5 ;\strokec4 \
\strokec5 \}\strokec7 );\strokec4 \
```\
\
Under stress this pattern produces one completion per seek and zero overlaps. If scrubbing still feels rough with gating in place, the video's keyframe interval is too long: re-encode with \strokec3 `-g 8`\strokec4  (see \strokec3 `ffmpeg-recipes.md`\strokec4 ).\
\

\f0\b \strokec3 ## Write to the DOM only on change
\f1\b0 \strokec4 \
\
Per-frame DOM writes are the other half of choppy. Delta-gate everything:\
\
\strokec20 -\strokec4  Captions, scrims, and state classes: compute the desired state, compare against a cached value, and touch the DOM only when it differs. Never toggle a class every frame.\
\strokec20 -\strokec4  Any text that updates with scroll (counters, depth readouts, progress labels): throttle to about 10Hz AND only write when the string actually changed.\
\
```js\
\strokec6 let\strokec7  \strokec5 lastLabel\strokec7  = \strokec10 ''\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 lastLabelAt\strokec7  = \strokec15 0\strokec7 ;\strokec4 \
\
\strokec6 function\strokec7  \strokec9 updateLabel\strokec7 (\strokec20 text\strokec7 , \strokec20 now\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (now \strokec7 -\strokec5  lastLabelAt \strokec7 <\strokec5  \strokec15 100\strokec5 ) \strokec8 return\strokec5 ;   \strokec16 // ~10Hz\strokec4 \
\strokec5   \strokec8 if\strokec5  (text \strokec7 ===\strokec5  lastLabel) \strokec8 return\strokec5 ;        \strokec16 // only on change\strokec4 \
\strokec5   lastLabel \strokec7 =\strokec5  text;\strokec4 \
\strokec5   lastLabelAt \strokec7 =\strokec5  now;\strokec4 \
\strokec5   labelEl.textContent \strokec7 =\strokec5  text;\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Promote the video to its own compositor layer (\strokec3 `will-change: transform`\strokec4  or \strokec3 `transform: translateZ(0)`\strokec4  on the video element) so its repaints never drag the rest of the page.\
\

\f0\b \strokec3 ## The caption-band pattern (paced in scroll distance)
\f1\b0 \strokec4 \
\
Each caption owns a band of scroll progress, for example \strokec3 `[0.12, 0.30]`\strokec4 . Captions live in the footage's negative space, planned back in the concept phase, and the action lane stays clear. Nothing snaps.\
\
Pace every band in vh (viewport heights of scroll), never in seconds, because a scroll site is read in flicks. The standard:\
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Every beat gets a fully-visible plateau of roughly 80 to 130vh**
\f1\b0 \strokec4 , with eased ramps of around 20vh at each edge. Starting points, validated by the flick test below. The plateau is most of the band; the ramps are trim.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Compute the ramps in progress units.**
\f1\b0 \strokec4  For a band \strokec3 `[a, b]`\strokec4 : \strokec3 `const f = Math.min(0.02, (b - a) / 3)`\strokec4 . On a 900vh scroll range (scroll range = hero height minus the 100vh viewport), 0.02 of progress is 18vh.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Opacity**
\f1\b0 \strokec4  uses smoothstep at both edges:\
\
```js\
\strokec6 const\strokec7  \strokec9 smoothstep\strokec7  = (\strokec20 p\strokec7 , \strokec20 e0\strokec7 , \strokec20 e1\strokec7 ) \strokec6 =>\strokec7  \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 t\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (\strokec15 1\strokec5 , \strokec19 Math\strokec5 .\strokec18 max\strokec5 (\strokec15 0\strokec5 , (p \strokec7 -\strokec5  e0) \strokec7 /\strokec5  (e1 \strokec7 -\strokec5  e0)));\strokec4 \
\strokec5   \strokec8 return\strokec5  t \strokec7 *\strokec5  t \strokec7 *\strokec5  (\strokec15 3\strokec5  \strokec7 -\strokec5  \strokec15 2\strokec5  \strokec7 *\strokec5  t);\strokec4 \
\strokec5 \}\strokec7 ;\strokec4 \
\strokec6 const\strokec7  \strokec3 f\strokec7  = \strokec19 Math\strokec7 .\strokec18 min\strokec7 (\strokec15 0.02\strokec7 , (\strokec5 b\strokec7  - \strokec5 a\strokec7 ) / \strokec15 3\strokec7 );\strokec4 \
\strokec6 const\strokec7  \strokec3 opacity\strokec7  = \strokec9 smoothstep\strokec7 (\strokec5 p\strokec7 , \strokec5 a\strokec7 , \strokec5 a\strokec7  + \strokec5 f\strokec7 ) * (\strokec15 1\strokec7  - \strokec9 smoothstep\strokec7 (\strokec5 p\strokec7 , \strokec5 b\strokec7  - \strokec5 f\strokec7 , \strokec5 b\strokec7 ));\strokec4 \
```\
\
The first band skips the ease-in and the last band skips the ease-out, so the journey starts and ends with text already settled.\
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Text assembly progress**
\f1\b0 \strokec4  (the \strokec3 `--k`\strokec4  variable the choreography section below runs on) settles roughly 20vh into the band, leaving the long fully-settled plateau:\
\
```js\
\strokec6 const\strokec7  \strokec9 clamp\strokec7  = (\strokec20 v\strokec7 , \strokec20 lo\strokec7 , \strokec20 hi\strokec7 ) \strokec6 =>\strokec7  \strokec19 Math\strokec7 .\strokec18 min\strokec7 (\strokec5 hi\strokec7 , \strokec19 Math\strokec7 .\strokec18 max\strokec7 (\strokec5 lo\strokec7 , \strokec5 v\strokec7 ));\strokec4 \
\strokec6 const\strokec7  \strokec3 k\strokec7  = \strokec9 clamp\strokec7 ((\strokec5 p\strokec7  - \strokec5 a\strokec7 ) / (\strokec5 ramp\strokec7  || \strokec19 Math\strokec7 .\strokec18 min\strokec7 (\strokec15 0.025\strokec7 , (\strokec5 b\strokec7  - \strokec5 a\strokec7 ) * \strokec15 0.35\strokec7 )), \strokec15 0\strokec7 , \strokec15 1\strokec7 );\strokec4 \
```\
\
\strokec3 `ramp`\strokec4  is the band's optional \strokec3 `data-ramp`\strokec4  override, described in the choreography section. Apply all of it with delta-gated writes, like every other scroll-driven DOM touch.\
\

\f0\b \strokec5 **The flick test (how a beat map is validated):**
\f1\b0 \strokec4  simulate wheel steps of 120px (a normal flick), 240px, and 360px (an aggressive double-flick). Every beat must remain readable for 5 to 6 normal flicks, and no beat may be skippable even at 360px steps. Slow dragging proves nothing; real visitors flick. If a caption fails the test, merge it into a neighbor. Never shrink the ramps to squeeze a failing beat in.\
\
The harness is a small loop run on the page through the browser tool (or pasted into the console), one step size per run:\
\
```js\
\strokec16 // flick(120, 12), then flick(240, 8), then flick(360, 6). Start from the top each run.\strokec4 \
\strokec17 async\strokec7  \strokec6 function\strokec7  \strokec9 flick\strokec7 (\strokec20 step\strokec7 , \strokec20 count\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec8 for\strokec5  (\strokec6 let\strokec5  i \strokec7 =\strokec5  \strokec15 0\strokec5 ; i \strokec7 <\strokec5  count; i\strokec7 ++\strokec5 ) \{\strokec4 \
\strokec5     window.\strokec9 scrollBy\strokec5 (\strokec15 0\strokec5 , step);\strokec4 \
\strokec5     \strokec8 await\strokec5  \strokec17 new\strokec5  \strokec19 Promise\strokec5 (\strokec20 r\strokec5  \strokec6 =>\strokec5  \strokec18 setTimeout\strokec5 (r, \strokec15 400\strokec5 ));   \strokec16 // a beat between flicks, like a real reader\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 bands\strokec5  \strokec7 =\strokec5  [\strokec7 ...\strokec5 document.\strokec9 querySelectorAll\strokec5 (\strokec10 '.band'\strokec5 )]\strokec4 \
\strokec5       .\strokec9 map\strokec5 ((\strokec20 b\strokec5 , \strokec20 n\strokec5 ) \strokec6 =>\strokec5  n \strokec7 +\strokec5  \strokec10 ':'\strokec5  \strokec7 +\strokec5  \strokec9 getComputedStyle\strokec5 (b).opacity);\strokec4 \
\strokec5     console.\strokec9 log\strokec5 (\strokec10 'y='\strokec5  \strokec7 +\strokec5  \strokec19 Math\strokec5 .\strokec18 round\strokec5 (scrollY), bands.\strokec9 join\strokec5 (\strokec10 '  '\strokec5 ));\strokec4 \
\strokec5   \}\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Read the logged opacities between steps. A band that never reaches full opacity anywhere in the 360px run is a skippable beat. A band that holds full opacity for fewer than 5 consecutive 120px steps is too short to read.\
\

\f0\b \strokec3 ## The legibility system (text over live footage)
\f1\b0 \strokec4 \
\
Law 10 in \strokec3 `prompt-laws.md`\strokec4 : live video behind type is a moving background you do not control frame to frame. Every hero text band gets all four layers below, then passes the audit.\
\

\f0\b \strokec5 **1. The global base scrim.**
\f1\b0 \strokec4  One soft radial darkening (a scrim is a translucent dark layer) over the whole video, always on, so no frame is ever raw behind the page:\
\
```css\
\strokec21 .scrim\strokec7 \{\strokec13 position\strokec7 :\strokec22 absolute\strokec7 ;\strokec13 inset\strokec7 :\strokec15 0\strokec7 ;\strokec13 pointer-events\strokec7 :\strokec22 none\strokec7 ;\strokec13 background\strokec7 :\strokec18 radial-gradient\strokec7 (\strokec22 ellipse\strokec7  \strokec15 120%\strokec7  \strokec15 90%\strokec7  at \strokec15 50%\strokec7  \strokec15 45%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 10\strokec7 ,\strokec15 10\strokec7 ,\strokec15 18\strokec7 ,\strokec15 0\strokec7 ) \strokec15 35%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 10\strokec7 ,\strokec15 10\strokec7 ,\strokec15 18\strokec7 ,\strokec15 .62\strokec7 ) \strokec15 100%\strokec7 )\}\strokec4 \
```\
\

\f0\b \strokec5 **2. The per-band scrim.**
\f1\b0 \strokec4  Each band's \strokec3 `::before`\strokec4  carries a radial scrim that rides the band's JS-driven opacity and deepens with the band's \strokec3 `--k`\strokec4  progress variable, so the footage dims exactly while that band's text is on and nowhere else. Dim, never flatten: the gradient dies out by 76 percent so the corners stay live. The working shape:\
\
```css\
\strokec21 .band::before\strokec7 \{\strokec13 content\strokec7 :\strokec10 ""\strokec7 ;\strokec13 position\strokec7 :\strokec22 absolute\strokec7 ;\strokec13 inset\strokec7 :\strokec15 -4%\strokec7 ;\strokec13 pointer-events\strokec7 :\strokec22 none\strokec7 ;\strokec13 opacity\strokec7 :\strokec18 calc\strokec7 (\strokec15 .25\strokec7  + \strokec15 .75\strokec7 *\strokec18 var\strokec7 (\strokec20 --k\strokec7 ,\strokec15 1\strokec7 ));\strokec13 background\strokec7 :\strokec18 radial-gradient\strokec7 (\strokec22 ellipse\strokec7  \strokec15 74%\strokec7  \strokec15 62%\strokec7  at \strokec15 50%\strokec7  \strokec15 50%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .66\strokec7 ) \strokec15 0%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .44\strokec7 ) \strokec15 46%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 0\strokec7 ) \strokec15 76%\strokec7 )\}\strokec4 \
```\
\
Tune the peak alpha per band against that band's actual frames. The proven range: 0.62 for quiet beats up to 0.72 for the hook. These peak alphas are also the constants to nudge when the user asks for the footage to read brighter.\
\

\f0\b \strokec5 **The two-sided variant for centered-action compositions.**
\f1\b0 \strokec4  The single centered radial above assumes the subject sits off-center with the text flanking it. When the subject is centered and text columns sit on BOTH sides of it (a natural request), never stretch one scrim across the middle. Use two: one pseudo-element anchored on the left column and one on the right, each an ellipse centered on its own column, with the center lane left completely alone so the subject stays bright. The settle band, where the columns converge, gets a single upper-centered ellipse instead. This variant is not a compromise: a real build measured 7.17 to 1 worst-pixel contrast with it.\
\

\f0\b \strokec5 **3. The text-shadow token.**
\f1\b0 \strokec4  Three layers (a tight edge, a mid glow, a wide falloff), applied to every hero band and turned off on buttons, where a shadowed label reads as grime:\
\
```css\
\strokec13 :root\strokec7 \{\strokec20 --tshadow\strokec7 :\strokec15 0\strokec7  \strokec15 1px\strokec7  \strokec15 2px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .95\strokec7 ),\strokec15 0\strokec7  \strokec15 3px\strokec7  \strokec15 12px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .78\strokec7 ),\strokec15 0\strokec7  \strokec15 10px\strokec7  \strokec15 44px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .8\strokec7 )\}\strokec4 \
\strokec21 .band\strokec7 \{\strokec13 text-shadow\strokec7 :\strokec18 var\strokec7 (\strokec20 --tshadow\strokec7 )\}\strokec4 \
\strokec21 .band\strokec7  \strokec21 .btn\strokec7 \{\strokec13 text-shadow\strokec7 :\strokec22 none\strokec7 \}\strokec4 \
```\
\

\f0\b \strokec5 **4. The chip scrim for small text.**
\f1\b0 \strokec4  HUD lines, readouts, and small labels over footage do not get the big radial. They get a chip, a small blurred backing pill:\
\
```css\
\strokec21 .chip\strokec7 \{\strokec13 background\strokec7 :\strokec18 rgba\strokec7 (\strokec15 8\strokec7 ,\strokec15 8\strokec7 ,\strokec15 15\strokec7 ,\strokec15 .55\strokec7 );\strokec13 border\strokec7 :\strokec15 1px\strokec7  \strokec22 solid\strokec7  \strokec18 rgba\strokec7 (\strokec15 96\strokec7 ,\strokec15 96\strokec7 ,\strokec15 126\strokec7 ,\strokec15 .3\strokec7 );\strokec13 border-radius\strokec7 :\strokec15 10px\strokec7 ;\strokec13 backdrop-filter\strokec7 :\strokec18 blur\strokec7 (\strokec15 10px\strokec7 );\strokec13 text-shadow\strokec7 :\strokec15 0\strokec7  \strokec15 1px\strokec7  \strokec15 3px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .85\strokec7 )\}\strokec4 \
```\
\

\f0\b \strokec5 **The worst-frame audit (what makes the system honest).**
\f1\b0 \strokec4  Extract each band's frames, canvas-sample the pixels under the text zone WITH the scrim applied, and require worst-pixel contrast of at least 3.5:1 for every band. Well-tuned bands land well clear of that floor. Tune scrim alphas against the worst frame, never the average. The average frame lies; the worst frame is the one a visitor will be mid-read on.\
\

\f0\b \strokec5 **The preferred method, when a controllable browser exists**
\f1\b0 \strokec4  (the headless Chrome route in \strokec3 `troubleshooting.md`\strokec4 ): inject \strokec3 `visibility: hidden`\strokec4  on the split text spans, screenshot the real composited page at that scroll position, and find the lightest pixel inside the text's bounding box. This measures every scrim layer and the radial falloff exactly as the visitor sees them, and it is conservative, because hiding the glyphs also removes their text shadow. The frame-plus-math procedure below is the fallback when no browser can be driven.\
\
The procedure, concretely:\
\
\strokec20 1.\strokec4  Convert each band's range to video time (\strokec3 `time = progress * duration`\strokec4 ) and extract three or four frames across it with ffmpeg: \strokec3 `ffmpeg -ss <t> -i assets/hero-scrub.mp4 -frames:v 1 review/band2-a.png`\strokec4 .\
\strokec20 2.\strokec4  For each frame, composite the band's scrim at its peak alpha over the text zone and find the worst pixel. For light text that is the lightest surviving pixel. This snippet does the whole step:\
\
```js\
\strokec16 // auditFrame('audit/band2-a.png', \{x:420,y:300,w:600,h:200\}, 0.66, [244,242,236])\strokec4 \
\strokec16 // zone is the text's pixel box in the frame, alpha is the band scrim's peak, textColor is RGB\strokec4 \
\strokec17 async\strokec7  \strokec6 function\strokec7  \strokec9 auditFrame\strokec7 (\strokec20 src\strokec7 , \strokec20 zone\strokec7 , \strokec20 scrimAlpha\strokec7 , \strokec20 textColor\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 img\strokec5  \strokec7 =\strokec5  \strokec8 await\strokec5  \strokec9 createImageBitmap\strokec5 (\strokec8 await\strokec5  (\strokec8 await\strokec5  \strokec9 fetch\strokec5 (src)).\strokec9 blob\strokec5 ());\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 c\strokec5  \strokec7 =\strokec5  \strokec17 new\strokec5  \strokec9 OffscreenCanvas\strokec5 (img.width, img.height).\strokec9 getContext\strokec5 (\strokec10 '2d'\strokec5 );\strokec4 \
\strokec5   c.\strokec9 drawImage\strokec5 (img, \strokec15 0\strokec5 , \strokec15 0\strokec5 );\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 d\strokec5  \strokec7 =\strokec5  c.\strokec9 getImageData\strokec5 (zone.x, zone.y, zone.w, zone.h).data;\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec9 lum\strokec5  \strokec7 =\strokec5  ([\strokec20 r\strokec5 , \strokec20 g\strokec5 , \strokec20 b\strokec5 ]) \strokec6 =>\strokec5  \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec9 f\strokec5  \strokec7 =\strokec5  \strokec20 v\strokec5  \strokec6 =>\strokec5  \{ v \strokec7 /=\strokec5  \strokec15 255\strokec5 ; \strokec8 return\strokec5  v \strokec7 <=\strokec5  \strokec15 0.03928\strokec5  \strokec7 ?\strokec5  v \strokec7 /\strokec5  \strokec15 12.92\strokec5  \strokec7 :\strokec5  ((v \strokec7 +\strokec5  \strokec15 0.055\strokec5 ) \strokec7 /\strokec5  \strokec15 1.055\strokec5 ) \strokec7 **\strokec5  \strokec15 2.4\strokec5 ; \};\strokec4 \
\strokec5     \strokec8 return\strokec5  \strokec15 0.2126\strokec5  \strokec7 *\strokec5  \strokec9 f\strokec5 (r) \strokec7 +\strokec5  \strokec15 0.7152\strokec5  \strokec7 *\strokec5  \strokec9 f\strokec5 (g) \strokec7 +\strokec5  \strokec15 0.0722\strokec5  \strokec7 *\strokec5  \strokec9 f\strokec5 (b);\strokec4 \
\strokec5   \};\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 scrim\strokec5  \strokec7 =\strokec5  [\strokec15 5\strokec5 , \strokec15 5\strokec5 , \strokec15 10\strokec5 ];                      \strokec16 // the scrim's base color\strokec4 \
\strokec5   \strokec6 let\strokec5  worst \strokec7 =\strokec5  \strokec15 0\strokec5 ;\strokec4 \
\strokec5   \strokec8 for\strokec5  (\strokec6 let\strokec5  i \strokec7 =\strokec5  \strokec15 0\strokec5 ; i \strokec7 <\strokec5  d.\strokec3 length\strokec5 ; i \strokec7 +=\strokec5  \strokec15 4\strokec5 ) \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 px\strokec5  \strokec7 =\strokec5  [\strokec15 0\strokec5 , \strokec15 1\strokec5 , \strokec15 2\strokec5 ].\strokec9 map\strokec5 (\strokec20 j\strokec5  \strokec6 =>\strokec5  d[i \strokec7 +\strokec5  j] \strokec7 *\strokec5  (\strokec15 1\strokec5  \strokec7 -\strokec5  scrimAlpha) \strokec7 +\strokec5  scrim[j] \strokec7 *\strokec5  scrimAlpha);\strokec4 \
\strokec5     worst \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 max\strokec5 (worst, \strokec9 lum\strokec5 (px));            \strokec16 // lightest pixel, the worst case for light text\strokec4 \
\strokec5   \}\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 lt\strokec5  \strokec7 =\strokec5  \strokec9 lum\strokec5 (textColor);\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 hi\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 max\strokec5 (lt, worst), \strokec3 lo\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (lt, worst);\strokec4 \
\strokec5   \strokec8 return\strokec5  (hi \strokec7 +\strokec5  \strokec15 0.05\strokec5 ) \strokec7 /\strokec5  (lo \strokec7 +\strokec5  \strokec15 0.05\strokec5 );              \strokec16 // must be at least 3.5\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Run it through the browser tool on the previewed page. If fetching from \strokec3 `review/`\strokec4  is blocked, copy the frames into \strokec3 `assets/audit/`\strokec4  for the audit and delete that folder before anything is zipped.\
\
\strokec20 3.\strokec4  Every band's returned ratio must be at least 3.5:1. A failing band gets a deeper peak alpha on its scrim, then a re-audit against the same worst frame.\
\

\f0\b \strokec3 ## Text choreography (an entrance personality per beat)
\f1\b0 \strokec4 \
\

\f0\b \strokec5 **The echo principle:**
\f1\b0 \strokec4  every hero beat gets its own entrance, and the entrance echoes what the footage is doing at that moment. Words drift down while something falls. A word punches in as an impact lands. Characters scatter-assemble while ink gathers. Entrance and footage read as one event, which is what makes the page feel directed instead of decorated.\
\
The engineering is the fixed part, for every entrance including ones you invent: all effects are \strokec3 `transform`\strokec4  and \strokec3 `opacity`\strokec4  only, scroll-scrubbed off the band's \strokec3 `--k`\strokec4  custom property (0 to 1 assembly progress, written by the drive loop and delta-gated at 0.008 so converged bands cost nothing), and fully reversible (scroll up and they disassemble; band one's one-time load ramp is the single designed exception).\
\

\f0\b \strokec5 **The first band opens settled, characters included.**
\f1\b0 \strokec4  The band pattern above already skips band one's opacity ease-in, but that alone is not enough: at scroll zero the band's \strokec3 `--k`\strokec4  is still 0, so its characters sit unassembled and the hero opens on footage with no words until the user scrolls. Give band one a one-time, time-based assembly ramp on load that hands over to scroll: drive its entrance with \strokec3 `k = max(scrollK, loadK)`\strokec4 , where \strokec3 `loadK`\strokec4  eases from 0 to 1 over the first moments after the page appears. Once \strokec3 `loadK`\strokec4  reaches 1 the max holds band one assembled, which is right for the opening beat: there is nothing above it to scroll back to. Every later band stays purely scroll-driven and reversible.\
\

\f0\b \strokec5 **Splitting, done once at load.**
\f1\b0 \strokec4  Split headline text into word and character spans in JS with a seeded pseudo-random generator, so the "random" offsets are identical on every load:\
\
```js\
\strokec6 function\strokec7  \strokec9 rng\strokec7 (\strokec20 seed\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec6 let\strokec5  s \strokec7 =\strokec5  seed \strokec7 >>>\strokec5  \strokec15 0\strokec5 ;\strokec4 \
\strokec5   \strokec8 return\strokec5  () \strokec6 =>\strokec5  (s \strokec7 =\strokec5  (s \strokec7 *\strokec5  \strokec15 1664525\strokec5  \strokec7 +\strokec5  \strokec15 1013904223\strokec5 ) \strokec7 >>>\strokec5  \strokec15 0\strokec5 ) \strokec7 /\strokec5  \strokec15 4294967296\strokec5 ;\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Wrap a visually-hidden span holding the full sentence for screen readers, plus an \strokec3 `aria-hidden="true"`\strokec4  visual copy built of \strokec3 `.w`\strokec4  word spans containing \strokec3 `.c`\strokec4  character spans. Assign each span its custom properties (\strokec3 `--th`\strokec4 , \strokec3 `--jx`\strokec4 , \strokec3 `--jy`\strokec4 , \strokec3 `--jr`\strokec4 ) from the seeded generator at split time.\
\

\f0\b \strokec5 **The menu (worked examples, each named with the footage moment it echoes):**
\f1\b0 \strokec4 \
\

\f0\b \strokec5 **(a) Scatter.**
\f1\b0 \strokec4  Per-character fly-in from seeded random offsets; echoes ink gathering, particles assembling, debris settling. Each \strokec3 `.c`\strokec4  gets \strokec3 `--th`\strokec4  (a random threshold, 0 to 0.55) and \strokec3 `--jx`\strokec4 /\strokec3 `--jy`\strokec4 /\strokec3 `--jr`\strokec4  jitter values:\
\
```css\
\strokec21 .c\strokec7 \{\strokec20 --kc\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ))*2.6,1);\strokec13 opacity\strokec7 :\strokec18 var\strokec7 (\strokec20 --kc\strokec7 );\strokec4 \
\strokec7    \strokec13 transform\strokec7 :\strokec18 translate\strokec7 (\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --jx\strokec7 ,\strokec15 0px\strokec7 )),\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --jy\strokec7 ,\strokec15 0px\strokec7 )))\strokec4 \
\strokec7              \strokec18 rotate\strokec7 (\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --jr\strokec7 ,\strokec15 0deg\strokec7 )))\}\strokec4 \
```\
\

\f0\b \strokec5 **(b) Grid snap-align.**
\f1\b0 \strokec4  Characters slide horizontally into place in reading order. Same CSS as scatter with horizontal-only jitter, but the threshold is ordered instead of random: \strokec3 `--th: charIndex / total * spread + rng() * 0.06`\strokec4 , so the spread value controls how long the stagger runs.\
\

\f0\b \strokec5 **(c) Blur-to-sharp.**
\f1\b0 \strokec4  The entrance for the quiet beat; echoes mist clearing or focus arriving. Two stacked copies of the text crossfaded by opacity only. The soft copy carries a STATIC \strokec3 `filter: blur(10px)`\strokec4 ; never animate \strokec3 `filter`\strokec4  itself, it is not compositor-friendly. The sharp copy fades in with \strokec3 `--k`\strokec4 , the soft copy fades out.\
\

\f0\b \strokec5 **(d) Word-punch with overshoot.**
\f1\b0 \strokec4  Echoes an impact landing. Word-level pop (\strokec3 `--kc`\strokec4 ) and a slower settle (\strokec3 `--ks`\strokec4 ); the word scales past 1 and eases back:\
\
```css\
\strokec21 .w\strokec7 \{\strokec20 --kc\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ))*3,1);\strokec4 \
\strokec7    \strokec20 --ks\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --sd\strokec7 ,\strokec15 .1\strokec7 ))*\strokec3 var\strokec7 (\strokec20 --ss\strokec7 ,3.2),1);\strokec4 \
\strokec7    \strokec13 opacity\strokec7 :\strokec18 var\strokec7 (\strokec20 --kc\strokec7 );\strokec4 \
\strokec7    \strokec13 transform\strokec7 :\strokec18 scale\strokec7 (\strokec18 calc\strokec7 (\strokec15 0.6\strokec7  + (\strokec15 0.4\strokec7  + \strokec18 var\strokec7 (\strokec20 --ov\strokec7 ,\strokec15 .12\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --kc\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --ov\strokec7 ,\strokec15 .12\strokec7 )*\strokec18 var\strokec7 (\strokec20 --ks\strokec7 )))\}\strokec4 \
\strokec21 .w.em\strokec7 \{\strokec20 --ov\strokec7 :\strokec15 0.24\strokec7 ;\strokec20 --sd\strokec7 :\strokec15 0.16\strokec7 ;\strokec20 --ss\strokec7 :\strokec15 2.6\strokec7 \}\strokec4 \
```\
\
Emphasized words (\strokec3 `.em`\strokec4 ) get the bigger overshoot with the later, slower settle, so they hang in the overshoot a beat longer.\
\

\f0\b \strokec5 **(e) Word-by-word rise into a staged settle.**
\f1\b0 \strokec4  The proven ending entrance, matching the footage's arrival at rest. Headline words rise in reading order (\strokec3 `--th`\strokec4  per word), then the subline fades via \strokec3 `--ks: clamp(0, (var(--k) - 0.66) * 4, 1)`\strokec4 , then the CTA row via \strokec3 `--kb: clamp(0, (var(--k) - 0.78) * 5, 1)`\strokec4 . Three arrivals, one band.\
\

\f0\b \strokec5 **(f) Drift-down.**
\f1\b0 \strokec4  Echoes a fall or a pour. Each word starts above its resting spot and drifts down into place:\
\
```css\
\strokec21 .w\strokec7 \{\strokec20 --kc\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ))*2.8,1);\strokec13 opacity\strokec7 :\strokec18 var\strokec7 (\strokec20 --kc\strokec7 );\strokec4 \
\strokec7    \strokec13 transform\strokec7 :\strokec18 translateY\strokec7 (\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec15 -24px\strokec7 ))\}\strokec4 \
```\
\

\f0\b \strokec5 **(g) Approach-from-depth.**
\f1\b0 \strokec4  Echoes a tunnel or a forward push. The line starts slightly small and grows into place as if approaching the camera: \strokec3 `transform: scale(calc(0.82 + 0.18 * var(--kc)))`\strokec4  with opacity riding \strokec3 `--kc`\strokec4 . Stack a static-blur soft copy under it (the blur-to-sharp pattern) when the approach should also sharpen.\
\

\f0\b \strokec5 **(h) Halves parting.**
\f1\b0 \strokec4  Echoes folds opening or curtains parting. Split the headline into two halves; each starts pulled toward the center line and slides outward to rest as \strokec3 `--kc`\strokec4  rises, opposite signs of \strokec3 `--jx`\strokec4  per half.\
\

\f0\b \strokec5 **(i) Weave.**
\f1\b0 \strokec4  Echoes threads crossing or strands interleaving. Characters arrive alternating from above and below: the scatter CSS with vertical-only jitter and \strokec3 `--jy`\strokec4  signs alternating by character index.\
\

\f0\b \strokec5 **This menu is examples, not a closed set.**
\f1\b0 \strokec4  Inventing a new entrance to fit this footage is the job. Take the moment the band sits on, ask what the footage is physically doing, and build the entrance that does the same thing to the words. Every invention keeps the fixed part: transform and opacity only, scrubbed off the band's \strokec3 `--k`\strokec4 , fully reversible on scroll-up (band one's one-time load ramp is the single designed exception).\
\

\f0\b \strokec5 **The control pattern (tune a beat without touching band math):**
\f1\b0 \strokec4  each band takes two optional HTML attributes. \strokec3 `data-ramp`\strokec4  overrides the default assembly window (the default is \strokec3 `Math.min(0.025, bandLength * 0.35)`\strokec4  of progress; \strokec3 `data-ramp="0.036"`\strokec4  savors an assembly about 50 percent longer). \strokec3 `data-spread`\strokec4  sets the character-stagger spread for scatter and grid entrances. Any beat's feel is tuned from its markup, and the drive loop never changes.\
\

\f0\b \strokec3 ## The static-hero gate (five conditions, in CSS AND JS)
\f1\b0 \strokec4 \
\
Some visitors get a composed static image hero instead of the scrub. The five gates, and they must match EXACTLY in the CSS media queries and the JavaScript decision, or one side loads assets the other side hides:\
\
\strokec20 1.\strokec4  Phones: \strokec3 `(max-width: 720px)`\strokec4 \
\strokec20 2.\strokec4  Portrait tablets: \strokec3 `(orientation: portrait) and (max-width: 1024px)`\strokec4 \
\strokec20 3.\strokec4  Coarse-pointer portrait: \strokec3 `(orientation: portrait) and (pointer: coarse)`\strokec4 \
\strokec20 4.\strokec4  Landscape phones: \strokec3 `(orientation: landscape) and (pointer: coarse) and (max-height: 560px)`\strokec4  (a phone held sideways passes every width check but has no room for the journey)\
\strokec20 5.\strokec4  Reduced motion: \strokec3 `(prefers-reduced-motion: reduce)`\strokec4 \
\

\f0\b \strokec5 **The gate is decided live, not once at load.**
\f1\b0 \strokec4  The CSS media queries re-evaluate on every rotation, resize, and preference flip. A one-shot JS check leaves a blank multi-viewport hero the moment a tablet rotates from portrait to landscape, a snapped window gets maximized past 720px, or reduced motion is switched off mid-session: the CSS un-hides the scrub stage, but no poster, no video, and no scroll listener exist on the JS side. Wire the change event of all five queries to one function that arms and disarms the scrub:\
\
```js\
\strokec6 const\strokec7  \strokec3 GATES\strokec7  = [\strokec4 \
\strokec7   \strokec10 '(max-width: 720px)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(orientation: portrait) and (max-width: 1024px)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(orientation: portrait) and (pointer: coarse)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(prefers-reduced-motion: reduce)'\strokec4 \
\strokec7 ];\strokec4 \
\strokec6 let\strokec7  \strokec5 scrubOn\strokec7  = \strokec17 false\strokec7 ;\strokec4 \
\strokec6 function\strokec7  \strokec9 enableScrub\strokec7 ()\strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (scrubOn) \strokec8 return\strokec5 ; scrubOn \strokec7 =\strokec5  \strokec17 true\strokec5 ;\strokec4 \
\strokec5   \strokec9 initHeroOnce\strokec5 ();                       \strokec16 // wrap the poster paint and the startBlobFetch flow from the Blob loader section above in one run-once function; this call is that wrapper\strokec4 \
\strokec5   \strokec9 addEventListener\strokec5 (\strokec10 'scroll'\strokec5 , onScroll, \{\strokec13 passive:\strokec17 true\strokec5 \});\strokec4 \
\strokec5   bands.\strokec9 forEach\strokec5 (\strokec20 b\strokec5  \strokec6 =>\strokec5  \{ b.op \strokec7 =\strokec5  \strokec7 -\strokec15 1\strokec5 ; b.k \strokec7 =\strokec5  \strokec7 -\strokec15 1\strokec5  \});   \strokec16 // reset caches so stale pinned styles get rewritten\strokec4 \
\strokec5   \strokec9 unpinFinalStates\strokec5 ();                   \strokec16 // undo whatever pinToFinalStates applied, so lines, counters, and holds go back to being scroll-driven\strokec4 \
\strokec5   \strokec9 updateCaptions\strokec5 (\strokec9 heroProgress\strokec5 ());\strokec4 \
\strokec5   \strokec9 onScroll\strokec5 ();                           \strokec16 // re-seek the video to the current scroll position; without this the frame sits stale until the user scrolls\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 function\strokec7  \strokec9 disableScrub\strokec7 ()\strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec7 !\strokec5 scrubOn) \strokec8 return\strokec5 ; scrubOn \strokec7 =\strokec5  \strokec17 false\strokec5 ;\strokec4 \
\strokec5   \strokec9 removeEventListener\strokec5 (\strokec10 'scroll'\strokec5 , onScroll);\strokec4 \
\strokec5   \strokec8 if\strokec5  (rafId \strokec7 !==\strokec5  \strokec17 null\strokec5 ) \{ \strokec9 cancelAnimationFrame\strokec5 (rafId); rafId \strokec7 =\strokec5  \strokec17 null\strokec5  \}\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 function\strokec7  \strokec9 applyHeroMode\strokec7 ()\strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec3 GATES\strokec5 .\strokec9 some\strokec5 (\strokec20 q\strokec5  \strokec6 =>\strokec5  \strokec9 matchMedia\strokec5 (q).matches)) \strokec9 disableScrub\strokec5 ();\strokec4 \
\strokec5   \strokec8 else\strokec5  \strokec9 enableScrub\strokec5 ();\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 const\strokec7  \strokec3 MQLS\strokec7  = \strokec3 GATES\strokec7 .\strokec9 map\strokec7 (\strokec20 q\strokec7  \strokec6 =>\strokec7  \strokec9 matchMedia\strokec7 (\strokec5 q\strokec7 ));   \strokec16 // keep the query lists referenced; unreferenced ones have historically lost their listeners in old browsers\strokec4 \
\strokec3 MQLS\strokec7 .\strokec9 forEach\strokec7 (\strokec20 m\strokec7  \strokec6 =>\strokec7  \strokec5 m\strokec7 .\strokec9 addEventListener\strokec7 (\strokec10 'change'\strokec7 , \strokec5 applyHeroMode\strokec7 ));\strokec4 \
\strokec9 applyHeroMode\strokec7 ();\strokec4 \
```\
\
All five strings must be character-for-character identical in both places, and the poster and Blob fetch still live ONLY inside the gated path.\
\
A related guard for scrub-capable screens that are merely short (a shallow desktop window, not a phone): keep the scrub but hide whatever small scroll-driven overlays the page has (cues, readouts, tickers), which have no room. An example with one build's class names; use your own:\
\
```css\
\strokec8 @media\strokec7  (\strokec13 max-height\strokec7 :\strokec15 560px\strokec7 )\{\strokec21 .cue\strokec7 ,\strokec21 .hud\strokec7 ,\strokec21 .feed\strokec7 \{\strokec13 display\strokec7 :\strokec22 none\strokec7 \}\}\strokec4 \
```\
\
The static hero is a designed layout, not a fallback apology: the poster or ending frame composed with the captions visible. A mobile decision is made consciously per project. Static hero is the default. Consider a cover-cropped mobile scrub only when all three hold: the encoded video is small (under about 8 MB), the composition still reads when cover-cropped to portrait (the action lane survives the crop), and the result is verified on a real phone. When any of the three fails, ship the static hero proudly.\
\

\f0\b \strokec3 ## Complete without the video
\f1\b0 \strokec4 \
\
The page must be complete and beautiful if the video never loads. Wire the video's \strokec3 `error`\strokec4  event to hide the dead video element over the poster background. Every caption, every section, and the call to action must work with a still image behind them. Test this state on purpose by renaming the video file and loading the page.\
\

\f0\b \strokec3 ## The motion system around the hero
\f1\b0 \strokec4 \
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Nothing snaps.**
\f1\b0 \strokec4  Every appearance, hover, and state change eases. Define two easing curves as tokens and use them everywhere. Even the page itself eases in.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Entrances are choreography.**
\f1\b0 \strokec4  IntersectionObserver adds an \strokec3 `.in`\strokec4  class; children arrive in sequence with 60 to 150ms stagger steps. Entrance start and end states must be prefixed with the container class (\strokec3 `.card .part`\strokec4 , \strokec3 `.card.in .part`\strokec4 ) so they win the cascade; a later rule can otherwise silently cancel the animation. And when the entrance is done, RETIRE the stagger delays: the cleanup rule that zeroes \strokec3 `transition-delay`\strokec4  must match or beat the specificity of the nth-child delay rules it retires (\strokec3 `:nth-child`\strokec4  counts as a class), or it silently never applies and every hover on the later siblings lags by the stagger forever. Prove the retirement by hovering the second and third items after the entrance finishes.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Never put a dynamic style on an element that also has a \strokec3 `forwards`\strokec5  entrance animation.**
\f1\b0 \strokec4  The animation's final value wins permanently. Entrance on the parent, dynamic style on a child.\
\strokec20 -\strokec4  
\f0\b \strokec5 **One living element per section**
\f1\b0 \strokec4  at whisper level after its entrance: a slow cycle or soft glow pulse, four seconds or longer. Give looping animations negative delays (like \strokec3 `-1.2s`\strokec4 ) so they are mid-cycle at first paint. Pause them off-screen by scoping the animation rules to a class an IntersectionObserver toggles, and pause everything on hidden tabs with one body class. \strokec3 `animation-play-state`\strokec4  is not an inherited property, so setting it on a container silently never reaches nested elements or pseudo-elements. The pattern that cannot miss: \strokec3 `body.paused *, body.paused *::before, body.paused *::after \{ animation-play-state: paused !important \}`\strokec4 , toggled on \strokec3 `visibilitychange`\strokec4 .\
\strokec20 -\strokec4  
\f0\b \strokec5 **One designed interactive moment per site.**
\f1\b0 \strokec4  Designed, not decorative; the proven shape has its own section below.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Animate only \strokec3 `transform`\strokec5  and \strokec3 `opacity`\strokec5 .**
\f1\b0 \strokec4  For glow pulses, put the shadow on a pseudo-element at full strength and animate its opacity.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Masked text needs descender room:**
\f1\b0 \strokec4  any \strokec3 `overflow: hidden`\strokec4  reveal gets em-based padding/negative-margin breathing room or g, y, and p get their tails cut.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Never overwrite \strokec3 `el.style.transition`\strokec5  in JavaScript.**
\f1\b0 \strokec4  Toggle a class that declares the full combined transition.\
\

\f0\b \strokec3 ## The one interactive moment (the proven shape)
\f1\b0 \strokec4 \
\
One per site, on-theme, performed mid-journey. The shape that has worked repeatedly: an action that mirrors the product's own story. A press-and-hold that lets a scent settle. A press-and-hold that pulls a thread and stitches a seam closed. The visitor does not just read the brand's one idea; they perform it.\
\
The mechanics that make it feel designed rather than gimmicky:\
\
\strokec20 -\strokec4  Progress builds while the visitor holds.\
\strokec20 -\strokec4  Releasing early eases the progress back down; it never snaps to zero.\
\strokec20 -\strokec4  Completing it lights up the section's content in sequence, so the visitor's action earns something real.\
\strokec20 -\strokec4  Reduced motion gets the instant final state, no hold required.\
\
The hold is an example, not a law. Any interaction works if it enacts the brand's one idea.\
\

\f0\b \strokec3 ## Overflow and reduced motion
\f1\b0 \strokec4 \
\
\strokec20 -\strokec4  \strokec3 `overflow-x: clip`\strokec4  on BOTH \strokec3 `html`\strokec4  and \strokec3 `body`\strokec4 , with \strokec3 `hidden`\strokec4  declared first as a fallback. \strokec3 `hidden`\strokec4  alone still lets code scroll the page sideways, and one anchor link can leave the whole page shifted.\
\strokec20 -\strokec4  Reduced motion is honored COMPLETELY: kill animations and transitions on elements and on \strokec3 `::before`\strokec4 /\strokec3 `::after`\strokec4 , zero every \strokec3 `transition-delay`\strokec4 , show every choreographed element in its final finished state, and re-apply positional transforms per breakpoint (a blanket \strokec3 `transform: none !important`\strokec4  can throw a mobile-positioned element off screen). The video is not loaded at all (it is one of the five static-hero gates).\
\strokec20 -\strokec4  Reduced motion is honored LIVE, in BOTH directions. Listen for the media query's change event. On a flip in, pin every scroll-drawn element to its final drawn state and stop the JS drives: self-drawing lines finish, counters jump to their targets, hold interactions complete. On a flip back out, re-arm the scrub through the same gate function the five queries use, so the caches reset and the captions recompute instead of staying pinned. And undo everything pinToFinalStates applied: remove the pinned classes or inline styles from the drawn lines, the counters, and the hold interactions, so the scroll drives own them again. Re-arming the hero while leaving the rest of the page pinned is the half-fix that looks done and is not.\
\
```js\
\strokec9 matchMedia\strokec7 (\strokec10 '(prefers-reduced-motion: reduce)'\strokec7 ).\strokec9 addEventListener\strokec7 (\strokec10 'change'\strokec7 , \strokec20 e\strokec7  \strokec6 =>\strokec7  \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (e.matches) \strokec9 pinToFinalStates\strokec5 ();   \strokec16 // lines drawn, counters at target, holds done, drives stopped\strokec4 \
\strokec5   \strokec8 else\strokec5  \strokec9 applyHeroMode\strokec5 ();                \strokec16 // motion is back: re-arm the scrub, never leave the pins behind\strokec4 \
\strokec5 \}\strokec7 );\strokec4 \
```\
\

\f0\b \strokec3 ## Design direction (what expensive means)
\f1\b0 \strokec4 \
\
The engineering floor keeps the site from breaking. This bar keeps it from looking like AI made it:\
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Commit to ONE direction pulled from the subject's world**
\f1\b0 \strokec4  and let it drive palette, type, motion, and imagery together, so the page and the footage read as one world.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Invent one signature element**
\f1\b0 \strokec4  unique to this site and spend the boldness budget there. Everything else stays quiet so the signature reads. Then test its loudness: if the signature were removed, would the page meaningfully change? If it would barely change, it is not a signature. Spend the boldness budget on something whose absence would be noticed.\
\strokec20 -\strokec4  
\f0\b \strokec5 **No two adjacent sections share a layout skeleton.**
\f1\b0 \strokec4  If two neighbors both open kicker, headline, lede over the same grid, reshape one. A visitor should never feel the same template stamped twice in a row.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Ban the looks that scream "AI made this,"**
\f1\b0 \strokec4  unless the user explicitly briefs one: cream canvas with a serif and terracotta accent, near-black with acid-green, near-black with a warm amber accent and a high-contrast serif (the next default down whenever anyone says dark, rich, or cinematic), and hairline-border brutalism. One carve-out: these are banned as default reaches, not as subjects. When one of them genuinely IS the subject's own material world (a pottery studio really does live in cream and terracotta), committing to the subject's world wins. Earn it: sample the tones from the footage itself, invent the signature element, and stay clear of the stock template layout, so the page reads as this brand's world and not the default look. Say the deviation out loud.\
\strokec20 -\strokec4  
\f0\b \strokec5 **The accent appears in rare doses:**
\f1\b0 \strokec4  the call to action, focus states, and one or two moments of emphasis. An accent that is everywhere is not an accent.\
\strokec20 -\strokec4  
\f0\b \strokec5 **The canvas is never pure \strokec3 `#000`\strokec5  or \strokec3 `#fff`\strokec5 .**
\f1\b0 \strokec4  Tint it toward the footage's grade.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Make the page one environment:**
\f1\b0 \strokec4  one fixed background layer behind everything (a slow drift, grain, or soft glow in the footage's world), cycling at 60 seconds or longer, so scrolling feels like moving through a place instead of past stacked sections.\
\

\f0\b \strokec3 ## The quality floor (all of it, every time)
\f1\b0 \strokec4 \
\
\strokec20 -\strokec4  Fonts trimmed to only the weights in use, with \strokec3 `preconnect`\strokec4 . Display face with real character, quiet body face, mono for small labels. Never Inter or Roboto as display.\
\strokec20 -\strokec4  Size text blocks in \strokec3 `ch`\strokec4  units on the text element itself, never on a container. A \strokec3 `ch`\strokec4  resolves against the font the element inherits, not the display face inside it, so a container's \strokec3 `ch`\strokec4  cap is measured in the wrong font. Containers get \strokec3 `px`\strokec4  or \strokec3 `min()`\strokec4 . A real build capped a settle block to the body font's \strokec3 `ch`\strokec4  and the headline broke to three lines.\
\strokec20 -\strokec4  Real contrast on the canvas: compute it, don't guess. 4.5:1 body text, 3:1 large text and interface borders. Hairline colors usually fail for interactive borders; give those their own stronger value.\
\strokec20 -\strokec4  Semantic landmarks: \strokec3 `<nav>`\strokec4 , \strokec3 `<main id="main" tabindex="-1">`\strokec4 , \strokec3 `<footer>`\strokec4 , a skip link to \strokec3 `#main`\strokec4 , a real heading hierarchy, and \strokec3 `aria-hidden="true"`\strokec4  on decorations.\
\strokec20 -\strokec4  The scrub video is decorative, so treat it that way: \strokec3 `aria-hidden="true"`\strokec4  on the video element, no \strokec3 `controls`\strokec4  attribute, and keep it out of the tab order (\strokec3 `tabindex="-1"`\strokec4  on the video, or \strokec3 `inert`\strokec4  on the sticky stage's decorative layer) so screen reader and keyboard users land on the captions and content instead.\
\strokec20 -\strokec4  \strokec3 `:focus-visible`\strokec4  styled in the accent. Touch targets at least 44px under \strokec3 `(pointer: coarse)`\strokec4 , added without changing layout: \strokec3 `@media (pointer:coarse)\{ .btn \{ min-height:44px; display:inline-flex; align-items:center; justify-content:center \} \}`\strokec4 . Never swap an element's display type without re-declaring its alignment; a bare \strokec3 `display:inline-flex`\strokec4  left-aligns button labels and shrinks full-width rows to their text.\
\strokec20 -\strokec4  Real \strokec3 `<title>`\strokec4 , meta description, \strokec3 `theme-color`\strokec4 , and an inline SVG favicon of the brand mark.\
\strokec20 -\strokec4  \strokec3 `og:image`\strokec4  and \strokec3 `og:url`\strokec4  need absolute URLs, which do not exist until deploy. Leave a clearly marked \strokec3 `<!-- DEPLOY STEP -->`\strokec4  comment and patch them with the live URL at deploy time (see \strokec3 `deploy.md`\strokec4 ).\
\strokec20 -\strokec4  Decorations never collide with content: absolutely positioned elements get reserved space and hide on short screens with a \strokec3 `max-height`\strokec4  media query.\
\strokec20 -\strokec4  Rows of text align on the baseline (\strokec3 `align-items: baseline`\strokec4 ), not centered boxes.\
\

\f0\b \strokec3 ## The self-testing checklist (run before showing the user anything)
\f1\b0 \strokec4 \
\
Audit adversarially. Prove it, don't assume it:\
\
\strokec20 1.\strokec4  Screenshot the built site at desktop size and at phone widths (375px wide at minimum; check 1280x800, 1440x900, 375x812, 375x667).\
\strokec20 2.\strokec4  Exercise every button and link. Submit the form and confirm its response state.\
\strokec20 3.\strokec4  Scrub the hero at the top, the middle, and the bottom. Then scrub fast. Watch for choppiness, especially in Chrome.\
\strokec20 4.\strokec4  Run the flick test on the beat map: wheel steps of 120px, 240px, and 360px. Every caption readable for 5 to 6 normal flicks, no beat skippable at 360px.\
\strokec20 5.\strokec4  Run the worst-frame legibility audit: every band's worst pixel under the text, with the scrim applied, at 3.5:1 contrast or better.\
\strokec20 6.\strokec4  Prove every entrance actually plays (cascade order can silently kill them).\
\strokec20 7.\strokec4  Try to force the page sideways: anchor links, wide decorations, narrow widths.\
\strokec20 8.\strokec4  Run with reduced motion on: final states visible, no video request made. Then flip reduced motion ON while the page is open, not just before loading it: every scroll-drawn element pins to its final state and the JS drives stop.\
\strokec20 9.\strokec4  Load with the video missing: page still complete over the poster.\
\strokec20 10.\strokec4  Check the browser console at desktop and phone sizes: zero errors.\
\strokec20 11.\strokec4  Check letter tails (g, y, p) in every masked or clipped text at 100 percent zoom.\
\strokec20 12.\strokec4  
\f0\b \strokec5 **The fresh-eyes pass, last.**
\f1\b0 \strokec4  Put the checklist down and look at the page as a first-time visitor with zero context. Does every element have its place, or does anything float unexplained? Is any parallel element unequal: a step without an image, a card styled differently from its siblings? Does the page read as premium and custom-made for this one brand, or does any stretch read as filler? Fix what the fresh eye catches before the user ever sees it. This is a different act from auditing, and it catches what audits cannot.\
\

\f0\b \strokec5 **When a controllable browser exists, run the real checks, not approximations.**
\f1\b0 \strokec4  The headless Chrome route in \strokec3 `troubleshooting.md`\strokec4  gives full control of a real browser, and four of the checks above can only be tested genuinely that way: touch emulation makes \strokec3 `(pointer: coarse)`\strokec4  actually match, the only true test of three of the five static-hero gates; emulated media flips \strokec3 `prefers-reduced-motion`\strokec4  live mid-session, the only true test of the both-directions requirement in step 8; blocking the video's URL with \strokec3 `Network.setBlockedURLs`\strokec4  tests complete-without-video without renaming any file; and a real mouse press and release, with a gap between them, tests the press-and-hold moment as a visitor performs it.\
\
If the environment can field independent reviewers (a second agent, a fresh pair of eyes), aim them at the finished build as well. The checklist proves what you thought to check; adversaries find what you did not think to.\
\
Report what you found and what you fixed. The user's last check is theirs, but they should never be the one to find your bugs.\
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f3 \cf2 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 \
\
# The Hero-Video Laws and Prompt Construction\
\
Design every shot by these laws BEFORE generating. They predict which concepts land first-try and which burn credits. Each one came from a real build that either succeeded because of it or failed without it.\
\
## The twelve laws\
\
1. **The motion agrees with the scroll.** Scrolling down must read as going down, opening up, or arriving: a pour, a descent, a teardown, an approach. Ask of every concept: "when the visitor scrolls down, does this motion feel like down?" A subject that flies UP while the visitor scrolls down fights the page and always loses.\
\
2. **One subject, one continuous motion, no cuts.** A single subject travels through a single journey. Do not ask AI video to turn one thing into a different thing: transformations between two subjects are the hardest shot in AI video and burn money. If the user insists on one, hide the swap inside a flash or cloud moment, keep one unbroken trajectory (same heading, same position, same speed on both sides of the swap), and expect retries.\
\
3. **Lock the path, free the body.** The trajectory stays rigid, but the subject on it must stay alive: natural movement, ripple, small adjustments. The scene needs life too: drifting steam, streaking cloud, shifting light. Never stabilize a shot by freezing the subject. A frozen subject on a clean path reads as dead footage.\
\
4. **Plan the ending first.** The final frame is where the page comes to rest, so write it into the prompt explicitly as a composed, satisfying arrival: the cup settled on the counter, the product assembled, the destination reached. An awkward ending makes an awkward website. If the ending is a product showcase, compose it with generous margin above and below the whole product: the site's header sits over the top of the frame, and cover-cropping eats the edges on wider or shorter screens. A product with its top cut off reads as an accident; squeezed against the nav it reads as busy. The alternative that dodges the problem entirely: a full-bleed texture ending with nothing croppable is text-safe on every screen. Verify by viewing the ending frame with the header mocked over it, at a wide window and a short one, before approving.\
\
5. **Choose forgiving subjects.** Fluids, mist, steam, light, fabric, and distant silhouettes render beautifully. Anything whose exact anatomy every viewer knows up close (controllers, keyboards, hands, familiar animals in detail) will show its errors instantly. Keep risky detail distant, simple, and moving.\
\
6. **Prefer a vertical motion axis.** A straight up-and-down journey matches the scroll axis one to one, so the reveal moves with the page in both directions. Not mandatory, but when two concepts are equal, take the vertical one.\
\
7. **Compose for the layout.** Decide during concept design where the action sits in frame, and leave intentional negative space for the page's captions and story to live in. The action lane stays clear; the words flank it.\
\
8. **Sell the boundary crossings.** When the camera passes through a surface (into water, through mist, past glass), write the physical lens moment into the prompt: a splash, droplets on the lens, a beat of blur. A clean pass through a boundary reads as fake; the mess is the realism.\
\
9. **If the hero features a product, brand it or frame it close.** A generic unbranded object at distance reads as a placeholder. Either apply the brand mark via image editing before animating, or write the ending to land close enough that the object's design carries it.\
\
10. **Text over footage earns its legibility.** Live video behind type is a moving background you do not control frame to frame. So every text band gets a legibility system: a local scrim (a soft dark gradient behind the words) that deepens only while that band is active, a real text shadow, and a contrast check against the WORST frame of that band, never the average. Place each band in the calmest region of its frames. If a line cannot be read at a glance over the busiest moment of its band, it fails. The working system, with code and the audit, is in `scrub-pipeline.md`.\
\
11. **Pace text in scroll distance, not seconds.** A scroll site is read in flicks, not played at 24 frames per second. Give every caption beat a long fully-visible plateau (most of its band, enough to survive several normal scroll flicks) with short eased ramps at the edges, so a reader never sees text pop in and vanish between two flicks and never has to stop dead to catch a line. Test the beat map by flick-scrolling like a real visitor, not by slow dragging. The exact numbers and the flick test are in `scrub-pipeline.md`.\
\
12. **The standing guards:** write "no text, no logos, no lettering anywhere" into every image and video prompt. Decline the generator's preset suggestions when you have a designed shot. And never build the site around footage the user has not approved: silent scaffolding during a render wait is fine, but nothing gets shown or finished until the video passes its gate.\
\
## Prompt construction\
\
### Start frame template (image, 16:9, 2k)\
\
Compose the image as frame one of the motion: the subject positioned so the journey can begin.\
\pard\pardeftab720\partightenfactor0

\f4\fs32 \cf2 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec23 [SUBJECT] at [POSITION IN FRAME], composed as the first moment of a motion\
that will [ONE-SENTENCE JOURNEY]. [LIGHTING: source, direction, mood].\
[PALETTE: the three to five brand colors described as materials and light,\
not hex codes]. [ATMOSPHERE: the ambient life the scene carries]. Intentional\
negative space at [WHERE THE CAPTIONS WILL LIVE]. Cinematic, photorealistic,\
16:9. No text, no logos, no lettering anywhere.\
\
**The negative-space phrasing trap: never name empty space as darkness or emptiness.** When you reserve room for captions, describe the scene as one continuous world filling the frame edge to edge, with the calm region as part of that world: soft shadow, receding depth, a plain surface. Ask for "generous empty darkness left and right" and the model paints literal black side panels, which costs a re-roll. Edge-to-edge phrasing lands first try.\
\
The same trap has a symmetry case. When the composition needs a centered subject, "centered" alone is not enough. Say the subject bisects the frame, dead center, the same distance from the left edge as from the right. Describe both halves as one identical treatment, and explicitly ban objects, machine parts, and bright highlights on either side. A real build took three attempts before this phrasing landed the shot.\
\
If the user supplied a real product photo, that photo can be the start frame instead. Inspect it for resolution and composition first, and confirm the negative space works for the layout.\
\
When the subject is a real person (the owner, the chef, the maker), their photo rides in as a reference image instead of a start frame: generate the start frame with a model that takes character references, restate their recognizable details in the prompt (hair, glasses, clothing), and inspect the result for likeness the same way you inspect for trademarks. Likeness is a brand-coherence detail; a near-miss face fails the whole site. And one hard rule before any face is generated: only use a photo of the user themselves or of a person who has agreed to appear on the site. If the photo is of anyone else, stop and ask before generating.\
\
### Video template (image-to-video, 1080p, 6 seconds, no audio)\
\
\
Generate at 1080p, not 4K. The web version gets re-encoded and compressed anyway, and 4K only multiplies the cost.\
\
## Declining presets\
\
The generator sometimes pattern-matches your prompt and offers a house preset instead of generating your shot. Decline it and retry with your literal prompt. Your designed shot obeys the laws and composes for your layout; a preset does neither.\
\
## Cost preflighting (Google Flow)\
\
Before ANY generation in Google Flow, check the price shown in the Flow interface for the exact call you plan. It is free to look. Tell the user each price in plain words before it moves: the starting frame's price before the frame ("The starting image costs about X credits, making it now"), then the video model menu with real prices once the frame is approved, before any video credits move. The cheap step first, the big decision second, every number real.\
\
**The video model is a real choice, and the user makes it.** Google Flow offers several video models, and the price spread on identical parameters can be wide. Present the real numbers with the honest tradeoff before spending anything. Their money, their choice, made before anything is spent.\
\
At the time of writing, a hero image costs a small amount and a hero video a larger amount, which a free trial typically covers. For a Tier 1 single-shot hero (the default), preflight the image, then the video, and present both before proceeding.\
\
\pard\pardeftab720\sa320\partightenfactor0

\f5\b\fs44 \cf2 \strokec23 \'a0# Fichye 2: 
\f0 troubleshooting
\f5 \
\pard\pardeftab720\partightenfactor0

\f4\b0\fs32 \cf2 \strokec23 # Troubleshooting: Symptom \uc0\u8594  Cause \u8594  Fix\
\
Every entry happened in a real build. Check here before inventing a diagnosis.\
\
## Generation\
\
| Symptom | Cause | Fix |\
|---|---|---|\
| Generator suggests a preset instead of generating | It pattern-matched your prompt to a house style | Decline it and retry with your literal prompt; your designed shot beats a house style |\
| A real logo or brand mark appears in the generated image | AI slipped a trademark in | Fix with a cheap image edit before animating; never animate a trademarked frame |\
| The transformation "looks like two separate videos" | The trajectory broke at the swap | One unbroken vector through the transition (same heading, position, speed), or better, choose a single-subject concept |\
| The subject looks frozen or lifeless | The prompt over-stabilized it to protect the path | Lock the path, free the body: keep the trajectory rigid but demand natural motion on the subject and ambient life in the scene |\
| A boundary crossing (into water, through glass) looks fake | The pass was too clean | Write the physical lens moment into the prompt: splash, droplets on the lens, a beat of blur |\
| The hero product reads as a placeholder | Generic unbranded object at distance | Apply the brand mark via image editing before animating, or write the ending to land close enough that the design carries it |\
| Three failed videos on one concept | Concept problem, not prompt problem | Stop iterating the prompt and pivot the concept; the laws predict which concepts land first-try |\
| The shot is strong but the ending will not rest (the subject drifts back into motion near the end) | The model overshot the composed arrival and kept animating | Do not re-roll first. Trim the raw to the last steady frame and scrub-encode in one pass (recipe in `ffmpeg-recipes.md`); the page runs on progress, not seconds, so a shorter clip costs nothing |\
| A job comes back flagged nsfw on an innocent abstract shot | The safety filter misread abstract sensory language (glowing forms, flowing liquid around a shape) | Verify the balance first: flagged jobs are not charged. Then re-roll the same start frame with the prompt rewritten in plain commercial product-photography words: name the product early, describe objects not sensations, keep the same shot design |\
\
## The scrub hero\
\
| Symptom | Cause | Fix |\
|---|---|---|\
| Scrubbing does nothing on the live site but works locally | Host lacks partial-download (Range) support, so seeks clamp to zero | Fetch the video as a Blob and play the object URL (see `scrub-pipeline.md`); works everywhere |\
| Scroll feels choppy at the hero's top and bottom, worse in Chrome | Un-gated seeks piling up plus per-frame DOM writes | Seek gating and delta-gated writes (see `scrub-pipeline.md`) |\
| Still choppy after gating and delta-gating | The video's keyframe interval is too long | Re-encode with `-g 8 -keyint_min 8` (see `ffmpeg-recipes.md`) |\
| Scrubbing freezes permanently mid-scroll | The seek-busy flag deadlocked (a seek errored and never fired `seeked`) | Reset the flag and clear the pending target in the video's `error` handler; the deadlock-safe pattern is in `scrub-pipeline.md` |\
| Phones download the video or poster they never show | Poster set in HTML, or the video load not behind the static-hero gate | Set the poster via JavaScript inside the same gated code path that loads the video |\
| The static hero appears on desktop, or the video loads on phones | The five gate conditions differ between CSS and JS | Make the five media queries match EXACTLY in both (see `scrub-pipeline.md`) |\
| The page is broken when the video fails to load | No error path | Hide the dead video over the poster background on `error`; the page must be complete without the video |\
| Screenshots of the running site show the poster or a blank stage where the scrubbing video should be, but the site works in a real browser | The video's promoted compositor layer does not composite into embedded-browser screenshots | Verify scrub behavior through the DOM instead of pixels: probe the band `--k` variables, word opacities and transforms, and `currentTime` at several scroll positions, or watch it in a real browser window. A blank screenshot of a promoted layer is not a broken site |\
| The page looks completely dead in the preview: poster never set, every caption band at opacity 0, the video never seeks, and the pane reports it is hidden | A hidden or non-displayed preview pane stops compositing, so `requestAnimationFrame` never fires. Everything in the scrub hero is driven by that loop, so the DOM freezes too. The DOM-probing advice in the row above cannot help here, because the DOM itself is frozen | Stop using the pane and drive the machine's own installed Chrome headlessly; the full recipe is right below this table |\
| The hero goes blank (no poster, no captions) after rotating the device or resizing the window | JS decided static-versus-scrub once at load while the CSS gates stayed live | Arm and disarm the scrub from change listeners on all five gate queries; the live-gate pattern is in `scrub-pipeline.md` |\
| Double-clicking `index.html` shows the still hero and the video never loads | Browsers block `fetch` on file:// URLs, so the Blob loader falls back by design | That state is the designed fallback and must look complete. For the full scrub preview, serve the folder with any one-liner (`npx http-server`, `python -m http.server`) and open localhost; the live host serves the scrub normally |\
\
### The headless Chrome recipe (when the preview pane is dead)\
\
When the preview pane itself is hidden or broken, verify through the machine's own installed Chrome instead, driven headlessly over the DevTools protocol (the remote-control channel every Chrome ships with). It needs no installs and no packages:\
\
1. Launch Chrome with `--headless=new --disable-gpu --remote-debugging-port=9222 --user-data-dir=<a temp folder> --hide-scrollbars`.\
2. From Node (version 22 and later ships a global WebSocket, so this takes zero dependencies): GET `http://127.0.0.1:9222/json/list`, take the target's `webSocketDebuggerUrl`, and connect to it.\
3. Over that socket, drive the page with protocol commands: `Page.navigate`, `Page.captureScreenshot`, `Runtime.evaluate`, `Emulation.setDeviceMetricsOverride`, `Emulation.setTouchEmulationEnabled`, `Emulation.setEmulatedMedia`, `Network.setBlockedURLs`, and `Input.dispatchMouseEvent`.\
\
One gotcha: `Emulation.setTouchEmulationEnabled` rejects a `maxTouchPoints` of 0. Always send 5 and gate the behavior on the `enabled` flag instead.\
\
Beyond rescue duty, this route makes the genuine self-test checks possible (real touch emulation, live media flips, URL blocking, real mouse presses); those are listed with the checklist in `scrub-pipeline.md`.\
\
## The page\
\
| Symptom | Cause | Fix |\
|---|---|---|\
| An entrance animation never plays, the element just appears | A later rule won the cascade over the animation's starting state | Prefix start and end states with the container class (`.card .part`, `.card.in .part`) and prove every entrance plays |\
| Hovers on the 2nd and 3rd items of a staggered grid respond late even after the entrance finished | The cleanup rule that zeroes the stagger `transition-delay` has lower specificity than the nth-child delay rules it retires (`:nth-child` counts as a class), so it silently never applies | Make the cleanup selector match or beat the delay rules (repeat the nth-child in it) or put `!important` on the `0s` delay, then prove it by hovering the later siblings |\
| A scroll-driven style stops responding after its entrance | `animation-fill-mode: forwards` overrides it forever | Entrance animation on the parent, dynamic style on a child |\
| A background loop flashes or snaps when it starts | Positive animation delay | Negative delays (like `-1.2s`) so every loop is mid-cycle at first paint |\
| Letter tails (g, y, p) are cut off | Masked or clipped text with zero breathing room | Em-based padding with matching negative margins on the mask (see `scrub-pipeline.md`) |\
| The page can be dragged or shifted sideways | `overflow-x: hidden` alone, or a decoration poking past the edge | `overflow-x: clip` on BOTH `html` and `body`, `hidden` first as fallback |\
| Hovers start snapping after a script runs | JavaScript overwrote `el.style.transition` | Toggle a class that declares the full combined transition instead |\
| A mobile element sits off-screen with reduced motion on | Blanket `transform: none !important` wiped its positional transform | Re-apply positional transforms per breakpoint inside the reduced-motion block |\
| A marquee shows a gap at the loop point | Track shorter than the widest supported screen | Duplicate items until each track exceeds about 2560px |\
| Animations run while the tab is hidden or the section is off-screen | Free-running loops | Scope animation rules to a class an IntersectionObserver toggles; on `visibilitychange` toggle one body class with `body.paused *, body.paused *::before, body.paused *::after \{ animation-play-state: paused !important \}`; rAF loops rest when converged |\
| A pause written on a container never actually pauses the animations inside it | `animation-play-state` is not an inherited property, so a value set on a parent (or `inherit` on a nested rule) never reaches nested elements or pseudo-elements | The body-class pattern above; it hits every element and pseudo-element directly |\
\
## Deploy (GitHub Pages)\
\
| Symptom | Cause | Fix |\
|---|---|---|\
| Live site shows a directory listing or 404 | The repo does not have `index.html` at the root of the published branch | Ensure `index.html` is at the top level of the branch GitHub Pages serves (usually `main` or `gh-pages`) |\
| Images look soft on the live site but sharp locally | GitHub Pages does not recompress images, but large files may load slowly | Upload larger and cleaner (about 1920px wide, one high-quality pass) so the browser's rendering is the only lossy step |\
| Link previews show no image or the wrong URL | og tags still carry the placeholder | Patch `og:image` and `og:url` with the live absolute URL at the `<!-- DEPLOY STEP -->` comment, commit, push |\
| The live site still shows the old version after a re-deploy | Cache (browser or GitHub Pages CDN) | Hard-refresh, or verify against a string you know changed; GitHub Pages CDN can take a minute |\
| Raw videos or review files appear on the live site | They were inside the deploy folder when it was committed | Keep raws and review copies OUTSIDE the deploy folder, always |\
| Special characters turn to gibberish after a scripted find-and-replace (arrows and ordinal marks become mojibake) | A shell command read the UTF-8 file with the wrong default encoding and wrote the damage back | Never patch site files with plain shell read and write: use the editor tool for the og patch and any text change, or read and write with explicit UTF-8. Recovery if it already happened: read the damaged file as UTF-8, encode that text to Windows-1252 bytes, decode those bytes as UTF-8, save as UTF-8, verify the characters, redeploy |\
| `git push` rejected (non-fast-forward) | Remote has commits you do not have locally | `git pull --rebase` then `git push`; resolve any conflicts |\
| GitHub Pages build fails | Invalid YAML, missing `index.html`, or unsupported file | Check the Actions tab for the error; fix and push again |\
\
## Setup\
\
| Symptom | Cause | Fix |\
|---|---|---|\
| ffmpeg or Node.js fails to install on a Mac | Homebrew is not installed, so brew commands cannot run, and macOS security often blocks a downloaded binary instead | Have the user install Homebrew first: the one command from brew.sh, pasted into Terminal, which asks for their Mac password. Then run the installs again and verify |\
| Claude skips the setup checklist and jumps straight to brand or design questions | The skill zip was never extracted and fully read (common when the zip was dragged into the chat: the project folder stays empty and the skill's files never entered the conversation) | Extract the zip into the project workspace, read SKILLmd and every reference top to bottom, and restart at Phase 1. The checklist message is always the first thing the user sees |\
| Google Flow is unreachable or asks for sign-in repeatedly | Session expired or account issue | Sign in at `flow.google.com`; if it persists, clear cookies for the domain and retry |\
| The user says a setup step is done but the next step fails | "Done" was taken as verification | It never is; re-check the system yourself after every step before advancing |\
\
**The two-hang rule (the subsystem rule, for any tool):** a second consecutive hang on the same tool or subsystem means it is down. Stop retrying, name it out loud, and restart. Never make a third call into a hung subsystem. This is different from a slow render: a job that reports progress is working, however long it takes; a call that hangs with no response at all is the one this rule covers.\
\pard\pardeftab720\sa320\partightenfactor0

\f5\b\fs44 \cf2 \strokec23 Fichye 3: 
\f0 ffmpeg-recipes
\f5 \
\pard\pardeftab720\partightenfactor0

\f4\b0\fs32 \cf2 \strokec23 # ffmpeg Recipes\
\
Exact commands for every processing step. These parameters are proven defaults; the keyframe interval in particular is the difference between smooth and stuttering scrub.\
\
## Folder discipline\
\
First, the project folder itself: create a named folder for the site (the brand's name works well) at a location agreed with the user, with `index.html` and `assets/` inside, and tell the user where it lives. Raw generations and review copies live OUTSIDE that deploy folder (for example in `review/` beside the project folder, or one level up). Only processed files go into `assets/`. Nothing in the deploy folder that should not ship, ever.\
\
## The scrub encode (the one that matters most)\
\
Re-encode the approved raw video with a short keyframe interval, or scrubbing will stutter because the browser can only seek precisely to keyframes:\
\pard\pardeftab720\partightenfactor0
\cf2 ffmpeg -i raw.mp4 -c:v libx264 -crf 18 -preset slow -g 8 -keyint_min 8 -pix_fmt yuv420p -movflags +faststart -an assets/hero-scrub.mp4\
\
- `-g 8 -keyint_min 8`: a keyframe every 8 frames, so every scroll position seeks cleanly.\
- `-crf 18`: visually clean quality.\
- `-movflags +faststart`: the metadata moves to the front so playback and Blob use start immediately.\
- `-an`: strip audio; a scrub video never needs it.\
- Target roughly 4 to 8 MB for a 6-second 1080p clip. If it lands far above that, raise `-crf` toward 20 to 22 and re-check quality.\
\
### The compression fork by footage type\
\
Footage splits into two families, and they compress in opposite ways:\
\
**Busy detail masks artifacts.** Footage that fills the frame with busy detail (particles, full-frame fabric or texture) hides compression artifacts inside the detail, so crf can push hard. Busy full-frame detail tolerates crf 25 to 26 with a downscale to about 1700px wide (`-vf scale=1728:-2`); starting points, not targets. Full-frame texture is the densest footage of all and may need a narrower width or a higher crf still.\
\
**Smooth gradients are the opposite.** They band instead of masking (banding is visible stair-steps across what should be a smooth color ramp). Push crf hard on a gradient-heavy clip and the calm frames break first, so check the calm gradient frames specifically.\
\
**The method is always the same:** start from the starting points above, step ONE variable at a time (crf first, then width), and eyeball the worst frames by scrubbing, not by pausing. Artifacts that survive a freeze-frame vanish in motion on busy footage. Budget size roughly in proportion to duration: a 6-second clip wants roughly a third the size of an 18-second master. Add a downscale before ever sacrificing keyframe density, and keep every other scrub flag identical (`-preset slow -g 8 -keyint_min 8 -pix_fmt yuv420p -movflags +faststart -an`).\
\
## The tail trim (when the gate feedback is "end it earlier")\
\
The cheapest ending fix is not a re-roll. When a shot is strong until the subject drifts back into motion near the end, cut the raw at the last steady frame. The page maps scroll to progress, not to seconds, so a shorter clip costs nothing anywhere else. Extract candidate frames around the target second, pick the one that rests best (margins, face, composition), then trim and scrub-encode in one pass:\
\
ffmpeg -i raw.mp4 -t 4.3 -c:v libx264 -crf 18 -preset slow -g 8 -keyint_min 8 -pix_fmt yuv420p -movflags +faststart -an assets/hero-scrub.mp4\
\
Re-derive the poster and ending frame afterward, and re-verify the new ending with the header mocked over it, because the trimmed frame is now the page's resting composition. Only reach for a full-price re-roll when no steady frame exists at all.\
\
## The ending-rest check (objective, one command)\
\
Whether the ending truly rests does not have to be a judgment call. Measure the motion per frame: difference each frame against the previous one and read the average brightness of the difference, which is a motion curve:\
\
ffmpeg -i raw.mp4 -vf "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null -\
\
\
Each frame prints a `YAVG` line; higher means more changed since the last frame. Read the tail of the curve: an arrival rises and falls back near its starting level; a drift stays high to the end. One command replaces the eyeball, and it decides whether the tail trim above is needed at all.\
\
## Poster (first frame) and ending frame\
\
ffmpeg -i assets/hero-scrub.mp4 -frames:v 1 -q:v 2 assets/hero-poster.jpg\
ffmpeg -sseof -0.1 -i assets/hero-scrub.mp4 -update 1 -frames:v 1 -q:v 2 assets/hero-ending.jpg\
\
\
The ending frame is a free, perfectly on-brand design asset. Reuse it in a lower section.\
\
## Frame extraction for inspection (before the video gate)\
\
Pull start, middle, and end frames from the RAW video and look at them yourself: anatomy, transitions, whether the ending truly rests. For a 6-second clip:\
\
\pard\pardeftab720\sa320\partightenfactor0
\cf2 \strokec23 ffmpeg -ss 0 -i raw.mp4 -frames:v 1 -q:v 2 review/frame-start.jpg\uc0\u8232 ffmpeg -ss 3 -i raw.mp4 -frames:v 1 -q:v 2 review/frame-mid.jpg\u8232 ffmpeg -sseof -0.1 -i raw.mp4 -update 1 -frames:v 1 -q:v 2 review/frame-end.jpg\
\pard\pardeftab720\partightenfactor0

\f1\fs24 \cf2 \
## Web still sizing\
\
Resize supporting stills to about 1920px wide with ONE clean compression pass. Many hosts recompress images server-side, so upload large and clean and let the host's pass be the only lossy step (videos pass through hosts untouched):\
\
\pard\pardeftab720\partightenfactor0

\f4\fs32 \cf2 \strokec23 ffmpeg -i raw-still.png -vf scale=1920:-2 -q:v 2 assets/section-name.jpg\
\
`-q:v 2` is near-transparent JPEG quality. `-2` keeps the height even, which some encoders require. Screenshots and other sharp-edged UI imagery stay PNG or lossless WebP; the JPEG pass is for photographic stills.\
\
## Verify after every encode\
\
Play or frame-extract the output before using it. A silent encode failure caught now is free; caught after deploy it is a re-deploy.\
\pard\pardeftab720\sa320\partightenfactor0

\f5\b\fs44 \cf2 \strokec23 Fichye 4: 
\f0 scrub-pipeline\
\pard\pardeftab720\partightenfactor0

\fs24 \cf2 \strokec3 # The Scrub Pipeline and Engineering Standard
\f1\b0 \strokec4 \
\
This is the proven standard for the scroll-scrubbed hero and the quality floor around it. Use all of it, every time. Each rule either created the polish or prevented a bug that actually shipped and got caught.\
\

\f0\b \strokec3 ## The hero structure
\f1\b0 \strokec4 \
\
A tall pinned hero containing a sticky full-viewport stage. Scroll progress through the pinned region maps 0 to 1, and that progress drives the video's time. The page settles exactly when the video reaches its composed resting ending, and the real website begins there.\
\

\f0\b \strokec5 **Size the hero in scroll distance (vh), not seconds.**
\f1\b0 \strokec4  A Tier 1 single 6-second shot wants about 400vh of hero. A chained 18-second journey needs about 1000vh, so each beat gets room. Under-sizing a long journey makes every caption flash past no matter how well the bands are tuned; the pacing numbers live in the caption-band section below.\
\

\f0\b \strokec3 ## Fetch the video as a Blob (the Range rule)
\f1\b0 \strokec4 \
\
Many hosts silently lack partial-download (HTTP Range) support. Without it, every seek clamps to zero and scrubbing does nothing on the live site while working perfectly locally. Fetch the whole file as a Blob (the complete video held in memory) and play the object URL; it works everywhere.\
\
For a small clip (under about 8 MB) the plain form is fine:\
\
```js\
\strokec6 const\strokec7  \strokec3 res\strokec7  = \strokec8 await\strokec7  \strokec9 fetch\strokec7 (\strokec10 'assets/hero-scrub.mp4'\strokec7 );\strokec4 \
\strokec6 const\strokec7  \strokec3 blob\strokec7  = \strokec8 await\strokec7  \strokec5 res\strokec7 .\strokec9 blob\strokec7 ();\strokec4 \
\strokec5 video\strokec7 .\strokec5 src\strokec7  = \strokec3 URL\strokec7 .\strokec9 createObjectURL\strokec7 (\strokec5 blob\strokec7 );\strokec4 \
```\
\
Set the poster from JavaScript at the same time, inside the same code path that decides to load the video at all. That way phones and reduced-motion visitors, who get the static hero instead, never download either file.\
\

\f0\b \strokec3 ### The streamed Blob with a loading ring (any video over about 8 MB)
\f1\b0 \strokec4 \
\
A bare \strokec3 `await fetch().blob()`\strokec4  on a large chained video silently freezes the page's first impression: nothing visibly happens until the whole file lands. Over about 8 MB, stream it instead. The page is fully usable instantly, the poster shows first, an honest progress ring fills while the Blob streams, and the page is complete if the video never arrives.\
\
The video element ships with \strokec3 `preload="none"`\strokec4  and no \strokec3 `src`\strokec4 . The ring is an SVG circle of radius 20 (circumference about 126), driven by one CSS variable:\
\
```html\
\strokec11 <\strokec12 video\strokec7  \strokec13 id\strokec7 =\strokec10 "hero"\strokec7  \strokec13 preload\strokec7 =\strokec10 "none"\strokec7  \strokec13 muted\strokec7  \strokec13 playsinline\strokec7  \strokec13 aria-hidden\strokec7 =\strokec10 "true"\strokec7  \strokec13 tabindex\strokec7 =\strokec10 "-1"\strokec11 ></\strokec12 video\strokec11 >\strokec4 \
\strokec11 <\strokec12 svg\strokec7  \strokec13 class\strokec7 =\strokec10 "ring"\strokec7  \strokec13 viewBox\strokec7 =\strokec10 "0 0 48 48"\strokec7  \strokec13 aria-hidden\strokec7 =\strokec10 "true"\strokec11 >\strokec4 \
\strokec7   
\f2\i \strokec14 <circle
\f1\i0 \strokec7  \strokec13 cx\strokec7 =\strokec10 "24"\strokec7  \strokec13 cy\strokec7 =\strokec10 "24"\strokec7  \strokec13 r\strokec7 =\strokec10 "20"\strokec7  \strokec13 fill\strokec7 =\strokec10 "none"\strokec7  \strokec13 stroke\strokec7 =\strokec10 "currentColor"\strokec7  \strokec13 stroke-width\strokec7 =\strokec10 "3"\strokec4 \
\strokec7           \strokec13 stroke-dasharray\strokec7 =\strokec10 "126"\strokec7  \strokec13 style\strokec7 =\strokec10 "stroke-dashoffset:var(--ld,126)"
\f2\i \strokec14 /
\f1\i0 \strokec11 >\strokec4 \
\strokec11 </\strokec12 svg\strokec11 >\strokec4 \
```\
\
```js\
\strokec6 const\strokec7  \strokec3 VIDEO_URL\strokec7  = \strokec10 'assets/hero-scrub.mp4'\strokec7 ;\strokec4 \
\strokec6 const\strokec7  \strokec3 VIDEO_BYTES\strokec7  = \strokec15 14476000\strokec7 ;   \strokec16 // hardcode the real byte size: the fallback when Content-Length is missing\strokec4 \
\strokec6 const\strokec7  \strokec3 ring\strokec7  = \strokec5 document\strokec7 .\strokec9 querySelector\strokec7 (\strokec10 '.ring'\strokec7 );\strokec4 \
\strokec6 const\strokec7  \strokec3 posterLayer\strokec7  = \strokec5 document\strokec7 .\strokec9 querySelector\strokec7 (\strokec10 '.poster'\strokec7 );\strokec4 \
\
\strokec16 // 1. The poster wins the bandwidth race by design: paint it first,\strokec4 \
\strokec16 //    and start the blob fetch only once the poster is in (or has failed).\strokec4 \
\strokec5 posterLayer\strokec7 .\strokec5 style\strokec7 .\strokec5 backgroundImage\strokec7  = \strokec10 "url('assets/hero-poster.jpg')"\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 started\strokec7  = \strokec17 false\strokec7 ;\strokec4 \
\strokec6 function\strokec7  \strokec9 startBlobFetch\strokec7 () \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (started) \strokec8 return\strokec5 ;\strokec4 \
\strokec5   started \strokec7 =\strokec5  \strokec17 true\strokec5 ;\strokec4 \
\strokec5   \strokec9 loadHeroBlob\strokec5 ().\strokec9 catch\strokec5 (failVideo);\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 const\strokec7  \strokec3 posterImg\strokec7  = \strokec17 new\strokec7  \strokec9 Image\strokec7 ();\strokec4 \
\strokec5 posterImg\strokec7 .\strokec5 onload\strokec7  = \strokec5 startBlobFetch\strokec7 ;\strokec4 \
\strokec5 posterImg\strokec7 .\strokec5 onerror\strokec7  = \strokec5 startBlobFetch\strokec7 ;\strokec4 \
\strokec5 posterImg\strokec7 .\strokec5 src\strokec7  = \strokec10 'assets/hero-poster.jpg'\strokec7 ;\strokec4 \
\strokec18 setTimeout\strokec7 (\strokec5 startBlobFetch\strokec7 , \strokec15 4000\strokec7 );   \strokec16 // safety: a hung poster never blocks the video forever\strokec4 \
\
\strokec17 async\strokec7  \strokec6 function\strokec7  \strokec9 loadHeroBlob\strokec7 () \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 ctrl\strokec5  \strokec7 =\strokec5  \strokec17 new\strokec5  \strokec9 AbortController\strokec5 ();\strokec4 \
\strokec5   \strokec6 let\strokec5  watchdog \strokec7 =\strokec5  \strokec18 setTimeout\strokec5 (() \strokec6 =>\strokec5  ctrl.\strokec9 abort\strokec5 (), \strokec15 20000\strokec5 );\strokec4 \
\strokec5   \strokec16 // priority:'low' makes the blob yield to critical resources\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 res\strokec5  \strokec7 =\strokec5  \strokec8 await\strokec5  \strokec9 fetch\strokec5 (\strokec3 VIDEO_URL\strokec5 , \{ \strokec13 priority:\strokec5  \strokec10 'low'\strokec5 , \strokec13 signal:\strokec5  ctrl.signal \});\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 total\strokec5  \strokec7 =\strokec5  \strokec19 Number\strokec5 (res.headers.\strokec9 get\strokec5 (\strokec10 'Content-Length'\strokec5 )) \strokec7 ||\strokec5  \strokec3 VIDEO_BYTES\strokec5 ;\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 reader\strokec5  \strokec7 =\strokec5  res.body.\strokec9 getReader\strokec5 ();\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 chunks\strokec5  \strokec7 =\strokec5  [];\strokec4 \
\strokec5   \strokec6 let\strokec5  got \strokec7 =\strokec5  \strokec15 0\strokec5 , lastRing \strokec7 =\strokec5  \strokec15 0\strokec5 ;\strokec4 \
\strokec5   \strokec8 for\strokec5  (;;) \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \{ \strokec3 done\strokec5 , \strokec3 value\strokec5  \} \strokec7 =\strokec5  \strokec8 await\strokec5  reader.\strokec9 read\strokec5 ();\strokec4 \
\strokec5     \strokec8 if\strokec5  (done) \strokec8 break\strokec5 ;\strokec4 \
\strokec5     \strokec18 clearTimeout\strokec5 (watchdog);                        \strokec16 // re-arm on every chunk:\strokec4 \
\strokec5     watchdog \strokec7 =\strokec5  \strokec18 setTimeout\strokec5 (() \strokec6 =>\strokec5  ctrl.\strokec9 abort\strokec5 (), \strokec15 20000\strokec5 );   \strokec16 // 20s with no progress aborts the stream\strokec4 \
\strokec5     chunks.\strokec9 push\strokec5 (value);\strokec4 \
\strokec5     got \strokec7 +=\strokec5  value.\strokec3 length\strokec5 ;\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 frac\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (\strokec15 1\strokec5 , got \strokec7 /\strokec5  total);\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 now\strokec5  \strokec7 =\strokec5  performance.\strokec9 now\strokec5 ();\strokec4 \
\strokec5     \strokec8 if\strokec5  (now \strokec7 -\strokec5  lastRing \strokec7 >\strokec5  \strokec15 100\strokec5  \strokec7 ||\strokec5  frac \strokec7 ===\strokec5  \strokec15 1\strokec5 ) \{      \strokec16 // throttled to 100ms, but the terminal\strokec4 \
\strokec5       lastRing \strokec7 =\strokec5  now;                              \strokec16 // write always lands so the ring completes\strokec4 \
\strokec5       ring.style.\strokec9 setProperty\strokec5 (\strokec10 '--ld'\strokec5 , \strokec19 Math\strokec5 .\strokec18 round\strokec5 (\strokec15 126\strokec5  \strokec7 *\strokec5  (\strokec15 1\strokec5  \strokec7 -\strokec5  frac)));\strokec4 \
\strokec5     \}\strokec4 \
\strokec5   \}\strokec4 \
\strokec5   \strokec18 clearTimeout\strokec5 (watchdog);\strokec4 \
\strokec5   ring.style.\strokec9 setProperty\strokec5 (\strokec10 '--ld'\strokec5 , \strokec15 0\strokec5 );\strokec4 \
\strokec5   video.src \strokec7 =\strokec5  \strokec3 URL\strokec5 .\strokec9 createObjectURL\strokec5 (\strokec17 new\strokec5  \strokec9 Blob\strokec5 (chunks));\strokec4 \
\strokec5   video.\strokec9 load\strokec5 ();\strokec4 \
\strokec5   video.\strokec9 addEventListener\strokec5 (\strokec10 'canplay'\strokec5 , () \strokec6 =>\strokec5  \{\strokec4 \
\strokec5     \strokec9 requestSeek\strokec5 (\strokec9 heroProgress\strokec5 () \strokec7 *\strokec5  video.duration);  \strokec16 // land on the current scroll position\strokec4 \
\strokec5     stage.classList.\strokec9 add\strokec5 (\strokec10 'video-ready'\strokec5 );            \strokec16 // CSS fades the video in over the poster\strokec4 \
\strokec5   \}, \{ \strokec13 once:\strokec5  \strokec17 true\strokec5  \});\strokec4 \
\strokec5 \}\strokec4 \
\
\strokec6 function\strokec7  \strokec9 failVideo\strokec7 () \strokec5 \{\strokec4 \
\strokec5   ring.\strokec9 replaceWith\strokec5 (\strokec9 makeScrollChevron\strokec5 ());  \strokec16 // an honest scroll cue, never a stuck ring\strokec4 \
\strokec5   stage.classList.\strokec9 add\strokec5 (\strokec10 'video-failed'\strokec5 );    \strokec16 // still-image fallbacks carry the full journey\strokec4 \
\strokec5 \}\strokec4 \
```\
\
The watchdog matters: without it, a hung stream freezes the ring forever, which is worse than no ring. With it, a stall for 20 seconds aborts into the still-image fallback and the site simply works as a still site.\
\
The trade this pattern buys: even a chained journey weighing a dozen MB streams in quietly behind the ring over some seconds, while the page itself is usable almost instantly.\
\

\f0\b \strokec3 ## Lerp the displayed time (a rAF loop that rests)
\f1\b0 \strokec4 \
\
Never write scroll position straight into \strokec3 `currentTime`\strokec4 ; ease toward it. The loop must go idle when converged and when the hero is off-screen. Loops that free-run from page load waste battery and mark the build as amateur.\
\
```js\
\strokec6 let\strokec7  \strokec5 target\strokec7  = \strokec15 0\strokec7 ;      \strokec16 // 0..1, set by the scroll handler\strokec4 \
\strokec6 let\strokec7  \strokec5 shown\strokec7  = \strokec15 0\strokec7 ;       \strokec16 // what we are displaying\strokec4 \
\strokec6 let\strokec7  \strokec5 rafId\strokec7  = \strokec17 null\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 lastTick\strokec7  = \strokec15 0\strokec7 ;\strokec4 \
\
\strokec6 function\strokec7  \strokec9 tick\strokec7 (\strokec20 now\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 dt\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (\strokec15 100\strokec5 , now \strokec7 -\strokec5  (lastTick \strokec7 ||\strokec5  now));   \strokec16 // ms since last frame, capped\strokec4 \
\strokec5   lastTick \strokec7 =\strokec5  now;\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 k\strokec5  \strokec7 =\strokec5  \strokec15 0.16\strokec5 ;    \strokec16 // smoothing per 60fps frame; a starting point, tune by feel while scrubbing\strokec4 \
\strokec5   shown \strokec7 +=\strokec5  (target \strokec7 -\strokec5  shown) \strokec7 *\strokec5  (\strokec15 1\strokec5  \strokec7 -\strokec5  \strokec19 Math\strokec5 .\strokec18 pow\strokec5 (\strokec15 1\strokec5  \strokec7 -\strokec5  k, dt \strokec7 /\strokec5  \strokec15 16.667\strokec5 ));\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec19 Math\strokec5 .\strokec18 abs\strokec5 (target \strokec7 -\strokec5  shown) \strokec7 <\strokec5  \strokec15 0.0005\strokec5 ) \{\strokec4 \
\strokec5     shown \strokec7 =\strokec5  target;\strokec4 \
\strokec5     rafId \strokec7 =\strokec5  \strokec17 null\strokec5 ;\strokec4 \
\strokec5     lastTick \strokec7 =\strokec5  \strokec15 0\strokec5 ;                     \strokec16 // converged: rest\strokec4 \
\strokec5   \} \strokec8 else\strokec5  \{\strokec4 \
\strokec5     rafId \strokec7 =\strokec5  \strokec9 requestAnimationFrame\strokec5 (tick);\strokec4 \
\strokec5   \}\strokec4 \
\strokec5   \strokec9 requestSeek\strokec5 (shown \strokec7 *\strokec5  video.duration);\strokec4 \
\strokec5   \strokec9 updateCaptions\strokec5 (shown);\strokec4 \
\strokec5 \}\strokec4 \
\
\strokec6 function\strokec7  \strokec9 onScroll\strokec7 () \strokec5 \{\strokec4 \
\strokec5   target \strokec7 =\strokec5  \strokec9 heroProgress\strokec5 ();            \strokec16 // 0..1 through the pinned hero\strokec4 \
\strokec5   \strokec8 if\strokec5  (rafId \strokec7 ===\strokec5  \strokec17 null\strokec5  \strokec7 &&\strokec5  heroOnScreen) rafId \strokec7 =\strokec5  \strokec9 requestAnimationFrame\strokec5 (tick);\strokec4 \
\strokec5 \}\strokec4 \
```\
\
The \strokec3 `Math.pow`\strokec4  line is what makes the feel frame-rate independent: the exponent normalizes the smoothing to a 60fps reference, so every refresh rate converges at the same speed. A plain per-frame constant (\strokec3 `shown += (target - shown) * 0.18`\strokec4 ) converges twice as fast on a 120Hz screen as on a 60Hz one, and the site feels different per machine.\
\
Track \strokec3 `heroOnScreen`\strokec4  with an IntersectionObserver so the loop never runs while the hero is scrolled past.\
\

\f0\b \strokec3 ## Gate the seeks (the deadlock-safe pattern)
\f1\b0 \strokec4 \
\
Never write \strokec3 `currentTime`\strokec4  while a previous seek is still in flight. Un-gated seeks pile up and this is the difference between smooth and choppy in Chrome. Coalesce to the newest target, issue exactly one follow-up when the seek completes, and reset the busy flag on error so the gate can never deadlock:\
\
```js\
\strokec6 let\strokec7  \strokec5 seekBusy\strokec7  = \strokec17 false\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 pendingTime\strokec7  = \strokec17 null\strokec7 ;\strokec4 \
\
\strokec6 function\strokec7  \strokec9 requestSeek\strokec7 (\strokec20 t\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec7 !\strokec5 video.duration) \strokec8 return\strokec5 ;\strokec4 \
\strokec5   \strokec8 if\strokec5  (seekBusy) \{ pendingTime \strokec7 =\strokec5  t; \strokec8 return\strokec5 ; \}   \strokec16 // coalesce: keep only newest\strokec4 \
\strokec5   seekBusy \strokec7 =\strokec5  \strokec17 true\strokec5 ;\strokec4 \
\strokec5   video.currentTime \strokec7 =\strokec5  t;\strokec4 \
\strokec5 \}\strokec4 \
\
\strokec5 video\strokec7 .\strokec9 addEventListener\strokec7 (\strokec10 'seeked'\strokec7 , () \strokec6 =>\strokec7  \strokec5 \{\strokec4 \
\strokec5   seekBusy \strokec7 =\strokec5  \strokec17 false\strokec5 ;\strokec4 \
\strokec5   \strokec8 if\strokec5  (pendingTime \strokec7 !==\strokec5  \strokec17 null\strokec5 ) \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 t\strokec5  \strokec7 =\strokec5  pendingTime;\strokec4 \
\strokec5     pendingTime \strokec7 =\strokec5  \strokec17 null\strokec5 ;\strokec4 \
\strokec5     \strokec9 requestSeek\strokec5 (t);                            \strokec16 // exactly one follow-up\strokec4 \
\strokec5   \}\strokec4 \
\strokec5 \}\strokec7 );\strokec4 \
\
\strokec5 video\strokec7 .\strokec9 addEventListener\strokec7 (\strokec10 'error'\strokec7 , () \strokec6 =>\strokec7  \strokec5 \{        \strokec16 // the deadlock escape\strokec4 \
\strokec5   seekBusy \strokec7 =\strokec5  \strokec17 false\strokec5 ;\strokec4 \
\strokec5   pendingTime \strokec7 =\strokec5  \strokec17 null\strokec5 ;\strokec4 \
\strokec5 \}\strokec7 );\strokec4 \
```\
\
Under stress this pattern produces one completion per seek and zero overlaps. If scrubbing still feels rough with gating in place, the video's keyframe interval is too long: re-encode with \strokec3 `-g 8`\strokec4  (see \strokec3 `ffmpeg-recipes.md`\strokec4 ).\
\

\f0\b \strokec3 ## Write to the DOM only on change
\f1\b0 \strokec4 \
\
Per-frame DOM writes are the other half of choppy. Delta-gate everything:\
\
\strokec20 -\strokec4  Captions, scrims, and state classes: compute the desired state, compare against a cached value, and touch the DOM only when it differs. Never toggle a class every frame.\
\strokec20 -\strokec4  Any text that updates with scroll (counters, depth readouts, progress labels): throttle to about 10Hz AND only write when the string actually changed.\
\
```js\
\strokec6 let\strokec7  \strokec5 lastLabel\strokec7  = \strokec10 ''\strokec7 ;\strokec4 \
\strokec6 let\strokec7  \strokec5 lastLabelAt\strokec7  = \strokec15 0\strokec7 ;\strokec4 \
\
\strokec6 function\strokec7  \strokec9 updateLabel\strokec7 (\strokec20 text\strokec7 , \strokec20 now\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (now \strokec7 -\strokec5  lastLabelAt \strokec7 <\strokec5  \strokec15 100\strokec5 ) \strokec8 return\strokec5 ;   \strokec16 // ~10Hz\strokec4 \
\strokec5   \strokec8 if\strokec5  (text \strokec7 ===\strokec5  lastLabel) \strokec8 return\strokec5 ;        \strokec16 // only on change\strokec4 \
\strokec5   lastLabel \strokec7 =\strokec5  text;\strokec4 \
\strokec5   lastLabelAt \strokec7 =\strokec5  now;\strokec4 \
\strokec5   labelEl.textContent \strokec7 =\strokec5  text;\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Promote the video to its own compositor layer (\strokec3 `will-change: transform`\strokec4  or \strokec3 `transform: translateZ(0)`\strokec4  on the video element) so its repaints never drag the rest of the page.\
\

\f0\b \strokec3 ## The caption-band pattern (paced in scroll distance)
\f1\b0 \strokec4 \
\
Each caption owns a band of scroll progress, for example \strokec3 `[0.12, 0.30]`\strokec4 . Captions live in the footage's negative space, planned back in the concept phase, and the action lane stays clear. Nothing snaps.\
\
Pace every band in vh (viewport heights of scroll), never in seconds, because a scroll site is read in flicks. The standard:\
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Every beat gets a fully-visible plateau of roughly 80 to 130vh**
\f1\b0 \strokec4 , with eased ramps of around 20vh at each edge. Starting points, validated by the flick test below. The plateau is most of the band; the ramps are trim.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Compute the ramps in progress units.**
\f1\b0 \strokec4  For a band \strokec3 `[a, b]`\strokec4 : \strokec3 `const f = Math.min(0.02, (b - a) / 3)`\strokec4 . On a 900vh scroll range (scroll range = hero height minus the 100vh viewport), 0.02 of progress is 18vh.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Opacity**
\f1\b0 \strokec4  uses smoothstep at both edges:\
\
```js\
\strokec6 const\strokec7  \strokec9 smoothstep\strokec7  = (\strokec20 p\strokec7 , \strokec20 e0\strokec7 , \strokec20 e1\strokec7 ) \strokec6 =>\strokec7  \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 t\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (\strokec15 1\strokec5 , \strokec19 Math\strokec5 .\strokec18 max\strokec5 (\strokec15 0\strokec5 , (p \strokec7 -\strokec5  e0) \strokec7 /\strokec5  (e1 \strokec7 -\strokec5  e0)));\strokec4 \
\strokec5   \strokec8 return\strokec5  t \strokec7 *\strokec5  t \strokec7 *\strokec5  (\strokec15 3\strokec5  \strokec7 -\strokec5  \strokec15 2\strokec5  \strokec7 *\strokec5  t);\strokec4 \
\strokec5 \}\strokec7 ;\strokec4 \
\strokec6 const\strokec7  \strokec3 f\strokec7  = \strokec19 Math\strokec7 .\strokec18 min\strokec7 (\strokec15 0.02\strokec7 , (\strokec5 b\strokec7  - \strokec5 a\strokec7 ) / \strokec15 3\strokec7 );\strokec4 \
\strokec6 const\strokec7  \strokec3 opacity\strokec7  = \strokec9 smoothstep\strokec7 (\strokec5 p\strokec7 , \strokec5 a\strokec7 , \strokec5 a\strokec7  + \strokec5 f\strokec7 ) * (\strokec15 1\strokec7  - \strokec9 smoothstep\strokec7 (\strokec5 p\strokec7 , \strokec5 b\strokec7  - \strokec5 f\strokec7 , \strokec5 b\strokec7 ));\strokec4 \
```\
\
The first band skips the ease-in and the last band skips the ease-out, so the journey starts and ends with text already settled.\
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Text assembly progress**
\f1\b0 \strokec4  (the \strokec3 `--k`\strokec4  variable the choreography section below runs on) settles roughly 20vh into the band, leaving the long fully-settled plateau:\
\
```js\
\strokec6 const\strokec7  \strokec9 clamp\strokec7  = (\strokec20 v\strokec7 , \strokec20 lo\strokec7 , \strokec20 hi\strokec7 ) \strokec6 =>\strokec7  \strokec19 Math\strokec7 .\strokec18 min\strokec7 (\strokec5 hi\strokec7 , \strokec19 Math\strokec7 .\strokec18 max\strokec7 (\strokec5 lo\strokec7 , \strokec5 v\strokec7 ));\strokec4 \
\strokec6 const\strokec7  \strokec3 k\strokec7  = \strokec9 clamp\strokec7 ((\strokec5 p\strokec7  - \strokec5 a\strokec7 ) / (\strokec5 ramp\strokec7  || \strokec19 Math\strokec7 .\strokec18 min\strokec7 (\strokec15 0.025\strokec7 , (\strokec5 b\strokec7  - \strokec5 a\strokec7 ) * \strokec15 0.35\strokec7 )), \strokec15 0\strokec7 , \strokec15 1\strokec7 );\strokec4 \
```\
\
\strokec3 `ramp`\strokec4  is the band's optional \strokec3 `data-ramp`\strokec4  override, described in the choreography section. Apply all of it with delta-gated writes, like every other scroll-driven DOM touch.\
\

\f0\b \strokec5 **The flick test (how a beat map is validated):**
\f1\b0 \strokec4  simulate wheel steps of 120px (a normal flick), 240px, and 360px (an aggressive double-flick). Every beat must remain readable for 5 to 6 normal flicks, and no beat may be skippable even at 360px steps. Slow dragging proves nothing; real visitors flick. If a caption fails the test, merge it into a neighbor. Never shrink the ramps to squeeze a failing beat in.\
\
The harness is a small loop run on the page through the browser tool (or pasted into the console), one step size per run:\
\
```js\
\strokec16 // flick(120, 12), then flick(240, 8), then flick(360, 6). Start from the top each run.\strokec4 \
\strokec17 async\strokec7  \strokec6 function\strokec7  \strokec9 flick\strokec7 (\strokec20 step\strokec7 , \strokec20 count\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec8 for\strokec5  (\strokec6 let\strokec5  i \strokec7 =\strokec5  \strokec15 0\strokec5 ; i \strokec7 <\strokec5  count; i\strokec7 ++\strokec5 ) \{\strokec4 \
\strokec5     window.\strokec9 scrollBy\strokec5 (\strokec15 0\strokec5 , step);\strokec4 \
\strokec5     \strokec8 await\strokec5  \strokec17 new\strokec5  \strokec19 Promise\strokec5 (\strokec20 r\strokec5  \strokec6 =>\strokec5  \strokec18 setTimeout\strokec5 (r, \strokec15 400\strokec5 ));   \strokec16 // a beat between flicks, like a real reader\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 bands\strokec5  \strokec7 =\strokec5  [\strokec7 ...\strokec5 document.\strokec9 querySelectorAll\strokec5 (\strokec10 '.band'\strokec5 )]\strokec4 \
\strokec5       .\strokec9 map\strokec5 ((\strokec20 b\strokec5 , \strokec20 n\strokec5 ) \strokec6 =>\strokec5  n \strokec7 +\strokec5  \strokec10 ':'\strokec5  \strokec7 +\strokec5  \strokec9 getComputedStyle\strokec5 (b).opacity);\strokec4 \
\strokec5     console.\strokec9 log\strokec5 (\strokec10 'y='\strokec5  \strokec7 +\strokec5  \strokec19 Math\strokec5 .\strokec18 round\strokec5 (scrollY), bands.\strokec9 join\strokec5 (\strokec10 '  '\strokec5 ));\strokec4 \
\strokec5   \}\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Read the logged opacities between steps. A band that never reaches full opacity anywhere in the 360px run is a skippable beat. A band that holds full opacity for fewer than 5 consecutive 120px steps is too short to read.\
\

\f0\b \strokec3 ## The legibility system (text over live footage)
\f1\b0 \strokec4 \
\
Law 10 in \strokec3 `prompt-laws.md`\strokec4 : live video behind type is a moving background you do not control frame to frame. Every hero text band gets all four layers below, then passes the audit.\
\

\f0\b \strokec5 **1. The global base scrim.**
\f1\b0 \strokec4  One soft radial darkening (a scrim is a translucent dark layer) over the whole video, always on, so no frame is ever raw behind the page:\
\
```css\
\strokec21 .scrim\strokec7 \{\strokec13 position\strokec7 :\strokec22 absolute\strokec7 ;\strokec13 inset\strokec7 :\strokec15 0\strokec7 ;\strokec13 pointer-events\strokec7 :\strokec22 none\strokec7 ;\strokec13 background\strokec7 :\strokec18 radial-gradient\strokec7 (\strokec22 ellipse\strokec7  \strokec15 120%\strokec7  \strokec15 90%\strokec7  at \strokec15 50%\strokec7  \strokec15 45%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 10\strokec7 ,\strokec15 10\strokec7 ,\strokec15 18\strokec7 ,\strokec15 0\strokec7 ) \strokec15 35%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 10\strokec7 ,\strokec15 10\strokec7 ,\strokec15 18\strokec7 ,\strokec15 .62\strokec7 ) \strokec15 100%\strokec7 )\}\strokec4 \
```\
\

\f0\b \strokec5 **2. The per-band scrim.**
\f1\b0 \strokec4  Each band's \strokec3 `::before`\strokec4  carries a radial scrim that rides the band's JS-driven opacity and deepens with the band's \strokec3 `--k`\strokec4  progress variable, so the footage dims exactly while that band's text is on and nowhere else. Dim, never flatten: the gradient dies out by 76 percent so the corners stay live. The working shape:\
\
```css\
\strokec21 .band::before\strokec7 \{\strokec13 content\strokec7 :\strokec10 ""\strokec7 ;\strokec13 position\strokec7 :\strokec22 absolute\strokec7 ;\strokec13 inset\strokec7 :\strokec15 -4%\strokec7 ;\strokec13 pointer-events\strokec7 :\strokec22 none\strokec7 ;\strokec13 opacity\strokec7 :\strokec18 calc\strokec7 (\strokec15 .25\strokec7  + \strokec15 .75\strokec7 *\strokec18 var\strokec7 (\strokec20 --k\strokec7 ,\strokec15 1\strokec7 ));\strokec13 background\strokec7 :\strokec18 radial-gradient\strokec7 (\strokec22 ellipse\strokec7  \strokec15 74%\strokec7  \strokec15 62%\strokec7  at \strokec15 50%\strokec7  \strokec15 50%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .66\strokec7 ) \strokec15 0%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .44\strokec7 ) \strokec15 46%\strokec7 ,\strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 0\strokec7 ) \strokec15 76%\strokec7 )\}\strokec4 \
```\
\
Tune the peak alpha per band against that band's actual frames. The proven range: 0.62 for quiet beats up to 0.72 for the hook. These peak alphas are also the constants to nudge when the user asks for the footage to read brighter.\
\

\f0\b \strokec5 **The two-sided variant for centered-action compositions.**
\f1\b0 \strokec4  The single centered radial above assumes the subject sits off-center with the text flanking it. When the subject is centered and text columns sit on BOTH sides of it (a natural request), never stretch one scrim across the middle. Use two: one pseudo-element anchored on the left column and one on the right, each an ellipse centered on its own column, with the center lane left completely alone so the subject stays bright. The settle band, where the columns converge, gets a single upper-centered ellipse instead. This variant is not a compromise: a real build measured 7.17 to 1 worst-pixel contrast with it.\
\

\f0\b \strokec5 **3. The text-shadow token.**
\f1\b0 \strokec4  Three layers (a tight edge, a mid glow, a wide falloff), applied to every hero band and turned off on buttons, where a shadowed label reads as grime:\
\
```css\
\strokec13 :root\strokec7 \{\strokec20 --tshadow\strokec7 :\strokec15 0\strokec7  \strokec15 1px\strokec7  \strokec15 2px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .95\strokec7 ),\strokec15 0\strokec7  \strokec15 3px\strokec7  \strokec15 12px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .78\strokec7 ),\strokec15 0\strokec7  \strokec15 10px\strokec7  \strokec15 44px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .8\strokec7 )\}\strokec4 \
\strokec21 .band\strokec7 \{\strokec13 text-shadow\strokec7 :\strokec18 var\strokec7 (\strokec20 --tshadow\strokec7 )\}\strokec4 \
\strokec21 .band\strokec7  \strokec21 .btn\strokec7 \{\strokec13 text-shadow\strokec7 :\strokec22 none\strokec7 \}\strokec4 \
```\
\

\f0\b \strokec5 **4. The chip scrim for small text.**
\f1\b0 \strokec4  HUD lines, readouts, and small labels over footage do not get the big radial. They get a chip, a small blurred backing pill:\
\
```css\
\strokec21 .chip\strokec7 \{\strokec13 background\strokec7 :\strokec18 rgba\strokec7 (\strokec15 8\strokec7 ,\strokec15 8\strokec7 ,\strokec15 15\strokec7 ,\strokec15 .55\strokec7 );\strokec13 border\strokec7 :\strokec15 1px\strokec7  \strokec22 solid\strokec7  \strokec18 rgba\strokec7 (\strokec15 96\strokec7 ,\strokec15 96\strokec7 ,\strokec15 126\strokec7 ,\strokec15 .3\strokec7 );\strokec13 border-radius\strokec7 :\strokec15 10px\strokec7 ;\strokec13 backdrop-filter\strokec7 :\strokec18 blur\strokec7 (\strokec15 10px\strokec7 );\strokec13 text-shadow\strokec7 :\strokec15 0\strokec7  \strokec15 1px\strokec7  \strokec15 3px\strokec7  \strokec18 rgba\strokec7 (\strokec15 5\strokec7 ,\strokec15 5\strokec7 ,\strokec15 10\strokec7 ,\strokec15 .85\strokec7 )\}\strokec4 \
```\
\

\f0\b \strokec5 **The worst-frame audit (what makes the system honest).**
\f1\b0 \strokec4  Extract each band's frames, canvas-sample the pixels under the text zone WITH the scrim applied, and require worst-pixel contrast of at least 3.5:1 for every band. Well-tuned bands land well clear of that floor. Tune scrim alphas against the worst frame, never the average. The average frame lies; the worst frame is the one a visitor will be mid-read on.\
\

\f0\b \strokec5 **The preferred method, when a controllable browser exists**
\f1\b0 \strokec4  (the headless Chrome route in \strokec3 `troubleshooting.md`\strokec4 ): inject \strokec3 `visibility: hidden`\strokec4  on the split text spans, screenshot the real composited page at that scroll position, and find the lightest pixel inside the text's bounding box. This measures every scrim layer and the radial falloff exactly as the visitor sees them, and it is conservative, because hiding the glyphs also removes their text shadow. The frame-plus-math procedure below is the fallback when no browser can be driven.\
\
The procedure, concretely:\
\
\strokec20 1.\strokec4  Convert each band's range to video time (\strokec3 `time = progress * duration`\strokec4 ) and extract three or four frames across it with ffmpeg: \strokec3 `ffmpeg -ss <t> -i assets/hero-scrub.mp4 -frames:v 1 review/band2-a.png`\strokec4 .\
\strokec20 2.\strokec4  For each frame, composite the band's scrim at its peak alpha over the text zone and find the worst pixel. For light text that is the lightest surviving pixel. This snippet does the whole step:\
\
```js\
\strokec16 // auditFrame('audit/band2-a.png', \{x:420,y:300,w:600,h:200\}, 0.66, [244,242,236])\strokec4 \
\strokec16 // zone is the text's pixel box in the frame, alpha is the band scrim's peak, textColor is RGB\strokec4 \
\strokec17 async\strokec7  \strokec6 function\strokec7  \strokec9 auditFrame\strokec7 (\strokec20 src\strokec7 , \strokec20 zone\strokec7 , \strokec20 scrimAlpha\strokec7 , \strokec20 textColor\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 img\strokec5  \strokec7 =\strokec5  \strokec8 await\strokec5  \strokec9 createImageBitmap\strokec5 (\strokec8 await\strokec5  (\strokec8 await\strokec5  \strokec9 fetch\strokec5 (src)).\strokec9 blob\strokec5 ());\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 c\strokec5  \strokec7 =\strokec5  \strokec17 new\strokec5  \strokec9 OffscreenCanvas\strokec5 (img.width, img.height).\strokec9 getContext\strokec5 (\strokec10 '2d'\strokec5 );\strokec4 \
\strokec5   c.\strokec9 drawImage\strokec5 (img, \strokec15 0\strokec5 , \strokec15 0\strokec5 );\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 d\strokec5  \strokec7 =\strokec5  c.\strokec9 getImageData\strokec5 (zone.x, zone.y, zone.w, zone.h).data;\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec9 lum\strokec5  \strokec7 =\strokec5  ([\strokec20 r\strokec5 , \strokec20 g\strokec5 , \strokec20 b\strokec5 ]) \strokec6 =>\strokec5  \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec9 f\strokec5  \strokec7 =\strokec5  \strokec20 v\strokec5  \strokec6 =>\strokec5  \{ v \strokec7 /=\strokec5  \strokec15 255\strokec5 ; \strokec8 return\strokec5  v \strokec7 <=\strokec5  \strokec15 0.03928\strokec5  \strokec7 ?\strokec5  v \strokec7 /\strokec5  \strokec15 12.92\strokec5  \strokec7 :\strokec5  ((v \strokec7 +\strokec5  \strokec15 0.055\strokec5 ) \strokec7 /\strokec5  \strokec15 1.055\strokec5 ) \strokec7 **\strokec5  \strokec15 2.4\strokec5 ; \};\strokec4 \
\strokec5     \strokec8 return\strokec5  \strokec15 0.2126\strokec5  \strokec7 *\strokec5  \strokec9 f\strokec5 (r) \strokec7 +\strokec5  \strokec15 0.7152\strokec5  \strokec7 *\strokec5  \strokec9 f\strokec5 (g) \strokec7 +\strokec5  \strokec15 0.0722\strokec5  \strokec7 *\strokec5  \strokec9 f\strokec5 (b);\strokec4 \
\strokec5   \};\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 scrim\strokec5  \strokec7 =\strokec5  [\strokec15 5\strokec5 , \strokec15 5\strokec5 , \strokec15 10\strokec5 ];                      \strokec16 // the scrim's base color\strokec4 \
\strokec5   \strokec6 let\strokec5  worst \strokec7 =\strokec5  \strokec15 0\strokec5 ;\strokec4 \
\strokec5   \strokec8 for\strokec5  (\strokec6 let\strokec5  i \strokec7 =\strokec5  \strokec15 0\strokec5 ; i \strokec7 <\strokec5  d.\strokec3 length\strokec5 ; i \strokec7 +=\strokec5  \strokec15 4\strokec5 ) \{\strokec4 \
\strokec5     \strokec6 const\strokec5  \strokec3 px\strokec5  \strokec7 =\strokec5  [\strokec15 0\strokec5 , \strokec15 1\strokec5 , \strokec15 2\strokec5 ].\strokec9 map\strokec5 (\strokec20 j\strokec5  \strokec6 =>\strokec5  d[i \strokec7 +\strokec5  j] \strokec7 *\strokec5  (\strokec15 1\strokec5  \strokec7 -\strokec5  scrimAlpha) \strokec7 +\strokec5  scrim[j] \strokec7 *\strokec5  scrimAlpha);\strokec4 \
\strokec5     worst \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 max\strokec5 (worst, \strokec9 lum\strokec5 (px));            \strokec16 // lightest pixel, the worst case for light text\strokec4 \
\strokec5   \}\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 lt\strokec5  \strokec7 =\strokec5  \strokec9 lum\strokec5 (textColor);\strokec4 \
\strokec5   \strokec6 const\strokec5  \strokec3 hi\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 max\strokec5 (lt, worst), \strokec3 lo\strokec5  \strokec7 =\strokec5  \strokec19 Math\strokec5 .\strokec18 min\strokec5 (lt, worst);\strokec4 \
\strokec5   \strokec8 return\strokec5  (hi \strokec7 +\strokec5  \strokec15 0.05\strokec5 ) \strokec7 /\strokec5  (lo \strokec7 +\strokec5  \strokec15 0.05\strokec5 );              \strokec16 // must be at least 3.5\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Run it through the browser tool on the previewed page. If fetching from \strokec3 `review/`\strokec4  is blocked, copy the frames into \strokec3 `assets/audit/`\strokec4  for the audit and delete that folder before anything is zipped.\
\
\strokec20 3.\strokec4  Every band's returned ratio must be at least 3.5:1. A failing band gets a deeper peak alpha on its scrim, then a re-audit against the same worst frame.\
\

\f0\b \strokec3 ## Text choreography (an entrance personality per beat)
\f1\b0 \strokec4 \
\

\f0\b \strokec5 **The echo principle:**
\f1\b0 \strokec4  every hero beat gets its own entrance, and the entrance echoes what the footage is doing at that moment. Words drift down while something falls. A word punches in as an impact lands. Characters scatter-assemble while ink gathers. Entrance and footage read as one event, which is what makes the page feel directed instead of decorated.\
\
The engineering is the fixed part, for every entrance including ones you invent: all effects are \strokec3 `transform`\strokec4  and \strokec3 `opacity`\strokec4  only, scroll-scrubbed off the band's \strokec3 `--k`\strokec4  custom property (0 to 1 assembly progress, written by the drive loop and delta-gated at 0.008 so converged bands cost nothing), and fully reversible (scroll up and they disassemble; band one's one-time load ramp is the single designed exception).\
\

\f0\b \strokec5 **The first band opens settled, characters included.**
\f1\b0 \strokec4  The band pattern above already skips band one's opacity ease-in, but that alone is not enough: at scroll zero the band's \strokec3 `--k`\strokec4  is still 0, so its characters sit unassembled and the hero opens on footage with no words until the user scrolls. Give band one a one-time, time-based assembly ramp on load that hands over to scroll: drive its entrance with \strokec3 `k = max(scrollK, loadK)`\strokec4 , where \strokec3 `loadK`\strokec4  eases from 0 to 1 over the first moments after the page appears. Once \strokec3 `loadK`\strokec4  reaches 1 the max holds band one assembled, which is right for the opening beat: there is nothing above it to scroll back to. Every later band stays purely scroll-driven and reversible.\
\

\f0\b \strokec5 **Splitting, done once at load.**
\f1\b0 \strokec4  Split headline text into word and character spans in JS with a seeded pseudo-random generator, so the "random" offsets are identical on every load:\
\
```js\
\strokec6 function\strokec7  \strokec9 rng\strokec7 (\strokec20 seed\strokec7 ) \strokec5 \{\strokec4 \
\strokec5   \strokec6 let\strokec5  s \strokec7 =\strokec5  seed \strokec7 >>>\strokec5  \strokec15 0\strokec5 ;\strokec4 \
\strokec5   \strokec8 return\strokec5  () \strokec6 =>\strokec5  (s \strokec7 =\strokec5  (s \strokec7 *\strokec5  \strokec15 1664525\strokec5  \strokec7 +\strokec5  \strokec15 1013904223\strokec5 ) \strokec7 >>>\strokec5  \strokec15 0\strokec5 ) \strokec7 /\strokec5  \strokec15 4294967296\strokec5 ;\strokec4 \
\strokec5 \}\strokec4 \
```\
\
Wrap a visually-hidden span holding the full sentence for screen readers, plus an \strokec3 `aria-hidden="true"`\strokec4  visual copy built of \strokec3 `.w`\strokec4  word spans containing \strokec3 `.c`\strokec4  character spans. Assign each span its custom properties (\strokec3 `--th`\strokec4 , \strokec3 `--jx`\strokec4 , \strokec3 `--jy`\strokec4 , \strokec3 `--jr`\strokec4 ) from the seeded generator at split time.\
\

\f0\b \strokec5 **The menu (worked examples, each named with the footage moment it echoes):**
\f1\b0 \strokec4 \
\

\f0\b \strokec5 **(a) Scatter.**
\f1\b0 \strokec4  Per-character fly-in from seeded random offsets; echoes ink gathering, particles assembling, debris settling. Each \strokec3 `.c`\strokec4  gets \strokec3 `--th`\strokec4  (a random threshold, 0 to 0.55) and \strokec3 `--jx`\strokec4 /\strokec3 `--jy`\strokec4 /\strokec3 `--jr`\strokec4  jitter values:\
\
```css\
\strokec21 .c\strokec7 \{\strokec20 --kc\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ))*2.6,1);\strokec13 opacity\strokec7 :\strokec18 var\strokec7 (\strokec20 --kc\strokec7 );\strokec4 \
\strokec7    \strokec13 transform\strokec7 :\strokec18 translate\strokec7 (\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --jx\strokec7 ,\strokec15 0px\strokec7 )),\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --jy\strokec7 ,\strokec15 0px\strokec7 )))\strokec4 \
\strokec7              \strokec18 rotate\strokec7 (\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --jr\strokec7 ,\strokec15 0deg\strokec7 )))\}\strokec4 \
```\
\

\f0\b \strokec5 **(b) Grid snap-align.**
\f1\b0 \strokec4  Characters slide horizontally into place in reading order. Same CSS as scatter with horizontal-only jitter, but the threshold is ordered instead of random: \strokec3 `--th: charIndex / total * spread + rng() * 0.06`\strokec4 , so the spread value controls how long the stagger runs.\
\

\f0\b \strokec5 **(c) Blur-to-sharp.**
\f1\b0 \strokec4  The entrance for the quiet beat; echoes mist clearing or focus arriving. Two stacked copies of the text crossfaded by opacity only. The soft copy carries a STATIC \strokec3 `filter: blur(10px)`\strokec4 ; never animate \strokec3 `filter`\strokec4  itself, it is not compositor-friendly. The sharp copy fades in with \strokec3 `--k`\strokec4 , the soft copy fades out.\
\

\f0\b \strokec5 **(d) Word-punch with overshoot.**
\f1\b0 \strokec4  Echoes an impact landing. Word-level pop (\strokec3 `--kc`\strokec4 ) and a slower settle (\strokec3 `--ks`\strokec4 ); the word scales past 1 and eases back:\
\
```css\
\strokec21 .w\strokec7 \{\strokec20 --kc\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ))*3,1);\strokec4 \
\strokec7    \strokec20 --ks\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --sd\strokec7 ,\strokec15 .1\strokec7 ))*\strokec3 var\strokec7 (\strokec20 --ss\strokec7 ,3.2),1);\strokec4 \
\strokec7    \strokec13 opacity\strokec7 :\strokec18 var\strokec7 (\strokec20 --kc\strokec7 );\strokec4 \
\strokec7    \strokec13 transform\strokec7 :\strokec18 scale\strokec7 (\strokec18 calc\strokec7 (\strokec15 0.6\strokec7  + (\strokec15 0.4\strokec7  + \strokec18 var\strokec7 (\strokec20 --ov\strokec7 ,\strokec15 .12\strokec7 ))*\strokec18 var\strokec7 (\strokec20 --kc\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --ov\strokec7 ,\strokec15 .12\strokec7 )*\strokec18 var\strokec7 (\strokec20 --ks\strokec7 )))\}\strokec4 \
\strokec21 .w.em\strokec7 \{\strokec20 --ov\strokec7 :\strokec15 0.24\strokec7 ;\strokec20 --sd\strokec7 :\strokec15 0.16\strokec7 ;\strokec20 --ss\strokec7 :\strokec15 2.6\strokec7 \}\strokec4 \
```\
\
Emphasized words (\strokec3 `.em`\strokec4 ) get the bigger overshoot with the later, slower settle, so they hang in the overshoot a beat longer.\
\

\f0\b \strokec5 **(e) Word-by-word rise into a staged settle.**
\f1\b0 \strokec4  The proven ending entrance, matching the footage's arrival at rest. Headline words rise in reading order (\strokec3 `--th`\strokec4  per word), then the subline fades via \strokec3 `--ks: clamp(0, (var(--k) - 0.66) * 4, 1)`\strokec4 , then the CTA row via \strokec3 `--kb: clamp(0, (var(--k) - 0.78) * 5, 1)`\strokec4 . Three arrivals, one band.\
\

\f0\b \strokec5 **(f) Drift-down.**
\f1\b0 \strokec4  Echoes a fall or a pour. Each word starts above its resting spot and drifts down into place:\
\
```css\
\strokec21 .w\strokec7 \{\strokec20 --kc\strokec7 :\strokec18 clamp\strokec7 (\strokec15 0\strokec7 ,\strokec20 (var(--k\strokec7 ,\strokec15 0\strokec7 ) - \strokec18 var\strokec7 (\strokec20 --th\strokec7 ,\strokec15 0\strokec7 ))*2.8,1);\strokec13 opacity\strokec7 :\strokec18 var\strokec7 (\strokec20 --kc\strokec7 );\strokec4 \
\strokec7    \strokec13 transform\strokec7 :\strokec18 translateY\strokec7 (\strokec18 calc\strokec7 ((\strokec15 1\strokec7  - \strokec18 var\strokec7 (\strokec20 --kc\strokec7 ))*\strokec15 -24px\strokec7 ))\}\strokec4 \
```\
\

\f0\b \strokec5 **(g) Approach-from-depth.**
\f1\b0 \strokec4  Echoes a tunnel or a forward push. The line starts slightly small and grows into place as if approaching the camera: \strokec3 `transform: scale(calc(0.82 + 0.18 * var(--kc)))`\strokec4  with opacity riding \strokec3 `--kc`\strokec4 . Stack a static-blur soft copy under it (the blur-to-sharp pattern) when the approach should also sharpen.\
\

\f0\b \strokec5 **(h) Halves parting.**
\f1\b0 \strokec4  Echoes folds opening or curtains parting. Split the headline into two halves; each starts pulled toward the center line and slides outward to rest as \strokec3 `--kc`\strokec4  rises, opposite signs of \strokec3 `--jx`\strokec4  per half.\
\

\f0\b \strokec5 **(i) Weave.**
\f1\b0 \strokec4  Echoes threads crossing or strands interleaving. Characters arrive alternating from above and below: the scatter CSS with vertical-only jitter and \strokec3 `--jy`\strokec4  signs alternating by character index.\
\

\f0\b \strokec5 **This menu is examples, not a closed set.**
\f1\b0 \strokec4  Inventing a new entrance to fit this footage is the job. Take the moment the band sits on, ask what the footage is physically doing, and build the entrance that does the same thing to the words. Every invention keeps the fixed part: transform and opacity only, scrubbed off the band's \strokec3 `--k`\strokec4 , fully reversible on scroll-up (band one's one-time load ramp is the single designed exception).\
\

\f0\b \strokec5 **The control pattern (tune a beat without touching band math):**
\f1\b0 \strokec4  each band takes two optional HTML attributes. \strokec3 `data-ramp`\strokec4  overrides the default assembly window (the default is \strokec3 `Math.min(0.025, bandLength * 0.35)`\strokec4  of progress; \strokec3 `data-ramp="0.036"`\strokec4  savors an assembly about 50 percent longer). \strokec3 `data-spread`\strokec4  sets the character-stagger spread for scatter and grid entrances. Any beat's feel is tuned from its markup, and the drive loop never changes.\
\

\f0\b \strokec3 ## The static-hero gate (five conditions, in CSS AND JS)
\f1\b0 \strokec4 \
\
Some visitors get a composed static image hero instead of the scrub. The five gates, and they must match EXACTLY in the CSS media queries and the JavaScript decision, or one side loads assets the other side hides:\
\
\strokec20 1.\strokec4  Phones: \strokec3 `(max-width: 720px)`\strokec4 \
\strokec20 2.\strokec4  Portrait tablets: \strokec3 `(orientation: portrait) and (max-width: 1024px)`\strokec4 \
\strokec20 3.\strokec4  Coarse-pointer portrait: \strokec3 `(orientation: portrait) and (pointer: coarse)`\strokec4 \
\strokec20 4.\strokec4  Landscape phones: \strokec3 `(orientation: landscape) and (pointer: coarse) and (max-height: 560px)`\strokec4  (a phone held sideways passes every width check but has no room for the journey)\
\strokec20 5.\strokec4  Reduced motion: \strokec3 `(prefers-reduced-motion: reduce)`\strokec4 \
\

\f0\b \strokec5 **The gate is decided live, not once at load.**
\f1\b0 \strokec4  The CSS media queries re-evaluate on every rotation, resize, and preference flip. A one-shot JS check leaves a blank multi-viewport hero the moment a tablet rotates from portrait to landscape, a snapped window gets maximized past 720px, or reduced motion is switched off mid-session: the CSS un-hides the scrub stage, but no poster, no video, and no scroll listener exist on the JS side. Wire the change event of all five queries to one function that arms and disarms the scrub:\
\
```js\
\strokec6 const\strokec7  \strokec3 GATES\strokec7  = [\strokec4 \
\strokec7   \strokec10 '(max-width: 720px)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(orientation: portrait) and (max-width: 1024px)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(orientation: portrait) and (pointer: coarse)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)'\strokec7 ,\strokec4 \
\strokec7   \strokec10 '(prefers-reduced-motion: reduce)'\strokec4 \
\strokec7 ];\strokec4 \
\strokec6 let\strokec7  \strokec5 scrubOn\strokec7  = \strokec17 false\strokec7 ;\strokec4 \
\strokec6 function\strokec7  \strokec9 enableScrub\strokec7 ()\strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (scrubOn) \strokec8 return\strokec5 ; scrubOn \strokec7 =\strokec5  \strokec17 true\strokec5 ;\strokec4 \
\strokec5   \strokec9 initHeroOnce\strokec5 ();                       \strokec16 // wrap the poster paint and the startBlobFetch flow from the Blob loader section above in one run-once function; this call is that wrapper\strokec4 \
\strokec5   \strokec9 addEventListener\strokec5 (\strokec10 'scroll'\strokec5 , onScroll, \{\strokec13 passive:\strokec17 true\strokec5 \});\strokec4 \
\strokec5   bands.\strokec9 forEach\strokec5 (\strokec20 b\strokec5  \strokec6 =>\strokec5  \{ b.op \strokec7 =\strokec5  \strokec7 -\strokec15 1\strokec5 ; b.k \strokec7 =\strokec5  \strokec7 -\strokec15 1\strokec5  \});   \strokec16 // reset caches so stale pinned styles get rewritten\strokec4 \
\strokec5   \strokec9 unpinFinalStates\strokec5 ();                   \strokec16 // undo whatever pinToFinalStates applied, so lines, counters, and holds go back to being scroll-driven\strokec4 \
\strokec5   \strokec9 updateCaptions\strokec5 (\strokec9 heroProgress\strokec5 ());\strokec4 \
\strokec5   \strokec9 onScroll\strokec5 ();                           \strokec16 // re-seek the video to the current scroll position; without this the frame sits stale until the user scrolls\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 function\strokec7  \strokec9 disableScrub\strokec7 ()\strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec7 !\strokec5 scrubOn) \strokec8 return\strokec5 ; scrubOn \strokec7 =\strokec5  \strokec17 false\strokec5 ;\strokec4 \
\strokec5   \strokec9 removeEventListener\strokec5 (\strokec10 'scroll'\strokec5 , onScroll);\strokec4 \
\strokec5   \strokec8 if\strokec5  (rafId \strokec7 !==\strokec5  \strokec17 null\strokec5 ) \{ \strokec9 cancelAnimationFrame\strokec5 (rafId); rafId \strokec7 =\strokec5  \strokec17 null\strokec5  \}\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 function\strokec7  \strokec9 applyHeroMode\strokec7 ()\strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (\strokec3 GATES\strokec5 .\strokec9 some\strokec5 (\strokec20 q\strokec5  \strokec6 =>\strokec5  \strokec9 matchMedia\strokec5 (q).matches)) \strokec9 disableScrub\strokec5 ();\strokec4 \
\strokec5   \strokec8 else\strokec5  \strokec9 enableScrub\strokec5 ();\strokec4 \
\strokec5 \}\strokec4 \
\strokec6 const\strokec7  \strokec3 MQLS\strokec7  = \strokec3 GATES\strokec7 .\strokec9 map\strokec7 (\strokec20 q\strokec7  \strokec6 =>\strokec7  \strokec9 matchMedia\strokec7 (\strokec5 q\strokec7 ));   \strokec16 // keep the query lists referenced; unreferenced ones have historically lost their listeners in old browsers\strokec4 \
\strokec3 MQLS\strokec7 .\strokec9 forEach\strokec7 (\strokec20 m\strokec7  \strokec6 =>\strokec7  \strokec5 m\strokec7 .\strokec9 addEventListener\strokec7 (\strokec10 'change'\strokec7 , \strokec5 applyHeroMode\strokec7 ));\strokec4 \
\strokec9 applyHeroMode\strokec7 ();\strokec4 \
```\
\
All five strings must be character-for-character identical in both places, and the poster and Blob fetch still live ONLY inside the gated path.\
\
A related guard for scrub-capable screens that are merely short (a shallow desktop window, not a phone): keep the scrub but hide whatever small scroll-driven overlays the page has (cues, readouts, tickers), which have no room. An example with one build's class names; use your own:\
\
```css\
\strokec8 @media\strokec7  (\strokec13 max-height\strokec7 :\strokec15 560px\strokec7 )\{\strokec21 .cue\strokec7 ,\strokec21 .hud\strokec7 ,\strokec21 .feed\strokec7 \{\strokec13 display\strokec7 :\strokec22 none\strokec7 \}\}\strokec4 \
```\
\
The static hero is a designed layout, not a fallback apology: the poster or ending frame composed with the captions visible. A mobile decision is made consciously per project. Static hero is the default. Consider a cover-cropped mobile scrub only when all three hold: the encoded video is small (under about 8 MB), the composition still reads when cover-cropped to portrait (the action lane survives the crop), and the result is verified on a real phone. When any of the three fails, ship the static hero proudly.\
\

\f0\b \strokec3 ## Complete without the video
\f1\b0 \strokec4 \
\
The page must be complete and beautiful if the video never loads. Wire the video's \strokec3 `error`\strokec4  event to hide the dead video element over the poster background. Every caption, every section, and the call to action must work with a still image behind them. Test this state on purpose by renaming the video file and loading the page.\
\

\f0\b \strokec3 ## The motion system around the hero
\f1\b0 \strokec4 \
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Nothing snaps.**
\f1\b0 \strokec4  Every appearance, hover, and state change eases. Define two easing curves as tokens and use them everywhere. Even the page itself eases in.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Entrances are choreography.**
\f1\b0 \strokec4  IntersectionObserver adds an \strokec3 `.in`\strokec4  class; children arrive in sequence with 60 to 150ms stagger steps. Entrance start and end states must be prefixed with the container class (\strokec3 `.card .part`\strokec4 , \strokec3 `.card.in .part`\strokec4 ) so they win the cascade; a later rule can otherwise silently cancel the animation. And when the entrance is done, RETIRE the stagger delays: the cleanup rule that zeroes \strokec3 `transition-delay`\strokec4  must match or beat the specificity of the nth-child delay rules it retires (\strokec3 `:nth-child`\strokec4  counts as a class), or it silently never applies and every hover on the later siblings lags by the stagger forever. Prove the retirement by hovering the second and third items after the entrance finishes.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Never put a dynamic style on an element that also has a \strokec3 `forwards`\strokec5  entrance animation.**
\f1\b0 \strokec4  The animation's final value wins permanently. Entrance on the parent, dynamic style on a child.\
\strokec20 -\strokec4  
\f0\b \strokec5 **One living element per section**
\f1\b0 \strokec4  at whisper level after its entrance: a slow cycle or soft glow pulse, four seconds or longer. Give looping animations negative delays (like \strokec3 `-1.2s`\strokec4 ) so they are mid-cycle at first paint. Pause them off-screen by scoping the animation rules to a class an IntersectionObserver toggles, and pause everything on hidden tabs with one body class. \strokec3 `animation-play-state`\strokec4  is not an inherited property, so setting it on a container silently never reaches nested elements or pseudo-elements. The pattern that cannot miss: \strokec3 `body.paused *, body.paused *::before, body.paused *::after \{ animation-play-state: paused !important \}`\strokec4 , toggled on \strokec3 `visibilitychange`\strokec4 .\
\strokec20 -\strokec4  
\f0\b \strokec5 **One designed interactive moment per site.**
\f1\b0 \strokec4  Designed, not decorative; the proven shape has its own section below.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Animate only \strokec3 `transform`\strokec5  and \strokec3 `opacity`\strokec5 .**
\f1\b0 \strokec4  For glow pulses, put the shadow on a pseudo-element at full strength and animate its opacity.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Masked text needs descender room:**
\f1\b0 \strokec4  any \strokec3 `overflow: hidden`\strokec4  reveal gets em-based padding/negative-margin breathing room or g, y, and p get their tails cut.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Never overwrite \strokec3 `el.style.transition`\strokec5  in JavaScript.**
\f1\b0 \strokec4  Toggle a class that declares the full combined transition.\
\

\f0\b \strokec3 ## The one interactive moment (the proven shape)
\f1\b0 \strokec4 \
\
One per site, on-theme, performed mid-journey. The shape that has worked repeatedly: an action that mirrors the product's own story. A press-and-hold that lets a scent settle. A press-and-hold that pulls a thread and stitches a seam closed. The visitor does not just read the brand's one idea; they perform it.\
\
The mechanics that make it feel designed rather than gimmicky:\
\
\strokec20 -\strokec4  Progress builds while the visitor holds.\
\strokec20 -\strokec4  Releasing early eases the progress back down; it never snaps to zero.\
\strokec20 -\strokec4  Completing it lights up the section's content in sequence, so the visitor's action earns something real.\
\strokec20 -\strokec4  Reduced motion gets the instant final state, no hold required.\
\
The hold is an example, not a law. Any interaction works if it enacts the brand's one idea.\
\

\f0\b \strokec3 ## Overflow and reduced motion
\f1\b0 \strokec4 \
\
\strokec20 -\strokec4  \strokec3 `overflow-x: clip`\strokec4  on BOTH \strokec3 `html`\strokec4  and \strokec3 `body`\strokec4 , with \strokec3 `hidden`\strokec4  declared first as a fallback. \strokec3 `hidden`\strokec4  alone still lets code scroll the page sideways, and one anchor link can leave the whole page shifted.\
\strokec20 -\strokec4  Reduced motion is honored COMPLETELY: kill animations and transitions on elements and on \strokec3 `::before`\strokec4 /\strokec3 `::after`\strokec4 , zero every \strokec3 `transition-delay`\strokec4 , show every choreographed element in its final finished state, and re-apply positional transforms per breakpoint (a blanket \strokec3 `transform: none !important`\strokec4  can throw a mobile-positioned element off screen). The video is not loaded at all (it is one of the five static-hero gates).\
\strokec20 -\strokec4  Reduced motion is honored LIVE, in BOTH directions. Listen for the media query's change event. On a flip in, pin every scroll-drawn element to its final drawn state and stop the JS drives: self-drawing lines finish, counters jump to their targets, hold interactions complete. On a flip back out, re-arm the scrub through the same gate function the five queries use, so the caches reset and the captions recompute instead of staying pinned. And undo everything pinToFinalStates applied: remove the pinned classes or inline styles from the drawn lines, the counters, and the hold interactions, so the scroll drives own them again. Re-arming the hero while leaving the rest of the page pinned is the half-fix that looks done and is not.\
\
```js\
\strokec9 matchMedia\strokec7 (\strokec10 '(prefers-reduced-motion: reduce)'\strokec7 ).\strokec9 addEventListener\strokec7 (\strokec10 'change'\strokec7 , \strokec20 e\strokec7  \strokec6 =>\strokec7  \strokec5 \{\strokec4 \
\strokec5   \strokec8 if\strokec5  (e.matches) \strokec9 pinToFinalStates\strokec5 ();   \strokec16 // lines drawn, counters at target, holds done, drives stopped\strokec4 \
\strokec5   \strokec8 else\strokec5  \strokec9 applyHeroMode\strokec5 ();                \strokec16 // motion is back: re-arm the scrub, never leave the pins behind\strokec4 \
\strokec5 \}\strokec7 );\strokec4 \
```\
\

\f0\b \strokec3 ## Design direction (what expensive means)
\f1\b0 \strokec4 \
\
The engineering floor keeps the site from breaking. This bar keeps it from looking like AI made it:\
\
\strokec20 -\strokec4  
\f0\b \strokec5 **Commit to ONE direction pulled from the subject's world**
\f1\b0 \strokec4  and let it drive palette, type, motion, and imagery together, so the page and the footage read as one world.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Invent one signature element**
\f1\b0 \strokec4  unique to this site and spend the boldness budget there. Everything else stays quiet so the signature reads. Then test its loudness: if the signature were removed, would the page meaningfully change? If it would barely change, it is not a signature. Spend the boldness budget on something whose absence would be noticed.\
\strokec20 -\strokec4  
\f0\b \strokec5 **No two adjacent sections share a layout skeleton.**
\f1\b0 \strokec4  If two neighbors both open kicker, headline, lede over the same grid, reshape one. A visitor should never feel the same template stamped twice in a row.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Ban the looks that scream "AI made this,"**
\f1\b0 \strokec4  unless the user explicitly briefs one: cream canvas with a serif and terracotta accent, near-black with acid-green, near-black with a warm amber accent and a high-contrast serif (the next default down whenever anyone says dark, rich, or cinematic), and hairline-border brutalism. One carve-out: these are banned as default reaches, not as subjects. When one of them genuinely IS the subject's own material world (a pottery studio really does live in cream and terracotta), committing to the subject's world wins. Earn it: sample the tones from the footage itself, invent the signature element, and stay clear of the stock template layout, so the page reads as this brand's world and not the default look. Say the deviation out loud.\
\strokec20 -\strokec4  
\f0\b \strokec5 **The accent appears in rare doses:**
\f1\b0 \strokec4  the call to action, focus states, and one or two moments of emphasis. An accent that is everywhere is not an accent.\
\strokec20 -\strokec4  
\f0\b \strokec5 **The canvas is never pure \strokec3 `#000`\strokec5  or \strokec3 `#fff`\strokec5 .**
\f1\b0 \strokec4  Tint it toward the footage's grade.\
\strokec20 -\strokec4  
\f0\b \strokec5 **Make the page one environment:**
\f1\b0 \strokec4  one fixed background layer behind everything (a slow drift, grain, or soft glow in the footage's world), cycling at 60 seconds or longer, so scrolling feels like moving through a place instead of past stacked sections.\
\

\f0\b \strokec3 ## The quality floor (all of it, every time)
\f1\b0 \strokec4 \
\
\strokec20 -\strokec4  Fonts trimmed to only the weights in use, with \strokec3 `preconnect`\strokec4 . Display face with real character, quiet body face, mono for small labels. Never Inter or Roboto as display.\
\strokec20 -\strokec4  Size text blocks in \strokec3 `ch`\strokec4  units on the text element itself, never on a container. A \strokec3 `ch`\strokec4  resolves against the font the element inherits, not the display face inside it, so a container's \strokec3 `ch`\strokec4  cap is measured in the wrong font. Containers get \strokec3 `px`\strokec4  or \strokec3 `min()`\strokec4 . A real build capped a settle block to the body font's \strokec3 `ch`\strokec4  and the headline broke to three lines.\
\strokec20 -\strokec4  Real contrast on the canvas: compute it, don't guess. 4.5:1 body text, 3:1 large text and interface borders. Hairline colors usually fail for interactive borders; give those their own stronger value.\
\strokec20 -\strokec4  Semantic landmarks: \strokec3 `<nav>`\strokec4 , \strokec3 `<main id="main" tabindex="-1">`\strokec4 , \strokec3 `<footer>`\strokec4 , a skip link to \strokec3 `#main`\strokec4 , a real heading hierarchy, and \strokec3 `aria-hidden="true"`\strokec4  on decorations.\
\strokec20 -\strokec4  The scrub video is decorative, so treat it that way: \strokec3 `aria-hidden="true"`\strokec4  on the video element, no \strokec3 `controls`\strokec4  attribute, and keep it out of the tab order (\strokec3 `tabindex="-1"`\strokec4  on the video, or \strokec3 `inert`\strokec4  on the sticky stage's decorative layer) so screen reader and keyboard users land on the captions and content instead.\
\strokec20 -\strokec4  \strokec3 `:focus-visible`\strokec4  styled in the accent. Touch targets at least 44px under \strokec3 `(pointer: coarse)`\strokec4 , added without changing layout: \strokec3 `@media (pointer:coarse)\{ .btn \{ min-height:44px; display:inline-flex; align-items:center; justify-content:center \} \}`\strokec4 . Never swap an element's display type without re-declaring its alignment; a bare \strokec3 `display:inline-flex`\strokec4  left-aligns button labels and shrinks full-width rows to their text.\
\strokec20 -\strokec4  Real \strokec3 `<title>`\strokec4 , meta description, \strokec3 `theme-color`\strokec4 , and an inline SVG favicon of the brand mark.\
\strokec20 -\strokec4  \strokec3 `og:image`\strokec4  and \strokec3 `og:url`\strokec4  need absolute URLs, which do not exist until deploy. Leave a clearly marked \strokec3 `<!-- DEPLOY STEP -->`\strokec4  comment and patch them with the live URL at deploy time (see \strokec3 `deploy.md`\strokec4 ).\
\strokec20 -\strokec4  Decorations never collide with content: absolutely positioned elements get reserved space and hide on short screens with a \strokec3 `max-height`\strokec4  media query.\
\strokec20 -\strokec4  Rows of text align on the baseline (\strokec3 `align-items: baseline`\strokec4 ), not centered boxes.\
\

\f0\b \strokec3 ## The self-testing checklist (run before showing the user anything)
\f1\b0 \strokec4 \
\
Audit adversarially. Prove it, don't assume it:\
\
\strokec20 1.\strokec4  Screenshot the built site at desktop size and at phone widths (375px wide at minimum; check 1280x800, 1440x900, 375x812, 375x667).\
\strokec20 2.\strokec4  Exercise every button and link. Submit the form and confirm its response state.\
\strokec20 3.\strokec4  Scrub the hero at the top, the middle, and the bottom. Then scrub fast. Watch for choppiness, especially in Chrome.\
\strokec20 4.\strokec4  Run the flick test on the beat map: wheel steps of 120px, 240px, and 360px. Every caption readable for 5 to 6 normal flicks, no beat skippable at 360px.\
\strokec20 5.\strokec4  Run the worst-frame legibility audit: every band's worst pixel under the text, with the scrim applied, at 3.5:1 contrast or better.\
\strokec20 6.\strokec4  Prove every entrance actually plays (cascade order can silently kill them).\
\strokec20 7.\strokec4  Try to force the page sideways: anchor links, wide decorations, narrow widths.\
\strokec20 8.\strokec4  Run with reduced motion on: final states visible, no video request made. Then flip reduced motion ON while the page is open, not just before loading it: every scroll-drawn element pins to its final state and the JS drives stop.\
\strokec20 9.\strokec4  Load with the video missing: page still complete over the poster.\
\strokec20 10.\strokec4  Check the browser console at desktop and phone sizes: zero errors.\
\strokec20 11.\strokec4  Check letter tails (g, y, p) in every masked or clipped text at 100 percent zoom.\
\strokec20 12.\strokec4  
\f0\b \strokec5 **The fresh-eyes pass, last.**
\f1\b0 \strokec4  Put the checklist down and look at the page as a first-time visitor with zero context. Does every element have its place, or does anything float unexplained? Is any parallel element unequal: a step without an image, a card styled differently from its siblings? Does the page read as premium and custom-made for this one brand, or does any stretch read as filler? Fix what the fresh eye catches before the user ever sees it. This is a different act from auditing, and it catches what audits cannot.\
\

\f0\b \strokec5 **When a controllable browser exists, run the real checks, not approximations.**
\f1\b0 \strokec4  The headless Chrome route in \strokec3 `troubleshooting.md`\strokec4  gives full control of a real browser, and four of the checks above can only be tested genuinely that way: touch emulation makes \strokec3 `(pointer: coarse)`\strokec4  actually match, the only true test of three of the five static-hero gates; emulated media flips \strokec3 `prefers-reduced-motion`\strokec4  live mid-session, the only true test of the both-directions requirement in step 8; blocking the video's URL with \strokec3 `Network.setBlockedURLs`\strokec4  tests complete-without-video without renaming any file; and a real mouse press and release, with a gap between them, tests the press-and-hold moment as a visitor performs it.\
\
If the environment can field independent reviewers (a second agent, a fresh pair of eyes), aim them at the finished build as well. The checklist proves what you thought to check; adversaries find what you did not think to.\
\
Report what you found and what you fixed. The user's last check is theirs, but they should never be the one to find your bugs.\
\
\pard\pardeftab720\sa320\partightenfactor0

\f5\b\fs44 \cf2 \strokec23 \
\pard\pardeftab720\partightenfactor0

\f4\b0\fs32 \cf2 \strokec23 \
}
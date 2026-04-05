# Design System — Bomi (보미)

## Product Context
- **What this is:** Voice-based English conversation companion for Korean children
- **Who it's for:** Korean kids aged 5-10 and their parents
- **Space/industry:** Children's education, language learning
- **Project type:** Single-screen voice interaction web app (mobile/tablet first)
- **Key insight:** This is a VOICE app, not a tap-and-learn app. During conversation the UI almost disappears. Just the fox + audio feedback.

## Character Direction
- **Style:** Illustrated baby fox, soft edges, picture-book warmth
- **Eyes:** Big, round, sparkling — the most expressive feature. Gleaming and curious.
- **Pose:** Full-body sitting (welcome screen), peeking face (conversation screen)
- **Expression:** Friendly, curious, never scary. Slightly different poses per state.
- **NOT:** Emoji, flat icon, 3D render, realistic animal

## Aesthetic Direction
- **Direction:** Playful/Toy-like
- **Decoration level:** Intentional — fox character and soft background texture only. Minimal during conversation.
- **Mood:** Warm, safe, picture-book calm. Like talking to a friend, not playing a game.
- **Reference:** Approved mockup at `~/.gstack/projects/namyeop-bomi/designs/design-system-20260402/remix-final.png`

## Typography
- **Display/Hero (English):** Quicksand Bold — rounded, playful, child-friendly
- **Body (Korean):** Pretendard — clean, readable, pairs well with Quicksand
- **UI/Labels:** Pretendard Medium
- **Loading:** Google Fonts CDN (`Quicksand:wght@500;700`), Pretendard via CDN
- **Scale:**
  - hero: 36px / 2.25rem (welcome heading)
  - title: 28px / 1.75rem
  - body-lg: 24px / 1.5rem (state labels)
  - body: 20px / 1.25rem
  - caption: 16px / 1rem (button text)
  - min readable: 16px (never smaller for children)

## Color
- **Approach:** Warm restrained — single orange accent, everything else neutral
- **Background:** `--bomi-bg: #fef9f0` (warm cream)
- **Surface:** `--bomi-surface: #fff7ed` (card backgrounds)
- **Primary accent:** `--bomi-orange: #ff8c42` (fox orange, buttons, active elements)
- **Primary hover:** `--bomi-orange-hover: #e67a35`
- **Primary light:** `--bomi-orange-light: #ffb380` (pulse ring, subtle highlights)
- **Text primary:** `--bomi-text: #3d2c1e` (warm brown)
- **Text secondary:** `--bomi-text-muted: #8b7355` (secondary labels)
- **Listening indicator:** `--bomi-green: #4caf50`
- **Error/End:** `--bomi-red: #e57373`
- **Semantic:** success `#4caf50`, warning `#ffb74d`, error `#e57373`
- **Dark mode:** Not planned (children's app, always light)

## Spacing
- **Base unit:** 8px
- **Density:** Spacious — children need room to breathe
- **Scale:** 2xs(4) xs(8) sm(16) md(24) lg(32) xl(48) 2xl(64) 3xl(96)
- **Touch targets:** 56px minimum height for all interactive elements (children's hands)

## Layout
- **Approach:** Single center-focus — fox is always the hero, centered
- **Grid:** Single column, centered content, max-width 480px
- **Breakpoints:** 375px (phone), 768px (tablet), 1024px+ (desktop/smart display)
- **Border radius:** buttons: 9999px (pill), cards: 16px, small elements: 8px

## Motion
- **Approach:** Intentional — state-driven, not decorative
- **Animations:**
  - `bounce-soft`: Fox idle bounce (2s ease-in-out, subtle 8px)
  - `pulse-ring`: Speaking state (1.5s ease-out, orange ring expands and fades)
  - `wave`: Listening state (0.8s per bar, staggered)
  - `fade-in`: Screen transitions (300ms ease-out)
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(100ms) short(200ms) medium(300ms) long(500ms)
- **Reduced motion:** Respect `prefers-reduced-motion` — replace animations with instant state changes

## Interaction States
- **Welcome:** Full-body fox, bouncing gently, "Start talking" button
- **Connecting:** Fox smaller, "보미를 만나는 중..." text
- **Listening:** Fox peeking, green wave bars, "듣고 있어요!"
- **Thinking:** Fox with curious tilt, "음... 생각 중!"
- **Speaking:** Fox bouncing, orange pulse ring, audio visualizer
- **STT failure:** Fox tilted head, "잘 못 알아들었어요. 다시 말해줄래?"
- **Mic denied:** Fox with paws up, "보미가 네 목소리를 들을 수 없어요"
- **Error:** Fox with gentle sad face, error message, retry button
- **Farewell:** Fox waving, "See you tomorrow! Bye bye!"
- **Parent report:** Card with session summary (Korean), after farewell

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-02 | Initial design system | Created by /design-consultation. Researched Duolingo, Lingokids. Chose warm/calm over stimulating because voice app needs focus, not taps. |
| 2026-04-02 | Quicksand + Pretendard | Rounded English font for playfulness + clean Korean font for readability |
| 2026-04-02 | Single orange accent | Brand differentiation from Duolingo (green) and Lingokids (purple). Fox = orange = Bomi. |
| 2026-04-02 | 56px min touch targets | Standard 44px is too small for 5-year-old fingers |
| 2026-04-02 | Remix: A body + B eyes | User chose A's soft illustration style with B's sparkling expressive eyes |

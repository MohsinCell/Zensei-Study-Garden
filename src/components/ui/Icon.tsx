interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

// Maps emojis to SVG icon keys - used to transparently convert emoji strings from API data
const EMOJI_MAP: Record<string, string> = {
  // Ranks
  "\u{1F331}": "sprout",     // 🌱
  "\u2728": "curious-spark",  // ✨
  "\u{1F50D}": "search",     // 🔍
  "\u{1F578}\uFE0F": "web",  // 🕸️
  "\u{1F3DB}\uFE0F": "pillar", // 🏛️
  "\u{1F3DB}": "pillar",     // 🏛️ (without variation selector)
  "\u{1F4DC}": "scroll",     // 📜
  "\u2692\uFE0F": "hammer",  // ⚒️
  "\u2692": "hammer",        // ⚒️ (without variation selector)
  "\u2600\uFE0F": "sun",     // ☀️
  "\u2600": "sun",           // ☀️ (without variation selector)
  "\u{1F52E}": "crystal",    // 🔮
  "\u{1F441}\uFE0F": "eye",  // 👁️
  "\u{1F441}": "eye",        // 👁️ (without variation selector)
  // Categories
  "\u{1F9ED}": "compass",    // 🧭
  "\u{1F3CA}": "waves",      // 🏊
  "\u2753": "question-circle", // ❓
  "\u{1F52C}": "microscope", // 🔬
  "\u{1F309}": "bridge",     // 🌉
  "\u{1F48E}": "gem",        // 💎
  "\u2B50": "star",          // ⭐
  "\u{1F525}": "flame",      // 🔥
  "\u26A1": "bolt",          // ⚡
  "\u{1F4C8}": "chart-up",   // 📈
  "\u{1F3A8}": "palette",    // 🎨
  "\u{1F4DA}": "books",      // 📚
  "\u{1F3AD}": "masks",      // 🎭
  "\u{1F3B2}": "dice",       // 🎲
  // Common achievement icons
  "\u{1F3C6}": "trophy",     // 🏆
  "\u{1F3C5}": "medal",      // 🏅
  "\u{1F9E0}": "brain",      // 🧠
  "\u{1F407}": "rabbit",     // 🐇
  "\u{1F30A}": "wave",       // 🌊
  "\u{1F93F}": "diver",      // 🤿
  "\u26CF\uFE0F": "pickaxe", // ⛏️
  "\u26CF": "pickaxe",       // ⛏️
  "\u{1F30B}": "volcano",    // 🌋
  "\u{1F914}": "thinking-face", // 🤔
  "\u{1F4AD}": "thought",    // 💭
  "\u{1F3B0}": "slot-machine", // 🎰
  "\u{1F4AF}": "hundred",    // 💯
  "\u{1F44B}": "hand",       // 🖐️ (close enough)
  "\u{1F44B}\uFE0F": "hand",
  "\u{1F590}\uFE0F": "hand", // 🖐️
  "\u{1F590}": "hand",
  "\u{1F3AF}": "target",     // 🎯
  "\u{1F340}": "clover",     // 🍀
  "\u2620\uFE0F": "target",
  "\u{1F680}": "rocket",     // 🚀
  "\u{1F451}": "crown",      // 👑
  "\u2B06\uFE0F": "arrow-up", // ⬆️
  "\u2B06": "arrow-up",      // ⬆️
  "\u267E\uFE0F": "infinity", // ♾️
  "\u267E": "infinity",
  "\u{1F4C5}": "calendar",   // 📅
  "\u{1F4CB}": "scroll",     // 📋
  "\u{1F4D6}": "book-open",  // 📖
  "\u{1F517}": "bridge",     // 🔗
  "\u270D\uFE0F": "scroll",  // ✂️
  "\u{1F4DD}": "scroll",     // 📝
  "\u{1F9EA}": "beaker",     // 🧪
  "\u{1F6E0}\uFE0F": "hammer", // 🛠️
  "\u{1F9D9}": "crystal",    // 🧙
  "\u{1F47B}": "eye",        // close enough
  "\u{1F4AB}": "sparkle",    // 💫
  "\u{1F31F}": "sparkle",    // 🌟
  "\u{1F396}\uFE0F": "medal", // 🎖️
  "\u{1F396}": "medal",
  "\u{1F56F}\uFE0F": "flame", // 🕯️
  "\u{1F56F}": "flame",
  "\u{1FAB5}": "flame",      // 🪵
  "\u2694\uFE0F": "hammer",  // ⚔️
  "\u2694": "hammer",
  "\u{1F6E1}\uFE0F": "check-badge", // 🛡️
  "\u{1F6E1}": "check-badge",
  "\u{1F985}": "eye",        // 🦅
  "\u{1F4AA}": "bolt",       // 💪
  "\u{1F30D}": "compass",    // 🌍
  "\u{1F463}": "sprout",     // 👣
  "\u{1F321}\uFE0F": "chart-up", // 🌡️
  "\u{1F321}": "chart-up",
  "\u{1F4B0}": "gem",        // 💰
  "\u{1F4CA}": "chart-up",   // 📊
  "\u{1F30C}": "crystal",    // 🌌
  "\u{1F522}": "hundred",    // 🔢
  "\u{1F382}": "sparkle",    // 🎂
  "\u{1F981}": "crown",      // 🦁
  "\u{1F5FF}": "pillar",     // 🗿
  "\u{1F3D4}\uFE0F": "pillar", // 🏔️
  "\u{1F3D4}": "pillar",
  "\u{1F3CE}\uFE0F": "bolt", // 🏎️
  "\u{1F3CE}": "bolt",
  "\u{1F9D0}": "search",     // 🧐
  "\u{1F52D}": "search",     // 🔭
  "\u2696\uFE0F": "gem",     // ⚖️
  "\u2696": "gem",
  "\u{1F98B}": "sparkle",    // 🦋
  "\u{1F308}": "palette",    // 🌈
  "\u{1F4BB}": "cog",        // 💻
  "\u{1F3FA}": "scroll",     // 🏺
  "\u{1F4B5}": "gem",        // 💵
  "\u{1F5A5}\uFE0F": "cog",  // 🖥️
  "\u{1F5A5}": "cog",
  "\u{1FA7A}": "search",     // 🩺
  "\u{1F310}": "compass",    // 🌐
  "\u{1F9F0}": "cog",        // 🧰
  "\u{1F9B8}": "star",       // 🦸
  "\u{1F989}": "night-owl",  // 🦉
  "\u{1F426}": "sprout",     // 🐦
  "\u{1F6CB}\uFE0F": "cog",  // 🛋️
  "\u{1F6CB}": "cog",
  "\u{1F3C3}": "bolt",       // 🏃
  "\u{1F4A8}": "bolt",       // 💨
  "\u{1F4D3}": "scroll",     // various book emojis
  "\u2702\uFE0F": "gem",     // ✂️
  "\u{1F529}": "cog",        // 🔩
  "\u{1F506}": "sun",        // 🔦
  "\u{1F3D7}\uFE0F": "pillar", // 🏗️
  "\u{1F3D7}": "pillar",
  "\u{1FAA2}": "bridge",     // 🪢
  "\u{1FA9E}": "search",     // 🪞
  "\u2697\uFE0F": "beaker",  // ⚗️
  "\u2697": "beaker",
  "\u2615": "sprout",        // ☘️ fallback
  "\u2618\uFE0F": "clover",  // ☘️
  "\u2618": "clover",
  "\u{1F33F}": "leaf",       // 🌿
  "\u{1F51F}": "hundred",    // 🔟
  "\u{1F35E}": "target",     // 🍞
};

// Resolve an icon name: if it looks like an emoji, try to map it; otherwise use as-is
export function resolveIconName(nameOrEmoji: string): string {
  if (ICON_PATHS[nameOrEmoji]) return nameOrEmoji;
  return EMOJI_MAP[nameOrEmoji] || "star"; // fallback to star
}

export default function Icon({ name, className = "w-4 h-4", size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  const resolved = resolveIconName(name);
  const path = ICON_PATHS[resolved];
  if (!path) {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  }
  if (typeof path === "function") return path({ className, style });
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      {path}
    </svg>
  );
}

// Map of icon name -> JSX paths (all use stroke style, 24x24 viewBox)
const ICON_PATHS: Record<string, React.ReactNode | ((props: { className?: string; style?: React.CSSProperties }) => React.ReactNode)> = {

  // ── UI / Navigation ──
  flame: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />,

  bolt: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 14.25 2.25 12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />,

  trophy: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.02 6.02 0 0 1-3.767 1.922m0 0a6.02 6.02 0 0 1-3.767-1.922" />,

  medal: <>
    <circle cx="12" cy="8" r="5" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5 7 21l5-3 5 3-1.5-8.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v4M10 8h4" />
  </>,

  "arrow-up": <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />,

  star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />,

  sparkle: ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  ),

  "chart-up": <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />,

  lock: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />,

  // ── Rank Icons ──
  sprout: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c0-4.5-4-6.5-7-5.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c0-4.5 4-6.5 7-5.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17c-2 0-5 1-5 5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17c2 0 5 1 5 5" />
  </>,

  "curious-spark": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </>,

  search: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,

  web: <>
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-3 3.5-3 6.5 0 9s3 5.5 0 9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c3 3.5 3 6.5 0 9s-3 5.5 0 9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 9h17M3.5 15h17" />
  </>,

  pillar: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
  </>,

  scroll: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </>,

  hammer: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
  </>,

  sun: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />,

  crystal: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 9l8 13 8-13-8-7Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v7m0 0 4.5 6.5M12 9 7.5 15.5" />
  </>,

  eye: <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,

  // ── Growth Rank Icons (seed → elder tree) ──
  "rank-seed": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C9.5 3 7 6.5 7 11c0 4 2 7.5 5 8 3-.5 5-4 5-8 0-4.5-2.5-8-5-8Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10c-1.5 1-2.5 2.5-3 4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9c1.5 1 2.5 2.5 3 4" />
  </>,

  "rank-sprout": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c0-5 4-8 7-7-1 4-3.5 7-7 7Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15c0-4-3.5-6.5-6-6 .5 3.5 3 6 6 6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
  </>,

  "rank-seedling": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-2-1-4.5-.5-5 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2-1 4.5-.5 5 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
  </>,

  "rank-young-plant": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16c-2.5-1-5-.5-5.5 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c2.5-1 5-.5 5.5 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10c-2-1.5-4-1-4.5.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-1 0-2-.5-2.5-1.5M12 21c1 0 2-.5 2.5-1.5" />
  </>,

  "rank-leafy-plant": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17c-3-1-5.5 0-5 2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17c3-1 5.5 0 5 2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-2.5-1.5-5-1-5 1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c2.5-1.5 5-1 5 1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c-2-2-4.5-1.5-4.5.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c2-2 4.5-1.5 4.5.5" />
  </>,

  "rank-budding-plant": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-13" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16c-3-1-5.5 0-5 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16c3-1 5.5 0 5 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c-2.5-1.5-5-.5-4.5 1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c2.5-1.5 5-.5 4.5 1" />
    <circle cx="12" cy="5.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5c.5-.8 1-1.2 1.5-1.5M13.5 4.5c-.5-.8-1-1.2-1.5-1.5" />
  </>,

  "rank-sapling": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c-3.5 0-6-2.5-6-5.5S8.5 2 12 2s6 1 6 3.5S15.5 11 12 11Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15c-1.5-.5-3 0-3 1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15c1.5-.5 3 0 3 1" />
  </>,

  "rank-young-tree": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8" />
    <ellipse cx="12" cy="8.5" rx="7" ry="6" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 21h5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c-2 .5-3.5 1.5-3.5 2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c2 .5 3.5 1.5 3.5 2.5" />
  </>,

  "rank-tree": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-7" />
    <ellipse cx="12" cy="8" rx="8" ry="6.5" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 14c-2 0-3.5 1-4 3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14c2 0 3.5 1 4 3" />
  </>,

  "rank-elder-tree": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15C6 15 2.5 11 2.5 7S6 1.5 12 1.5 21.5 3 21.5 7 18 15 12 15Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 21c-1.5 0-3-.5-4-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 21c1.5 0 3-.5 4-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 15c-1.5 1-2.5 2.5-2.5 4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 15c1.5 1 2.5 2.5 2.5 4" />
  </>,

  // ── Category Icons ──
  compass: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z" />
  </>,

  waves: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5c2.5-2 5-2 7.5 0s5 2 7.5 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c2.5-2 5-2 7.5 0s5 2 7.5 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5c2.5-2 5-2 7.5 0s5 2 7.5 0" />
  </>,

  "question-circle": <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />,

  microscope: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </>,

  bridge: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 17V9a7 7 0 0 1 14 0v8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-4M12 17v-6M16 17v-4" />
  </>,

  gem: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 12L2 9l4-6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h20" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21 8 9l4-6 4 6-4 12Z" />
  </>,

  palette: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
  </>,

  books: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </>,

  masks: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm4.5 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z" />
  </>,

  dice: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5h15v15h-15z" />
    <circle cx="9" cy="9" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="9" cy="15" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15" r="0.75" fill="currentColor" stroke="none" />
  </>,

  // ── Achievement tier specific ──
  leaf: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c0-4.5-4-6.5-7-5.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c0-4.5 4-6.5 7-5.5" />
  </>,

  clover: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22v-8" />
    <circle cx="12" cy="8" r="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="15.5" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" />
  </>,

  target: <>
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </>,

  brain: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 0 0-4.6 3.1A4 4 0 0 0 4 9a4 4 0 0 0 1.3 3A4.5 4.5 0 0 0 4 15a4 4 0 0 0 3.4 4A3 3 0 0 0 12 22m0-20a5 5 0 0 1 4.6 3.1A4 4 0 0 1 20 9a4 4 0 0 1-1.3 3A4.5 4.5 0 0 1 20 15a4 4 0 0 1-3.4 4A3 3 0 0 1 12 22m0-20v20" />,

  rabbit: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 4c0-1.5 1-3 2.5-3S18 2.5 18 4c0 1-1 2.5-2.5 3M11 4c0-1.5-1-3-2.5-3S6 2.5 6 4c0 1 1 2.5 2.5 3" />
    <circle cx="12" cy="12" r="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="11" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="14" cy="11" r="0.5" fill="currentColor" stroke="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 14h2" />
  </>,

  wave: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c2.5-4 5-4 7.5 0s5 4 7.5 0" />,

  diver: <>
    <circle cx="12" cy="6" r="3" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21c0-3 2-5 4-7 2 2 4 4 4 7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 16c2-1.5 4-3 6-5 2 2 4 3.5 6 5" />
  </>,

  pickaxe: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5 21 10l-2 2-6.5-6.5 2-2Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m12.5 7.5-8 8M6.5 17.5 3 21" />
  </>,

  volcano: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 9 8h6l-3-5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 21 9 10h6l4 11H5Z" />
  </>,

  thought: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 1.5-1.5 3-3 4v2h-3v-2c-1.5-1-3-2.5-3-4Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14.5h4" />
  </>,

  "slot-machine": <>
    <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M9 4v16M15 4v16" />
  </>,

  infinity: <path strokeLinecap="round" strokeLinejoin="round" d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8Z" />,

  hand: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3.15m3.15-3.15v-1.05a1.575 1.575 0 0 1 3.15 0v1.05m-3.15 0v6.3m3.15-7.35v3.15m0-3.15a1.575 1.575 0 0 1 3.15 0v3.15M6.9 7.725v2.1a7.35 7.35 0 0 0 7.35 7.35h.525a5.25 5.25 0 0 0 5.25-5.25v-4.2a1.575 1.575 0 0 0-3.15 0" />
  </>,

  "check-badge": <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />,

  hundred: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10M8 7c2 0 3 1.5 3 3.5v3c0 2-1 3.5-3 3.5s-3-1.5-3-3.5v-3C5 8.5 6 7 8 7Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7c2 0 3 1.5 3 3.5v3c0 2-1 3.5-3 3.5s-3-1.5-3-3.5v-3c0-2 1-3.5 3-3.5Z" />
  </>,

  "thinking-face": <>
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M10 15.5c.5.5 1.2.75 2 .75s1.5-.25 2-.75" />
  </>,

  lightbulb: <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />,

  cog: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />,

  "night-owl": <>
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </>,

  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />,

  crown: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18l-2.5-10L15 12l-3-6-3 6-3.5-4L3 18Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18v2H3v-2Z" />
  </>,

  rocket: <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />,

  beaker: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />,

  shuffle: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,

  "zap-fast": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 14.25 2.25 12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </>,

  "book-open": <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />,

  "magnify-plus": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8.25v4.5m2.25-2.25h-4.5" />
  </>,

  // Quick/brief mode
  "speed-lines": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4M3 12h7M3 17h4M13 7l4 5-4 5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l4 5-4 5" />
  </>,

  // Deep/detailed mode
  layers: <>
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 9 4.5L21 12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m3 16.5 9 4.5 9-4.5" />
  </>,

  // Curiosity
  "light-spark": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </>,

  // Study/exam mode
  "graduation-cap": <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </>,
};

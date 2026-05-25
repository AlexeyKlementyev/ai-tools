// Augment AI_TOOLS with website URLs, last-parsed timestamps, and
// "no-VPN access" flag (rough estimate for users in restricted regions).
// Kept separate from data.js so the parser can overwrite this file
// without touching the core records.
(function () {
  const now = Date.now();
  const day = 86400000;
  // url — official site
  // d   — days since last parse
  // vpn — true: доступно без VPN, false: требует VPN
  const META = {
    // LLM
    chatgpt:     { url: "https://chatgpt.com",                  d: 1,  vpn: false },
    claude:      { url: "https://claude.ai",                    d: 2,  vpn: false },
    gemini:      { url: "https://gemini.google.com",            d: 1,  vpn: false },
    grok:        { url: "https://grok.com",                     d: 3,  vpn: false },
    deepseek:    { url: "https://chat.deepseek.com",            d: 4,  vpn: true  },
    mistral:     { url: "https://chat.mistral.ai",              d: 5,  vpn: true  },
    qwen:        { url: "https://chat.qwen.ai",                 d: 2,  vpn: true  },
    kimi:        { url: "https://kimi.com",                     d: 3,  vpn: true  },
    zai:         { url: "https://chat.z.ai",                    d: 2,  vpn: true  },
    manus:       { url: "https://manus.im",                     d: 4,  vpn: true  },
    // Image
    midjourney:  { url: "https://www.midjourney.com",           d: 2,  vpn: true  },
    ideogram:    { url: "https://ideogram.ai",                  d: 6,  vpn: true  },
    flux:        { url: "https://blackforestlabs.ai",           d: 8,  vpn: true  },
    krea:        { url: "https://www.krea.ai",                  d: 3,  vpn: true  },
    recraft:     { url: "https://www.recraft.ai",               d: 4,  vpn: true  },
    firefly:     { url: "https://firefly.adobe.com",            d: 4,  vpn: false },
    leonardo:    { url: "https://leonardo.ai",                  d: 5,  vpn: true  },
    magnific:    { url: "https://magnific.ai",                  d: 4,  vpn: true  },
    phygital:    { url: "https://phygital.plus",                d: 2,  vpn: true  },
    openart:     { url: "https://openart.ai",                   d: 5,  vpn: true  },
    reve:        { url: "https://reve.com",                     d: 3,  vpn: true  },
    // Video
    runway:      { url: "https://runwayml.com",                 d: 2,  vpn: true  },
    sora:        { url: "https://sora.com",                     d: 1,  vpn: false },
    veo:         { url: "https://deepmind.google/models/veo",   d: 3,  vpn: false },
    pika:        { url: "https://pika.art",                     d: 7,  vpn: true  },
    luma:        { url: "https://lumalabs.ai/dream-machine",    d: 4,  vpn: true  },
    heygen:      { url: "https://www.heygen.com",               d: 6,  vpn: true  },
    kling:       { url: "https://klingai.com",                  d: 1,  vpn: true  },
    hailuo:      { url: "https://hailuoai.video",               d: 2,  vpn: true  },
    // Audio
    elevenlabs:  { url: "https://elevenlabs.io",                d: 2,  vpn: true  },
    suno:        { url: "https://suno.com",                     d: 1,  vpn: true  },
    udio:        { url: "https://www.udio.com",                 d: 5,  vpn: true  },
    descript:    { url: "https://www.descript.com",             d: 9,  vpn: true  },
    // Design
    figma:       { url: "https://www.figma.com",                d: 2,  vpn: true  },
    framer:      { url: "https://www.framer.com",               d: 3,  vpn: true  },
    flora:       { url: "https://florafauna.ai",                d: 6,  vpn: true  },
    gamma:       { url: "https://gamma.app",                    d: 3,  vpn: true  },
    // Code
    cursor:      { url: "https://cursor.com",                   d: 1,  vpn: true  },
    copilot:     { url: "https://github.com/features/copilot",  d: 3,  vpn: true  },
    v0:          { url: "https://v0.app",                       d: 2,  vpn: true  },
    lovable:     { url: "https://lovable.dev",                  d: 4,  vpn: true  },
    windsurf:    { url: "https://windsurf.com",                 d: 5,  vpn: true  },
    bolt:        { url: "https://bolt.new",                     d: 1,  vpn: true  },
    base44:      { url: "https://base44.com",                   d: 2,  vpn: true  },
    // Productivity
    notion:      { url: "https://www.notion.com",               d: 2,  vpn: true  },
    // Research
    perplexity:  { url: "https://www.perplexity.ai",            d: 1,  vpn: true  },
    you:         { url: "https://you.com",                      d: 11, vpn: true  },
    elicit:      { url: "https://elicit.com",                   d: 14, vpn: true  },
    consensus:   { url: "https://consensus.app",                d: 6,  vpn: true  },
    notebooklm:  { url: "https://notebooklm.google.com",        d: 2,  vpn: false },
    // Aggregators
    openrouter:  { url: "https://openrouter.ai",                d: 1,  vpn: true  },
    poe:         { url: "https://poe.com",                      d: 2,  vpn: true  },
    huggingface: { url: "https://huggingface.co",               d: 1,  vpn: true  },
    replicate:   { url: "https://replicate.com",                d: 3,  vpn: true  },
    fal:         { url: "https://fal.ai",                       d: 2,  vpn: true  },
    together:    { url: "https://www.together.ai",              d: 3,  vpn: true  },
    syntx:       { url: "https://syntx.ai",                     d: 1,  vpn: true  },
    aistudio:    { url: "https://aistudio.google.com",          d: 1,  vpn: false },
  };

  for (const tool of window.AI_TOOLS) {
    const m = META[tool.id];
    if (!m) continue;
    tool.url = m.url;
    tool.lastParsedAt = now - m.d * day;
    tool.vpnFree = m.vpn;
  }
})();

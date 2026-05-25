// Augment AI_TOOLS with website URLs and last-parsed timestamps.
// Kept separate from data.js so the parser can overwrite this file
// without touching the core records.
(function () {
  const now = Date.now();
  const day = 86400000;
  // daysAgo[id] = N → "обновлено N дней назад"
  const META = {
    // LLM
    chatgpt:     { url: "https://chatgpt.com",                  d: 1 },
    claude:      { url: "https://claude.ai",                    d: 2 },
    gemini:      { url: "https://gemini.google.com",            d: 1 },
    grok:        { url: "https://grok.com",                     d: 3 },
    deepseek:    { url: "https://chat.deepseek.com",            d: 4 },
    mistral:     { url: "https://chat.mistral.ai",              d: 5 },
    // Image
    midjourney:  { url: "https://www.midjourney.com",           d: 2 },
    ideogram:    { url: "https://ideogram.ai",                  d: 6 },
    flux:        { url: "https://blackforestlabs.ai",           d: 8 },
    krea:        { url: "https://www.krea.ai",                  d: 3 },
    recraft:     { url: "https://www.recraft.ai",               d: 4 },
    // Video
    runway:      { url: "https://runwayml.com",                 d: 2 },
    sora:        { url: "https://sora.com",                     d: 1 },
    veo:         { url: "https://deepmind.google/models/veo",   d: 3 },
    pika:        { url: "https://pika.art",                     d: 7 },
    luma:        { url: "https://lumalabs.ai/dream-machine",    d: 4 },
    heygen:      { url: "https://www.heygen.com",               d: 6 },
    // Audio
    elevenlabs:  { url: "https://elevenlabs.io",                d: 2 },
    suno:        { url: "https://suno.com",                     d: 1 },
    udio:        { url: "https://www.udio.com",                 d: 5 },
    descript:    { url: "https://www.descript.com",             d: 9 },
    // Code
    cursor:      { url: "https://cursor.com",                   d: 1 },
    copilot:     { url: "https://github.com/features/copilot",  d: 3 },
    v0:          { url: "https://v0.app",                       d: 2 },
    lovable:     { url: "https://lovable.dev",                  d: 4 },
    windsurf:    { url: "https://windsurf.com",                 d: 5 },
    // Research
    perplexity:  { url: "https://www.perplexity.ai",            d: 1 },
    you:         { url: "https://you.com",                      d: 11 },
    elicit:      { url: "https://elicit.com",                   d: 14 },
    // Aggregators
    openrouter:  { url: "https://openrouter.ai",                d: 1 },
    poe:         { url: "https://poe.com",                      d: 2 },
    huggingface: { url: "https://huggingface.co",               d: 1 },
    replicate:   { url: "https://replicate.com",                d: 3 },
    fal:         { url: "https://fal.ai",                       d: 2 },
  };

  for (const tool of window.AI_TOOLS) {
    const m = META[tool.id];
    if (!m) continue;
    tool.url = m.url;
    tool.lastParsedAt = now - m.d * day;
  }
})();

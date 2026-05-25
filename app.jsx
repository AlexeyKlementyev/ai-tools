/* global React */
const { useState, useMemo, useEffect } = React;

// ---------- helpers ----------
function formatPrice(p, label) {
  if (p === 0) return { value: "Бесплатно", cls: "price-zero" };
  if (p == null) return { value: "—", cls: "price-na" };
  return { value: `$${p}`, cls: "" };
}

function relativeTime(ts) {
  if (!ts) return null;
  const diffMs = Date.now() - ts;
  const day = 86400000;
  const days = Math.round(diffMs / day);
  if (days <= 0) return "обновлено сегодня";
  if (days === 1) return "обн. вчера";
  if (days < 7) return `обн. ${days} дн. назад`;
  if (days < 30) {
    const w = Math.round(days / 7);
    return `обн. ${w} нед. назад`;
  }
  const m = Math.round(days / 30);
  return `обн. ${m} мес. назад`;
}

function parsedFreshness(ts) {
  if (!ts) return "stale";
  const days = (Date.now() - ts) / 86400000;
  if (days <= 2) return "fresh";
  if (days <= 7) return "ok";
  return "stale";
}

function formatModels(n) {
  if (n == null) return null;
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return String(n);
}

// ---------- Icons ----------
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
);
const IconRefresh = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg>
);

// ---------- Logo ----------
function Logo({ tool }) {
  const inner = (
    <div className="logo" style={{ background: tool.monoColor }} aria-label={tool.name}>
      <span style={{ position: "relative", zIndex: 1 }}>{tool.monogram}</span>
    </div>
  );
  if (tool.url) {
    return (
      <a className="logo-link" href={tool.url} target="_blank" rel="noopener noreferrer" aria-label={`Открыть ${tool.name}`}>
        {inner}
      </a>
    );
  }
  return inner;
}

// ---------- Tag ----------
function Tag({ id }) {
  const label = window.AI_TAG_LABELS[id] || id;
  return <span className="tag" data-tag={id}>{label}</span>;
}

// ---------- Table Row ----------
function ToolRow({ tool, showModels }) {
  const basic = formatPrice(tool.basicPrice);
  const rel = relativeTime(tool.lastParsedAt);
  const fresh = parsedFreshness(tool.lastParsedAt);
  const stamp = tool.lastParsedAt ? new Date(tool.lastParsedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }) : "";

  return (
    <tr>
      <td className="logo-cell"><Logo tool={tool} /></td>
      <td className="name-cell" data-label="Сервис">
        <div className="name-row">
          {tool.url ? (
            <a className="name name-link" href={tool.url} target="_blank" rel="noopener noreferrer">
              {tool.name}
              <svg className="ext-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>
            </a>
          ) : (
            <span className="name">{tool.name}</span>
          )}
          <span className="vendor">{tool.vendor}</span>
        </div>
        <div className="desc">{tool.description}</div>
      </td>
      <td className="price-cell" data-label="Базовый тариф">
        <span className={"price " + basic.cls}>
          {basic.value}{tool.basicPrice > 0 && <span className="price-unit"> /мес</span>}
        </span>
        <span className="price-label">{tool.basicLabel}</span>
        {rel && (
          <span className={"parsed-stamp parsed-" + fresh} title={stamp ? `Последний парсинг: ${stamp}` : ""}>
            <span className="parsed-dot" /> {rel}
          </span>
        )}
      </td>
      <td className="free-cell" data-label="Бесплатно">
        {tool.freeTier ? (
          <>
            <span className="free-yes">Есть</span>
            {tool.freeDaily ? (
              <div className="daily-badge"><IconRefresh /> Ежедневно</div>
            ) : null}
            {tool.freeNote ? <span className="free-note">{tool.freeNote}</span> : null}
          </>
        ) : (
          <span className="free-no">Нет</span>
        )}
      </td>
      {showModels && (
        <td className="models-cell" data-label="Моделей">
          {tool.models != null ? (
            <>
              <span className="models-count">{formatModels(tool.models)}</span>
              <span className="models-label">моделей</span>
            </>
          ) : (
            <span className="models-dash">—</span>
          )}
        </td>
      )}
      <td className="tags-cell" data-label="Возможности">
        <div className="tags">
          {tool.tags.map((t) => <Tag key={t} id={t} />)}
        </div>
      </td>
    </tr>
  );
}

// ---------- Sort header ----------
function SortableTH({ label, sortKey, currentSort, onSort, align = "left" }) {
  const active = currentSort.key === sortKey;
  const arrow = active ? (currentSort.dir === "asc" ? "↑" : "↓") : "↕";
  return (
    <th
      className={"sortable" + (active ? " sorted" : "")}
      onClick={() => onSort(sortKey)}
      style={{ textAlign: align }}
    >
      {label}<span className="sort-ind">{arrow}</span>
    </th>
  );
}

// ---------- Main App ----------
function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [tagFilters, setTagFilters] = useState([]); // capability tags
  const [freeOnly, setFreeOnly] = useState(false);
  const [dailyOnly, setDailyOnly] = useState(false);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });

  // theme + density on root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-density", t.density);
  }, [t.theme, t.density]);

  const tools = window.AI_TOOLS;
  const categories = window.AI_CATEGORIES;

  // counts per category
  const categoryCounts = useMemo(() => {
    const map = { all: tools.length };
    for (const c of categories) {
      if (c.id === "all") continue;
      map[c.id] = tools.filter((x) => x.category === c.id).length;
    }
    return map;
  }, [tools, categories]);

  // available capability tags across all data
  const allTags = useMemo(() => {
    const s = new Set();
    tools.forEach((x) => x.tags.forEach((tg) => s.add(tg)));
    return Array.from(s);
  }, [tools]);

  const filtered = useMemo(() => {
    let rows = tools.slice();

    if (category !== "all") rows = rows.filter((r) => r.category === category);
    if (freeOnly) rows = rows.filter((r) => r.freeTier);
    if (dailyOnly) rows = rows.filter((r) => r.freeTier && r.freeDaily);
    if (tagFilters.length) rows = rows.filter((r) => tagFilters.every((tg) => r.tags.includes(tg)));
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.vendor.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }

    // sort
    const dir = sort.dir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      switch (sort.key) {
        case "name":
          return a.name.localeCompare(b.name, "ru") * dir;
        case "basicPrice":
          return ((a.basicPrice ?? 0) - (b.basicPrice ?? 0)) * dir;
        case "models":
          return ((a.models ?? -1) - (b.models ?? -1)) * dir;
        case "free":
          return ((a.freeTier ? 1 : 0) - (b.freeTier ? 1 : 0)) * dir;
        default:
          return 0;
      }
    });
    return rows;
  }, [tools, category, query, tagFilters, freeOnly, dailyOnly, sort]);

  const showModels = category === "aggregator" || t.alwaysShowModels;

  const onSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "basicPrice" ? "asc" : key === "models" ? "desc" : "asc" },
    );
  };

  const toggleTag = (tg) => {
    setTagFilters((cur) => (cur.includes(tg) ? cur.filter((x) => x !== tg) : cur.concat(tg)));
  };

  const clearFilters = () => {
    setTagFilters([]);
    setFreeOnly(false);
    setDailyOnly(false);
    setQuery("");
  };

  const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="app">
      {/* Header */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">— Сводка ИИ-сервисов / v1.0</span>
          <h1 className="brand-title">Каталог AI-инструментов</h1>
          <p className="brand-sub">
            Цены, бесплатные лимиты и возможности популярных нейросетей — данные собираются парсингом с официальных сайтов и обновляются автоматически.
          </p>
        </div>
        <div className="topbar-meta">
          <span>В каталоге</span>
          <span className="count">{tools.length}</span>
          <span className="pulse"><span className="pulse-dot" />Обновлено {today}</span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs" role="tablist">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            className={"tab" + (category === c.id ? " active" : "")}
            onClick={() => setCategory(c.id)}
          >
            <span>{c.label}</span>
            <span className="tab-count">{categoryCounts[c.id] ?? 0}</span>
          </button>
        ))}
      </nav>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search">
          <IconSearch />
          <input
            type="search"
            placeholder="Поиск по названию, вендору, описанию…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={"toggle-pill" + (freeOnly ? " on" : "")}
          onClick={() => setFreeOnly((v) => !v)}
          aria-pressed={freeOnly}
        >
          <span className="pill-dot" /> Только с бесплатным
        </button>

        <button
          type="button"
          className={"toggle-pill" + (dailyOnly ? " on" : "")}
          onClick={() => setDailyOnly((v) => !v)}
          aria-pressed={dailyOnly}
        >
          <span className="pill-dot" /> Ежедневное обновление
        </button>

        <div className="toolbar-spacer" />

        <div className="toolbar-group">
          <span className="toolbar-label">Сорт.</span>
          <div className="select">
            <select
              value={sort.key + ":" + sort.dir}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":");
                setSort({ key, dir });
              }}
            >
              <option value="name:asc">По названию (А→Я)</option>
              <option value="basicPrice:asc">Базовый тариф ↑ (дёшево → дорого)</option>
              <option value="basicPrice:desc">Базовый тариф ↓ (дорого → дёшево)</option>
              <option value="models:desc">Кол-во моделей ↓</option>
              <option value="free:desc">Сначала с бесплатным</option>
            </select>
          </div>
        </div>
      </div>

      {/* Capability filter chips */}
      <div className="filter-row">
        <span className="filter-row-label">Возможности</span>
        {allTags.map((tg) => (
          <button
            key={tg}
            type="button"
            className={"chip" + (tagFilters.includes(tg) ? " on" : "")}
            onClick={() => toggleTag(tg)}
            aria-pressed={tagFilters.includes(tg)}
          >
            {window.AI_TAG_LABELS[tg] || tg}
          </button>
        ))}
        {(tagFilters.length > 0 || freeOnly || dailyOnly || query) && (
          <button type="button" className="chip-clear" onClick={clearFilters}>
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-title">Ничего не найдено</div>
            <div>Попробуйте сбросить фильтры или изменить запрос.</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 56 }}></th>
                <SortableTH label="Сервис" sortKey="name" currentSort={sort} onSort={onSort} />
                <SortableTH label="Базовый тариф" sortKey="basicPrice" currentSort={sort} onSort={onSort} />
                <SortableTH label="Бесплатно" sortKey="free" currentSort={sort} onSort={onSort} />
                {showModels && <SortableTH label="Моделей" sortKey="models" currentSort={sort} onSort={onSort} />}
                <th>Возможности</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tool) => (
                <ToolRow key={tool.id} tool={tool} showModels={showModels} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer / legend */}
      <div className="footer">
        <div className="legend">
          <span className="legend-item"><span className="legend-dot" /> ежедневный сброс лимитов</span>
          <span className="legend-item">$ — цена за месяц</span>
          <span className="legend-item">данные парсятся автоматически</span>
        </div>
        <div>Показано {filtered.length} из {tools.length}</div>
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Внешний вид">
          <TweakRadio
            label="Тема"
            value={t.theme}
            options={[{ value: "light", label: "Светлая" }, { value: "dark", label: "Тёмная" }]}
            onChange={(v) => setTweak("theme", v)}
          />
          <TweakRadio
            label="Плотность"
            value={t.density}
            options={[{ value: "comfortable", label: "Просторно" }, { value: "compact", label: "Плотно" }]}
            onChange={(v) => setTweak("density", v)}
          />
        </TweakSection>
        <TweakSection label="Колонки">
          <TweakToggle
            label="Всегда показывать «Моделей»"
            value={t.alwaysShowModels}
            onChange={(v) => setTweak("alwaysShowModels", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

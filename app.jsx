/* global React */
const { useState, useMemo, useEffect, useRef, useCallback } = React;

// ---------- localStorage hooks ----------
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }, [key, value]);
  return [value, setValue];
}

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

// ---------- Star (favorite) ----------
function FavStar({ active, onToggle, name }) {
  return (
    <button
      type="button"
      className={"fav-star" + (active ? " on" : "")}
      aria-pressed={active}
      aria-label={active ? `Убрать ${name} из избранного` : `Добавить ${name} в избранное`}
      title={active ? "В избранном" : "В избранное"}
      onClick={onToggle}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    </button>
  );
}

// ---------- Comment line ----------
function CommentLine({ value, onChange, name }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const taRef = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);
  useEffect(() => {
    if (editing && taRef.current) {
      const el = taRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 240) + "px";
    }
  }, [editing]);

  const commit = useCallback(() => {
    const next = draft.trim();
    if (next !== (value || "").trim()) onChange(next);
    setEditing(false);
  }, [draft, value, onChange]);

  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); cancel(); }
    else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
  };

  const onInput = (e) => {
    setDraft(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 240) + "px";
  };

  if (editing) {
    return (
      <div className="comment-edit">
        <textarea
          ref={taRef}
          className="comment-textarea"
          value={draft}
          onChange={onInput}
          onBlur={commit}
          onKeyDown={onKeyDown}
          placeholder={`Заметка о ${name}…`}
          rows={1}
        />
        <span className="comment-hint">↵ Cmd+Enter — сохранить, Esc — отмена</span>
      </div>
    );
  }

  if (value) {
    return (
      <div className="comment-line has-note" onClick={() => setEditing(true)} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setEditing(true); } }}>
        <svg className="comment-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span className="comment-text">{value}</span>
      </div>
    );
  }

  return (
    <button type="button" className="comment-add" onClick={() => setEditing(true)}>
      <span className="comment-add-plus">+</span> добавить заметку
    </button>
  );
}

// ---------- VPN cell ----------
function VpnCell({ free }) {
  if (free === undefined || free === null) {
    return <span className="vpn vpn-unknown" title="Нет данных">—</span>;
  }
  if (free) {
    return (
      <span className="vpn vpn-yes" title="Доступен без VPN">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7"/></svg>
        <span className="vpn-label">Да</span>
      </span>
    );
  }
  return (
    <span className="vpn vpn-no" title="Требует VPN">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6 18 18"/><path d="M18 6 6 18"/></svg>
      <span className="vpn-label">Нет</span>
    </span>
  );
}

// ---------- Table Row ----------
function ToolRow({ tool, showModels, isFav, onToggleFav, comment, onComment }) {
  const basic = formatPrice(tool.basicPrice);
  const rel = relativeTime(tool.lastParsedAt);
  const fresh = parsedFreshness(tool.lastParsedAt);
  const stamp = tool.lastParsedAt ? new Date(tool.lastParsedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }) : "";

  return (
    <tr className={comment ? "has-comment" : ""}>
      <td className="fav-cell">
        <FavStar active={isFav} onToggle={onToggleFav} name={tool.name} />
      </td>
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
        <CommentLine value={comment} onChange={onComment} name={tool.name} />
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
      <td className="vpn-cell" data-label="Без VPN">
        <VpnCell free={tool.vpnFree} />
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
  const [noVpnOnly, setNoVpnOnly] = useState(false);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });

  // local-only user state
  const [favorites, setFavorites] = useLocalStorage("aitools.favorites", []);
  const [comments, setComments] = useLocalStorage("aitools.comments", {});
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFav = (id) => {
    setFavorites((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id)));
  };
  const updateComment = (id, text) => {
    setComments((cur) => {
      const next = { ...cur };
      if (text) next[id] = text; else delete next[id];
      return next;
    });
  };

  // theme + density on root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-density", t.density);
  }, [t.theme, t.density]);

  const tools = window.AI_TOOLS;
  const categories = window.AI_CATEGORIES;

  // counts per category
  const categoryCounts = useMemo(() => {
    const map = { all: tools.length, favorites: favSet.size };
    for (const c of categories) {
      if (c.id === "all" || c.id === "favorites") continue;
      map[c.id] = tools.filter((x) => x.category === c.id).length;
    }
    return map;
  }, [tools, categories, favSet]);

  // available capability tags across all data
  const allTags = useMemo(() => {
    const s = new Set();
    tools.forEach((x) => x.tags.forEach((tg) => s.add(tg)));
    return Array.from(s);
  }, [tools]);

  const filtered = useMemo(() => {
    let rows = tools.slice();

    if (category === "favorites") rows = rows.filter((r) => favSet.has(r.id));
    else if (category !== "all") rows = rows.filter((r) => r.category === category);
    if (freeOnly) rows = rows.filter((r) => r.freeTier);
    if (dailyOnly) rows = rows.filter((r) => r.freeTier && r.freeDaily);
    if (noVpnOnly) rows = rows.filter((r) => r.vpnFree);
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
        case "vpn":
          return ((a.vpnFree ? 1 : 0) - (b.vpnFree ? 1 : 0)) * dir;
        default:
          return 0;
      }
    });
    return rows;
  }, [tools, category, query, tagFilters, freeOnly, dailyOnly, noVpnOnly, sort, favSet]);

  const showModels = category === "aggregator" || t.alwaysShowModels;

  const onSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "basicPrice" ? "asc" : key === "models" || key === "vpn" ? "desc" : "asc" },
    );
  };

  const toggleTag = (tg) => {
    setTagFilters((cur) => (cur.includes(tg) ? cur.filter((x) => x !== tg) : cur.concat(tg)));
  };

  const clearFilters = () => {
    setTagFilters([]);
    setFreeOnly(false);
    setDailyOnly(false);
    setNoVpnOnly(false);
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
        {[
          ...categories.slice(0, 1),
          { id: "favorites", label: "Избранное", hint: "ваш личный список", icon: "star" },
          ...categories.slice(1),
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            className={"tab" + (category === c.id ? " active" : "") + (c.id === "favorites" ? " tab-fav" : "")}
            onClick={() => setCategory(c.id)}
          >
            {c.icon === "star" && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 2 }}>
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            )}
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

        <button
          type="button"
          className={"toggle-pill" + (noVpnOnly ? " on" : "")}
          onClick={() => setNoVpnOnly((v) => !v)}
          aria-pressed={noVpnOnly}
        >
          <span className="pill-dot" /> Без VPN
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
              <option value="vpn:desc">Сначала без VPN</option>
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
        {(tagFilters.length > 0 || freeOnly || dailyOnly || noVpnOnly || query) && (
          <button type="button" className="chip-clear" onClick={clearFilters}>
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty">
            {category === "favorites" && favSet.size === 0 ? (
              <>
                <div className="empty-title">В избранном пока пусто</div>
                <div>Нажмите ★ рядом с сервисом, чтобы добавить его сюда.</div>
              </>
            ) : (
              <>
                <div className="empty-title">Ничего не найдено</div>
                <div>Попробуйте сбросить фильтры или изменить запрос.</div>
              </>
            )}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 36 }} aria-label="Избранное"></th>
                <th style={{ width: 56 }}></th>
                <SortableTH label="Сервис" sortKey="name" currentSort={sort} onSort={onSort} />
                <SortableTH label="Базовый тариф" sortKey="basicPrice" currentSort={sort} onSort={onSort} />
                <SortableTH label="Бесплатно" sortKey="free" currentSort={sort} onSort={onSort} />
                <SortableTH label="Без VPN" sortKey="vpn" currentSort={sort} onSort={onSort} />
                {showModels && <SortableTH label="Моделей" sortKey="models" currentSort={sort} onSort={onSort} />}
                <th>Возможности</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tool) => (
                <ToolRow
                  key={tool.id}
                  tool={tool}
                  showModels={showModels}
                  isFav={favSet.has(tool.id)}
                  onToggleFav={() => toggleFav(tool.id)}
                  comment={comments[tool.id] || ""}
                  onComment={(text) => updateComment(tool.id, text)}
                />
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

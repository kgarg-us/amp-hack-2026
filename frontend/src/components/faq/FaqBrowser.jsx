import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getAllFAQs } from "../../services/api";

// Browse all FAQs grouped by category — a calm, no-typing way to explore.
export default function FaqBrowser() {
  const [items, setItems] = useState([]);
  const [openCategories, setOpenCategories] = useState(new Set());
  const [openItems, setOpenItems] = useState(new Set());

  useEffect(() => {
    getAllFAQs().then(setItems);
  }, []);

  const groups = useMemo(() => {
    const order = [];
    const map = {};
    for (const item of items) {
      if (!map[item.category]) {
        map[item.category] = [];
        order.push(item.category);
      }
      map[item.category].push(item);
    }
    return order.map((category) => ({ category, items: map[category] }));
  }, [items]);

  const toggle = (set, key) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  if (groups.length === 0) return null;

  return (
    <section className="rounded-lg border border-white bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-1 text-xl font-black text-ink">Browse all questions</h2>
      <p className="mb-5 text-sm text-slate-500">
        Explore the full FAQ by topic — {items.length} questions.
      </p>

      <div className="space-y-3">
        {groups.map((group) => {
          const categoryOpen = openCategories.has(group.category);
          return (
            <div
              key={group.category}
              className="overflow-hidden rounded-lg border border-slate-200"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenCategories((prev) => toggle(prev, group.category))
                }
                aria-expanded={categoryOpen}
                className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
              >
                <span className="font-bold text-ink">{group.category}</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  {group.items.length}
                  <ChevronDown
                    size={18}
                    className={`transition ${categoryOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              {categoryOpen ? (
                <ul className="divide-y divide-slate-100">
                  {group.items.map((item) => {
                    const itemOpen = openItems.has(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenItems((prev) => toggle(prev, item.id))
                          }
                          aria-expanded={itemOpen}
                          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <span className="font-semibold text-slate-700">
                            {item.question}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`mt-1 shrink-0 text-slate-400 transition ${
                              itemOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {itemOpen ? (
                          <p className="px-4 pb-4 text-sm leading-6 text-slate-600">
                            {item.answer}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

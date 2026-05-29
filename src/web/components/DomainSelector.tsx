"use client";

type Domain = "code-review" | "content-seo" | "social-news";

const DOMAINS: { value: Domain; label: string; desc: string }[] = [
  { value: "content-seo", label: "Blog / SEO", desc: "Blog posts, articles, web content" },
  { value: "code-review", label: "Code Review", desc: "PR descriptions, commit messages" },
  { value: "social-news", label: "News / Social", desc: "News articles, social media posts" },
];

interface Props {
  value: Domain;
  onChange: (v: Domain) => void;
}

export function DomainSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">Domain</label>
      <div className="flex gap-2">
        {DOMAINS.map(d => (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            title={d.desc}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
              value === d.value
                ? "bg-red-600 border-red-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

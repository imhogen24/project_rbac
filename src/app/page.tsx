import Image from "next/image";

const issues = [
  {
    number: 1,
    title: "Project scaffold",
    assignee: "Kennedy Anyidoho",
    status: "done" as const,
    dependsOn: [],
  },
  {
    number: 2,
    title: "Database schema",
    assignee: "Emmanuel Narh",
    status: "open" as const,
    dependsOn: [1],
  },
  {
    number: 3,
    title: "Auth config and guard helper",
    assignee: "Emmanuel Narh",
    status: "open" as const,
    dependsOn: [2],
  },
  {
    number: 4,
    title: "Auth proxy (middleware)",
    assignee: "Emmanuel Aweh",
    status: "open" as const,
    dependsOn: [3],
  },
  {
    number: 5,
    title: "Protected API routes",
    assignee: "Emmanuel Aweh",
    status: "open" as const,
    dependsOn: [3, 4],
  },
  {
    number: 6,
    title: "CI pipeline",
    assignee: "Enoch Sitsofe Nkrumah",
    status: "open" as const,
    dependsOn: [3],
  },
  {
    number: 7,
    title: "Design system",
    assignee: "Christopher Lartey Mensah",
    status: "open" as const,
    dependsOn: [1],
  },
  {
    number: 8,
    title: "Sign-in and sign-out pages",
    assignee: "Leigh Angelyn",
    status: "open" as const,
    dependsOn: [3, 7],
  },
  {
    number: 9,
    title: "Dashboard and role-based UI",
    assignee: "Leigh Angelyn",
    status: "open" as const,
    dependsOn: [4, 7, 8],
  },
  {
    number: 10,
    title: "Admin panel",
    assignee: "Christopher Lartey Mensah",
    status: "open" as const,
    dependsOn: [9],
  },
];

const readOrder = [
  { label: "README.md", path: "README.md" },
  { label: "docs/ARCHITECTURE.md", path: "docs/ARCHITECTURE.md" },
  { label: "docs/RBAC_FEATURE_SPEC.md", path: "docs/RBAC_FEATURE_SPEC.md" },
  { label: "docs/team/README.md", path: "docs/team/README.md" },
  { label: "docs/team/WORKING_A_TASK.md", path: "docs/team/WORKING_A_TASK.md" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <main className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-14">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <Image
            src="/nav-logo.png"
            alt="IMHOGEN logo"
            width={100}
            height={20}
            priority
            className="dark:invert"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                PROJECT_RBAC
              </h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Sandbox exercise
              </span>
            </div>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400 max-w-xl">
              This is the IMHOGEN onboarding sandbox. Build the RBAC system
              end-to-end following the same stack and operating procedures as
              the ERM platform. Read the docs below before touching any code.
            </p>
          </div>
        </div>

        {/* Read first */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Read in this order before writing any code
          </h2>
          <ol className="flex flex-col gap-2">
            {readOrder.map((doc, i) => (
              <li key={doc.path} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {i + 1}
                </span>
                <code className="text-zinc-700 dark:text-zinc-300">
                  {doc.label}
                </code>
              </li>
            ))}
          </ol>
        </section>

        {/* Issue list */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Issues — find yours in Linear, then check its dependencies below
          </h2>
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {issues.map((issue) => (
              <div
                key={issue.number}
                className="flex items-start justify-between gap-4 bg-white px-4 py-3 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xs font-mono text-zinc-400 dark:text-zinc-500 w-4 shrink-0">
                    {issue.number.toString().padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {issue.title}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {issue.assignee}
                      {issue.dependsOn.length > 0 && (
                        <>
                          {" "}
                          &mdash; needs{" "}
                          {issue.dependsOn.map((n) => `#${n}`).join(", ")} first
                        </>
                      )}
                    </span>
                  </div>
                </div>
                {issue.status === "done" ? (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    Done
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Open
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Where to start */}
        <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Where to start
          </h2>
          <ol className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex gap-2">
              <span className="text-zinc-400">1.</span> Read all five docs above
              in order.
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-400">2.</span> Pick up your Linear
              issue. Do not start until its dependencies are merged.
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-400">3.</span> Branch off{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                main
              </code>{" "}
              using the branch name from Linear — do not invent one.
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-400">4.</span> Follow the SOP in{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                docs/team/WORKING_A_TASK.md
              </code>{" "}
              from pickup to merge.
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}

type LegalSection = {
  heading: string;
  body: string[];
};

export function LegalDocumentPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="bg-slate-50 py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="mb-3 text-4xl font-bold text-slate-900">{title}</h1>
          <p className="mb-8 text-slate-600">{intro}</p>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-3 text-2xl font-semibold text-slate-900">{section.heading}</h2>
                <div className="space-y-3 text-slate-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

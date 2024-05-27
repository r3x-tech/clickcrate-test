'use client';

import { AppHero } from '../ui/ui-layout';

const links: { label: string; href: string }[] = [
  { label: 'ClickCrate Docs', href: 'https://docs.clickcrate.xyz/' },
  { label: 'ClickCrate Website', href: 'https://www.clickcrate.xyz/' },
  {
    label: 'ClickCrate GitHub',
    href: 'https://github.com/r3x-tech/clickcrate',
  },
];

export default function DashboardFeature() {
  return (
    <div>
      <AppHero title="gm" subtitle="Welcome to ClickCrate dashboard!" />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          <p>Resources:</p>
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

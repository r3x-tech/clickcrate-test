'use client';

import { AppHero } from '../ui/ui-layout';

const links: { label: string; href: string }[] = [
  { label: 'ClickCrate Docs', href: 'https://docs.clickcrate.xyz/' },
  {
    label: 'ClickCrate GitHub',
    href: 'https://github.com/r3x-tech/clickcrate',
  },
  { label: 'ClickCrate Website', href: 'https://www.clickcrate.xyz/' },
];

export default function DashboardFeature() {
  return (
    <div>
      <AppHero title="gm" subtitle="Welcome to ClickCrate Dashboard!" />
      <div
        className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '600' }}
      >
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="link font-normal"
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

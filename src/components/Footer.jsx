import { NavLink } from "react-router-dom";

const DEFAULT_ROUTES = {
  home: "/",
  troubleshooting: "/troubleshooting",
  help: "/help",
  about: "/about",
};

function YoutubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.4c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.3 1.6-4.3 4.5v2.8H7.3V13h2.9v9h3.3Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M22 5.8c-.7.3-1.5.5-2.3.6a4 4 0 0 0 1.8-2.2c-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 2.7c0 .3 0 .6.1.9a11.4 11.4 0 0 1-8.3-4.2 4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.8-.5v.1a4 4 0 0 0 3.2 3.9c-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 3.5 18H2a11.3 11.3 0 0 0 6.2 1.8c7.4 0 11.5-6.1 11.5-11.5v-.5A8 8 0 0 0 22 5.8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M5.3 7.8H2V22h3.3V7.8ZM3.7 2A2 2 0 1 0 3.7 6a2 2 0 0 0 0-4ZM22 13.9c0-4.3-2.3-6.3-5.3-6.3-2.4 0-3.6 1.4-4.2 2.3V7.8H9.2V22h3.3v-7c0-1.9.4-3.7 2.7-3.7 2.3 0 2.3 2.1 2.3 3.8V22H22v-8.1Z" />
    </svg>
  );
}

const SOCIAL_ITEMS = [
  {
    key: "youtube",
    label: "YouTube",
    Icon: YoutubeIcon,
  },
  {
    key: "facebook",
    label: "Facebook",
    Icon: FacebookIcon,
  },
  {
    key: "twitter",
    label: "Twitter",
    Icon: TwitterIcon,
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: LinkedinIcon,
  },
];

function Footer({ routes = {}, socialLinks = {}, copyrightText }) {
  const resolvedRoutes = {
    ...DEFAULT_ROUTES,
    ...routes,
  };

  const navigationItems = [
    {
      label: "트러블슈팅",
      path: resolvedRoutes.home,
      end: true,
    },
  ];

  const availableSocialItems = SOCIAL_ITEMS.filter(
    (item) => socialLinks[item.key],
  );

  const currentYear = new Date().getFullYear();

  const resolvedCopyrightText =
    copyrightText ?? `© ${currentYear} ERROR WIKY. All rights reserved.`;

  return (
    <footer className="w-full bg-[#f2f2f2] px-4 pb-5 pt-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1200px] bg-white px-6 py-9 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <NavLink
            to={resolvedRoutes.home}
            end
            aria-label="ERROR WIKY 홈으로 이동"
            className="w-fit rounded-md text-xl font-bold tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff572f] focus-visible:ring-offset-2"
          >
            <span className="text-[#ff572f]">ERROR</span>
            <span className="ml-1 text-slate-900">WIKY</span>
          </NavLink>

          <nav
            aria-label="푸터 메뉴"
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "rounded-md text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[#ff572f] focus-visible:ring-offset-2",
                    isActive
                      ? "text-[#ff572f]"
                      : "text-slate-700 hover:text-[#ff572f]",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="my-8 h-px w-full bg-slate-200" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">
            {resolvedCopyrightText}
          </p>

          {availableSocialItems.length > 0 && (
            <div aria-label="소셜 미디어" className="flex items-center gap-4">
              {availableSocialItems.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={socialLinks[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${label} 새 창에서 열기`}
                  className="rounded-md text-slate-900 transition-colors hover:text-[#ff572f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff572f] focus-visible:ring-offset-2"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;

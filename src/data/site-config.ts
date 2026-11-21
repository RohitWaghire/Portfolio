/**
 * YOUR SITE CONTENT LIVES HERE.
 *
 * Everything below is a placeholder. Search for "TODO" and replace the value;
 * nothing else in the code needs to change.
 */
import { CaseStudyContent, PanelContent, PricingContent, PricingPlan, SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  // TODO: your name, as shown in the side panel and in browser metadata
  name: "Rohit Waghire",
  // TODO: where the site will live (used for absolute URLs / social cards)
  url: "https://rohitwaghire.com",
  // TODO: browser tab title
  title: "Rohit Waghire — Portfolio",
  // TODO: one-line description, used for search results and social cards
  headline: "Interfaces for the AI era",
  description: "Independent design engineer. Code, motion, and AI visuals.",
  // TODO: your social links. Both the panel button and the contact sheet use these.
  x: {
    label: "@rohityin",
    href: "https://x.com/rohityin"
  },
  email: "you@example.com",
  contra: {
    label: "Rohit Waghire",
    href: "https://contra.com/RohitWaghire/work"
  },
  // TODO: your timezone. The clock in the side panel reads this.
  timezone: "Asia/Kolkata",
  zone: "IST"
};

export const panelContent: PanelContent = {
  name: "Rohit Waghire",
  status: "Open for work",
  title: ["Interfaces for the,", "AI era"],
  text: "Independent design engineer. Code, motion, and AI visuals.",
  cta: "Start a project",
  pricing: "See pricing",
  close: "Close",
  time: "Local time",
  follow: "Follow",
  // TODO: the line under the panel changes with the hour from your timezone
  moods: [
    { from: 0, text: "Asleep, I'll reply in the morning" },
    { from: 7, text: "Morning coffee, then work" },
    { from: 10, text: "Heads down on a project" },
    { from: 13, text: "Lunch, then back to it" },
    { from: 15, text: "Shipping something today" },
    { from: 19, text: "Wrapping up for the day" },
    { from: 22, text: "Up late polishing details" }
  ]
};

export const pricingContent: PricingContent = {
  label: "Pricing",
  title: "Pricing",
  lead: "A fixed price agreed before we start",
  cta: "Start a project"
};

export const pricingPlans: PricingPlan[] = [
  {
    title: "Project",
    price: "$500",
    unit: "and up",
    featured: false,
    features: [
      "Landing page or small site, designed and built",
      "Responsive on mobile, tablet, and desktop",
      "Two rounds of revisions",
      "Launch-ready files and handoff"
    ]
  },
  {
    title: "Retainer",
    price: "$2500+",
    unit: "per month",
    featured: true,
    features: [
      "Ongoing design and build support",
      "Priority turnaround on new requests",
      "Unlimited small fixes and tweaks",
      "Monthly planning call"
    ]
  },
  {
    title: "Consulting",
    price: "$1500",
    unit: "and up",
    featured: false,
    features: [
      "UX and visual audit of your product",
      "Prioritized list of fixes",
      "Live walkthrough of the findings",
      "Two weeks of follow-up questions"
    ]
  }
];

export const caseStudyContent: CaseStudyContent = {
  meta: {
    title: "Before and after",
    headline: "Static screen to living interface",
    description: "A before-and-after look at how FoodLoop AI and DelveDeep turned static screens into living interfaces through visual craft, motion, and interaction polish."
  },
  panel: {
    title: ["Static screen to", "living interface"],
    text: "Slide to see how visual craft and interaction polish change the way a product feels.",
    cta: "Discuss your project",
    more: "See pricing"
  },
  compare: {
    before: "Before",
    after: "After",
    handle: "Drag to compare before and after"
  },
  examples: [
    {
      label: "FoodLoop AI",
      before: "/showcase/foodloop-before.webp",
      after: "/showcase/foodloop-after.webp",
      width: 1600,
      height: 1000
    },
    {
      label: "DelveDeep",
      before: "/showcase/delve-before.webp",
      after: "/showcase/delve-after.webp",
      width: 1921,
      height: 1081
    }
  ],
  offer: {
    title: "Start a project",
    lead: "A focused sprint from first sketch to a launch-ready site, usually in one to two weeks.",
    cta: "Send a brief",
    plan: {
      title: "Project",
      price: "$500",
      unit: "and up",
      featured: true,
      features: [
        "Landing page or small site, designed and built",
        "Responsive on mobile, tablet, and desktop",
        "Two rounds of revisions",
        "Launch-ready files and handoff"
      ]
    }
  }
};

export const formStrings = {
  title: "Tell me about your project",
  lead: "A few details are enough, I'll come back with ideas and a plan",
  response: "I usually reply within a day",
  chat: ["Prefer to chat? Message me on", "X", "or", "Contra"] as const,
  details: "Your details",
  fields: {
    name: "Your name",
    email: "you@example.com",
    details: "A few words about the project (optional)",
    handle: "X handle (optional)"
  },
  services: {
    label: "What do you need?",
    options: ["Website", "Landing Page", "Mobile app", "Partnership", "Other"],
    other: {
      option: "Other",
      placeholder: "Tell me what you need"
    }
  },
  budget: {
    label: "Budget",
    options: ["Under $500", "$500 to $1k", "$1k to $2.5k", "$2.5k+"]
  },
  brief: {
    option: "Project brief",
    title: "What are you building?",
    lead: "Share a link or a few screenshots and I'll reply with a plan",
    shots: {
      label: "Screenshots or a link",
      add: "Add screenshots",
      hint: "Drop, paste or pick up to 4 images",
      remove: "Remove screenshot",
      more: "Add another screenshot",
      drop: "Drop to add screenshots",
      limit: "Up to 4 images"
    },
    link: "Link to your project",
    reach: "Where to reach you",
    contact: "Email, X or Telegram",
    sent: {
      title: "Got it, thanks!",
      text: "I'll take a look and reply within a day"
    },
    bigger: ["Need a full project instead?", "Start a project"] as const
  },
  submit: "Send request",
  sending: "Sending",
  sent: {
    title: "Thanks, {name}!",
    text: "Your request is in. I usually reply within a day"
  },
  failed: "Couldn't send it. Try again or message me on X",
  limited: "Too many requests. Try again later or message me on X"
};

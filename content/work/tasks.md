---
eyebrow: Google Tasks
title: Bringing flexible organization to Google Tasks
role: Product Designer, UX Researcher
team: Solo
duration: 7 Weeks
status: Self-directed concept
tools: Figma, Gemini AI, ChatGPT, Claude AI, Google Workspace
year: 2025
presentation: https://www.figma.com/deck/ihtL1gaT0U4N2ZBRXdRAOl/Zarah-Yaqub---Project-3?node-id=108-559
order: 4
tags: ["Productivity", "Product"]
cover: ../assets/media/covers/tasks-cover.png
hero: "1184451152"
heroType: vimeo
---

## About the Project

Google Tasks is the simplest task app Google makes, and the first one people outgrow. This project asked how it could hold more of real life without losing the lightness that makes people reach for it in the first place.

The answer wasn't more features. It was organization that bends to the day you're having, built entirely from patterns Google users already know. Over seven weeks I ran interviews, competitor and app audits, and two rounds of testing to design a way to group, sort, and move tasks that feels discovered rather than learned.

## Problem Space

[deck] People capture tasks in Tasks quickly, but the app offers almost no way to organize them afterward.

Sorting is limited, lists don't talk to each other, and there's no way to see the same tasks a different way on a different day.

I ran four user interviews, audited two competitors and four Google apps, and tested two prototype rounds with five participants, designing a flexible sorting and organizational system that feels native to Google.

[image:../assets/media/tasks/tasks-problem-space.png Google Tasks today: capture, lists, sorting, and onboarding across the app flush]

## Solution

[deck] Instead of an overhaul, I introduced small, meaningful changes that kept the user at the forefront.

Google Tasks doesn't need more features. It needs the ones it has to be findable, flexible, and consistent with the rest of the Google ecosystem.

Rather than adding tags, projects, or a new taxonomy users would have to learn, I borrowed patterns they already knew: a top-left menu, a bottom-right "+", and a sort panel that behaves like Gmail's. Familiar structure, expanded capability.

The core change is that organization became a lens, not a commitment. Users can sort by date, list, or creation time, switching views without ever restructuring the tasks underneath.

[figure:../assets/media/tasks/tasks-solution-consistency.png | Design consistency: navigation moves to the top-left and the add button to the bottom-right, matching the rest of the Google app family.]

[image:../assets/media/tasks/tasks-solution-2.png The existing Google Calendar and Gmail UI beside the redesigned Tasks flush]

[image:../assets/media/tasks/tasks-solution-3.png My Tasks becomes Tasks: before and after flush]

[image:../assets/media/tasks/tasks-solution-4.png The same tasks organized by list, then by due date flush]

## Design Documentation

[deck] Beyond the screens, I documented how the organization actually behaves.

The interaction specs cover the moments a static mockup can't show:

- Moving a Task from one list to another
- Swiping to complete a task

[vimeo:1209358148 tasks-design doc 2 685x804 background]
[vimeo:1209354864 tasks-design doc 1 685x804 background]

## Process

[deck] What I needed to know

How do people actually organize their to-dos? Where does Google Tasks stop being useful? And what makes an organizational feature feel native to Google rather than bolted on?

I conducted two stages of user interviews, a competitor audit and employed secondary research to better understand the problem.

## Interviews

[deck] I wanted to know where the app stopped and their brain took over.

I interviewed four people aged 22–25 across Google Tasks, Notion, and Apple Reminders, students and early professionals juggling coursework and work tasks. Not just what they clicked, but what they were holding in their head while they clicked it.

## Key Findings

[deck] Capture is solved. Deciding what to do next isn't.

[card: Capture is instant | Users reach for the app to get a task out of their head, fast.]
[card: Planning is mental | Prioritizing and sequencing happens in their head, not in the app.]
[card: No next step | No participant felt the app actively helped them decide what to do next.]

## Competitor Audit

[deck] One app buries organization. The other front-loads it.

I audited two apps to see how each solved for organization:

**Apple Reminders:** offers multiple views and tags, but buries them. Powerful, hidden, confusing.

**TickTick:** offers extensive grouping and sorting, but front-loads it: long onboarding, too many features at once, overwhelming.

[image:../assets/media/tasks/tasks-audit-overview.png Competitor audit: Apple Reminders' many views and tags for organization flush]

[image:../assets/media/tasks/tasks-audit-reminders.png Competitor audit: annotated teardown of Apple Reminders flush]

[image:../assets/media/tasks/tasks-audit-2.png Competitor audit: annotated teardown of TickTick flush]

[image:../assets/media/tasks/tasks-audit-3.png Competitor audit: TickTick grouping and sorting options flush]

## Ideation & Testing

[deck] My first direction asked users to decide up front. It failed immediately.

I put organization in onboarding: ask people how they wanted their tasks structured, then build the app around that answer. It seemed efficient.

Organization can't be a one-time decision. It has to be an ongoing, low-friction action, and it has to live somewhere users already know to look.

[image:../assets/media/tasks/tasks-ideation.png The onboarding-first direction, with tester feedback that it felt unnatural flush]

## Auditing Existing Apps

[deck] If the feature had to feel native, I needed to know what "native" meant.

I audited Gmail, Google Calendar, and Google Keep and found consistent patterns: a top-left menu, a bottom-right add button, and a sort panel that behaves the same way everywhere.

[image:../assets/media/tasks/tasks-auditing-apps.png Auditing Gmail and Google Calendar for shared organizational patterns flush]

## Testing

[deck] Does the pattern hold for people who aren't students?

I tested the revised sort menu with two participants outside my original demographic, Aisha (29, mother, Reminders + Siri) and Shazia (56, working professional, Google Keep), to check whether the pattern held for people who weren't students. I asked them what sorting options they'd actually want, rather than validating a list I'd already written.

[image:../assets/media/tasks/tasks-testing-findings.png Testing findings flush]
[vimeo:1209340976 Tasks sort menu 685x804 background]

## Reflection

[deck] Consistency turned out to be a feature, not a constraint.

I first treated "make it look like Google" as a restriction, until auditing Gmail, Calendar, and Keep flipped it. The existing pattern was free discoverability. Users already knew where to look; Tasks just wasn't putting anything there.

[quote: My most useful decision was my least original one.]

I also designed a setting when I should have designed a behavior. Asking users to configure their organization up front is tidy, and wrong. Organization isn't a decision made once, it's something people redo constantly, differently, without much thought.

Next time, I'd audit the design system before wireframing rather than spending a testing round to learn my screens didn't feel like Google.

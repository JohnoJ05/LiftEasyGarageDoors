#!/usr/bin/env python3
"""Lift Easy: build the town pages (garage-door-repairs-<town>.html).

Each page reuses the Areas page's header, footer, phone menu and sticky call
bar, and swaps in that town's own content from TOWNS below. Run it from the
repo root after editing TOWNS:

    python3 tools/town_pages.py

Every town needs its own intro and local paragraph. Pages that only swap the
town name are treated by Google as doorway pages, so don't copy them across.
Reviews must be real, copied word for word from Google. Leave "review" out
if there isn't one for that town.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://lifteasygaragedoors.co.uk/'
WA = 'https://wa.me/447939500544?text='

TOWNS = [
    {
        'name': 'Northallerton',
        'slug': 'northallerton',
        'county': 'North Yorkshire',
        'travel': 'Steve’s home base',
        'intro': 'Northallerton is where Steve is based, so if your garage door is stuck, noisy or won’t close, he’s usually only a few minutes away. Most repairs are done the same day, in one visit, with the parts on the van.',
        'local': 'Around Northallerton you’ll find everything from older up-and-over doors on the established streets around the town centre and Romanby, to electric sectional and roller doors on the newer estates to the north of town. Steve works on all of them, and as it’s his own patch, he’s often able to fit in a quick look between jobs.',
        'villages': ['Romanby', 'Brompton', 'Yafforth', 'Ainderby Steeple', 'Morton-on-Swale', 'North Otterington', 'Thornton-le-Beans', 'Osmotherley', 'East Cowton', 'Great Smeaton'],
        'neighbours': ['thirsk', 'bedale', 'richmond', 'stokesley'],
    },
]

PHONE_SVG = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"></path></svg>'
TICK = '<svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="#FF3B3B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 4px"><path d="M2 7.5 L6 11.5 L14 2.5"></path></svg>'

# The common repairs, each with three wordings so the pages don't all read the same
REPAIRS = [
    ('Springs and cables', [
        'Snapped springs and frayed or tangled cables are the most common reason a door won’t lift. Steve replaces them in pairs so the door stays balanced.',
        'If you heard a bang and now the door feels far too heavy, a spring has probably gone. Steve carries springs and cables for the common makes.',
        'Broken springs and slipped cables stop a door dead. They’re under a lot of tension, so they’re a job for Steve rather than a DIY fix.',
    ]),
    ('Rollers, tracks and hinges', [
        'Worn rollers and bent tracks make a door noisy, jerky or stick halfway. A clean, adjust and new rollers usually sorts it.',
        'Grinding, squealing or a door that jumps as it moves usually means tired rollers or a track out of line, a quick fix on the day.',
        'If your door sticks or scrapes, the tracks, hinges and rollers are the first thing Steve checks and puts right.',
    ]),
    ('Locks and handles', [
        'Handles that spin, locks that won’t turn and broken lock cables are all repaired or replaced on the spot.',
        'Can’t lock the door, or the handle has gone loose? Steve fixes or swaps locks, handles and the cables behind them.',
        'A garage that won’t lock is a worry. Steve repairs and replaces locks, handles and lock cables on all the common doors.',
    ]),
    ('Remotes and motors', [
        'New or replacement remotes programmed on the day, plus repairs to electric openers that hum but won’t move.',
        'Remote stopped working, or the motor runs but the door doesn’t? Steve repairs openers and programs new remotes.',
        'From a lost remote to an opener that has given up, Steve gets electric doors working again, or supplies and fits a new system.',
    ]),
    ('Up-and-over doors', [
        'The classic single-panel door. Steve fixes worn cones, springs, cables and arms, and gets heavy doors lifting easily again.',
        'Up-and-over doors that have gone heavy, stiff or lopsided usually just need new parts and a proper adjustment.',
        'Most up-and-over doors can be put right for far less than a replacement. Steve has worked on them for over 30 years.',
    ]),
    ('Sectional and roller doors', [
        'Panels out of line, broken springs or a roller door that won’t wind up: Steve repairs both types, manual and electric.',
        'Sectional and roller doors need a specialist eye. Steve repairs the springs, cables, slats and motors that go wrong.',
        'If your sectional door is crooked or your roller door is stuck, Steve can usually repair it rather than replace it.',
    ]),
]

H = html.escape


def page_name(slug):
    return f'garage-door-repairs-{slug}.html'


def buttons_d(t):
    msg = WA + 'Hi%20Steve%2C%20here%27s%20a%20photo%20of%20my%20garage%20door.'
    return f'''<div style="margin-top: 36px; display: flex; flex-wrap: wrap; gap: 12px">
<a href="tel:07939500544" style="display: flex; align-items: center; gap: 18px; background: #D7141A; color: #ffffff; padding: 0 28px 0 22px; min-height: 76px; box-sizing: border-box">
{PHONE_SVG.format(s=26, c="#111111")}
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 800; font-stretch: 125%; letter-spacing: 1.6px">CALL OR WHATSAPP STEVE</span><span style="font-size: 30px; font-weight: 800; font-stretch: 105%; line-height: 1">07939 500544</span></span>
</a>
<a href="{msg}" style="display: flex; align-items: center; gap: 16px; border: 2px solid #ffffff; color: #ffffff; padding: 0 22px; min-height: 76px; box-sizing: border-box; font-size: 14px; font-weight: 800; font-stretch: 115%; letter-spacing: 1.6px">SEND STEVE A PHOTO</a>
</div>'''


def facts(t):
    rows = [
        ('From Northallerton', t['travel']),
        ('Call-out fee', 'None. If Steve can’t fix it, there’s no charge.'),
        ('Hours', 'Calls 7am–8pm, every day'),
        ('Repairs', 'Same day where possible, all common makes'),
    ]
    return ''.join(f'<div style="padding: 16px 0; border-bottom: 1px solid #333333"><div style="font-size: 12px; font-weight: 800; letter-spacing: 1.6px; font-stretch: 125%; color: #999999">{H(a.upper())}</div><div style="margin-top: 6px; font-size: 18px; font-weight: 700">{H(b)}</div></div>' for a, b in rows)


def repairs(i, size):
    out = []
    for k, (title, texts) in enumerate(REPAIRS):
        out.append(f'<div style="padding: {"28px 26px 32px" if size == "d" else "18px 16px 20px"}; background: #ffffff; border: 2px solid #111111"><div aria-hidden="true" style="width: 28px; height: 4px; background: #D7141A"></div><h3 style="margin: 12px 0 0; font-size: {"21px" if size == "d" else "18px"}; font-weight: 800; font-stretch: 105%">{H(title)}</h3><p style="margin: 8px 0 0; font-size: {"16px" if size == "d" else "15px"}; line-height: 1.55; color: #222222">{H(texts[(k + i) % 3])}</p></div>')
    return '\n'.join(out)


def chips(items, fs):
    return ''.join(f'<li style="border: 1.5px solid #111111; background: #ffffff; padding: 6px 10px; font-size: {fs}px; font-weight: 700; line-height: 1.2">{H(v)}</li>' for v in items)


def review_block(t, size):
    r = t.get('review')
    if not r:
        return ''
    who = H(r['name']) + (f', {H(r["town"])}' if r.get('town') else '')
    return f'''<figure style="margin: {"40px 0 0" if size == "d" else "24px 0 0"}; padding: {"28px 30px" if size == "d" else "18px 16px"}; background: #111111; color: #ffffff; border-left: 6px solid #FFD401">
<div aria-label="{r["stars"]} out of 5 stars" style="color: #FFD401; font-size: 20px; letter-spacing: 2px">{"★" * r["stars"]}</div>
<blockquote style="margin: 10px 0 0; font-size: {"20px" if size == "d" else "16px"}; line-height: 1.5">“{H(r["text"])}”</blockquote>
<figcaption style="margin-top: 12px; font-size: 14px; font-weight: 800; color: #dddddd">{who} · Google review</figcaption>
</figure>'''


def links(t, made, size):
    near = [n for n in t['neighbours'] if n in made]
    items = [('servicing.html', 'Garage door servicing'), ('remotes.html', 'Remotes and automatic doors'), ('contact.html', 'Contact Steve')]
    items += [(page_name(n), f'Garage door repairs in {made[n]}') for n in near]
    items.append(('areas.html', 'All the areas Steve covers'))
    fs = 17 if size == 'd' else 15
    return ''.join(f'<li><a href="{h}" style="display: flex; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid #d6d6d6; font-size: {fs}px; font-weight: 800; color: #111111">{H(l)}<span aria-hidden="true" style="color: #D7141A">→</span></a></li>' for h, l in items)


def desktop(t, i, made):
    n = H(t['name'])
    return f'''<!-- ===== Hero ===== -->
<section style="background: #111111; padding: 90px 0 100px">
<div class="ar-two" style="max-width: 1180px; margin: 0 auto; padding: 0 40px; box-sizing: border-box; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px 64px; align-items: start">
<div>
<nav aria-label="Breadcrumb" style="font-size: 13px; font-weight: 800; font-stretch: 125%; letter-spacing: 2px; color: #cccccc"><a href="index.html" style="color: #cccccc">HOME</a> <span aria-hidden="true">/</span> <a href="areas.html" style="color: #cccccc">AREAS</a> <span aria-hidden="true">/</span> <span style="color: #FF3B3B">{n.upper()}</span></nav>
<h1 class="ar-h1" style="margin: 30px 0 0; overflow-wrap: anywhere; font-size: min(44px, 4.1vw); font-weight: 900; font-stretch: 112%; line-height: 0.95; letter-spacing: -2px; text-transform: uppercase"><span style="display: block">Garage door repairs</span><span style="display: block; color: #FF3B3B">in {n}</span></h1>
<p style="margin: 30px 0 0; font-size: 21px; line-height: 1.45; color: #e8e8e8; max-width: 520px">{H(t["intro"])}</p>
{buttons_d(t)}
</div>
<div style="background: #1a1a1a; border: 1px solid #333333; border-top: 6px solid #D7141A; padding: 8px 28px 12px">{facts(t)}</div>
</div>
</section>

<!-- ===== 01 Repairs ===== -->
<section style="background: #f2f2f2; color: #111111; padding: 100px 0 100px">
<div style="max-width: 1180px; margin: 0 auto; padding: 0 40px; box-sizing: border-box">
<div style="font-size: 13px; font-weight: 800; letter-spacing: 2px; font-stretch: 125%; color: #555555">01 - COMMON REPAIRS</div>
<h2 class="ar-h2" style="margin: 14px 0 0; font-size: 50px; font-weight: 800; font-stretch: 108%; line-height: 1.02; letter-spacing: -1.4px">What Steve fixes in {n}</h2>
<div class="ar-three" style="margin-top: 36px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
{repairs(i, "d")}
</div>
</div>
</section>

<!-- ===== 02 Local ===== -->
<section style="background: #ffffff; color: #111111; padding: 100px 0 100px; border-top: 2px solid #111111">
<div class="ar-two" style="max-width: 1180px; margin: 0 auto; padding: 0 40px; box-sizing: border-box; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px 64px; align-items: start">
<div>
<div style="font-size: 13px; font-weight: 800; letter-spacing: 2px; font-stretch: 125%; color: #555555">02 - LOCAL TO YOU</div>
<h2 class="ar-h2" style="margin: 14px 0 0; font-size: 44px; font-weight: 800; font-stretch: 108%; line-height: 1.05; letter-spacing: -1.2px">{n} and the villages around it</h2>
<p style="margin: 20px 0 0; font-size: 18px; line-height: 1.6">{H(t["local"])}</p>
<ul aria-label="Villages near {n}" style="list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px">{chips(t["villages"], 15)}</ul>
{review_block(t, "d")}
</div>
<div>
<div style="font-size: 13px; font-weight: 800; letter-spacing: 2px; font-stretch: 125%; color: #555555">MORE FROM LIFT EASY</div>
<ul style="list-style: none; margin: 14px 0 0; padding: 0; border-top: 2px solid #111111">{links(t, made, "d")}</ul>
</div>
</div>
</section>

'''


def phone(t, i, made):
    n = H(t['name'])
    msg = WA + 'Hi%20Steve%2C%20here%27s%20a%20photo%20of%20my%20garage%20door.'
    return f'''<!-- Hero -->
<section style="background: #111111; padding: 28px 20px 32px">
<nav aria-label="Breadcrumb" style="font-size: 11px; font-weight: 800; font-stretch: 125%; letter-spacing: 1.8px; color: #cccccc"><a href="index.html">HOME</a> / <a href="areas.html">AREAS</a> / <span style="color: #FF3B3B">{n.upper()}</span></nav>
<h1 style="margin: 16px 0 0; overflow-wrap: anywhere; font-size: clamp(28px, 8.4vw, 40px); font-weight: 900; font-stretch: 112%; line-height: 0.95; letter-spacing: -1.2px; text-transform: uppercase">Garage door repairs <span style="color: #FF3B3B">in {n}</span></h1>
<p style="margin: 16px 0 0; font-size: 16px; line-height: 1.5; color: #e6e6e6">{H(t["intro"])}</p>
<a href="tel:07939500544" style="margin-top: 20px; display: flex; align-items: center; gap: 14px; background: #D7141A; color: #ffffff; padding: 14px 18px">{PHONE_SVG.format(s=24, c="#111111")}<span style="display: flex; flex-direction: column"><span style="font-size: 11px; font-weight: 800; font-stretch: 125%; letter-spacing: 1.4px">CALL OR WHATSAPP STEVE</span><span style="font-size: 28px; font-weight: 800; font-stretch: 105%; line-height: 1.05">07939 500544</span></span></a>
<a href="{msg}" style="margin-top: 10px; min-height: 52px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; font-size: 14px; font-weight: 800; font-stretch: 115%; letter-spacing: 1.4px">SEND STEVE A PHOTO</a>
<ul style="list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; font-size: 15px; color: #dddddd">
<li style="display: flex; gap: 10px">{TICK}<span><strong style="color: #ffffff">{H(t["travel"])}</strong>{" from Northallerton" if t["travel"].startswith("about") else ""}</span></li>
<li style="display: flex; gap: 10px">{TICK}<span><strong style="color: #ffffff">No call-out fee.</strong> If Steve can’t fix it, there’s no charge.</span></li>
<li style="display: flex; gap: 10px">{TICK}<span>Calls 7am–8pm, every day</span></li>
</ul>
</section>

<!-- Repairs -->
<section style="background: #f2f2f2; color: #111111; padding: 34px 20px 36px">
<div style="font-size: 11px; font-weight: 800; letter-spacing: 1.8px; font-stretch: 125%; color: #555555">01 - COMMON REPAIRS</div>
<h2 style="margin: 10px 0 0; font-size: 28px; font-weight: 800; font-stretch: 108%; line-height: 1.05; letter-spacing: -0.6px">What Steve fixes in {n}</h2>
<div style="margin-top: 18px; display: flex; flex-direction: column; gap: 10px">
{repairs(i, "m")}
</div>
</section>

<!-- Local -->
<section style="background: #ffffff; color: #111111; padding: 34px 20px 36px; border-top: 2px solid #111111">
<div style="font-size: 11px; font-weight: 800; letter-spacing: 1.8px; font-stretch: 125%; color: #555555">02 - LOCAL TO YOU</div>
<h2 style="margin: 10px 0 0; font-size: 26px; font-weight: 800; font-stretch: 108%; line-height: 1.08">{n} and the villages around it</h2>
<p style="margin: 12px 0 0; font-size: 15px; line-height: 1.55">{H(t["local"])}</p>
<ul aria-label="Villages near {n}" style="list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px">{chips(t["villages"], 14)}</ul>
{review_block(t, "m")}
<ul style="list-style: none; margin: 26px 0 0; padding: 0; border-top: 2px solid #111111">{links(t, made, "m")}</ul>
</section>

'''


def jsonld(t):
    d = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'serviceType': 'Garage door repair',
        'name': f'Garage door repairs in {t["name"]}',
        'url': SITE + page_name(t['slug']),
        'provider': {'@id': SITE + '#business'},
        'areaServed': {'@type': 'City', 'name': t['name'], 'containedInPlace': {'@type': 'AdministrativeArea', 'name': t['county']}},
    }
    return '<script type="application/ld+json">\n' + json.dumps(d, indent=2, ensure_ascii=False) + '\n</script>\n'


def cut(s, start, end, new):
    a = s.index(start)
    b = s.index(end, a)
    return s[:a] + new + s[b:]


def build(t, i, made):
    s = (ROOT / 'areas.html').read_text()
    n, url = t['name'], SITE + page_name(t['slug'])
    title = f'Garage Door Repairs {n} | Lift Easy Garage Doors'
    desc = f'Garage door repairs and servicing in {n} and nearby villages. No call-out fee, same-day repairs where possible. Call or WhatsApp Steve on 07939 500544.'
    s = re.sub(r'<title>.*?</title>', f'<title>{H(title)}</title>', s, count=1)
    s = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + H(desc), s, count=1)
    s = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + H(desc), s, count=1)
    s = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + H(title), s, count=1)
    s = s.replace(SITE + 'areas.html', url)
    s = s.replace('</head>', jsonld(t) + '</head>', 1)
    # Desktop body, then phone body
    s = cut(s, '<!-- ===== Hero ===== -->', '<!-- ===== CTA ===== -->', desktop(t, i, made))
    s = cut(s, '<!-- Hero -->', '<!-- CTA -->', phone(t, i, made))
    # Phone view: only the menu is interactive here
    s = s.replace('<script src="js/map.js?v=11"></script>\n', '')
    s = cut(s, '  renderVals() {', 'return Component;', '''  renderVals() {
    return {
      menuOpen: this.state.menuOpen,
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen })
    };
  }
}
''')
    s = s.replace('this.state = { menuOpen: false, region: 0 };', 'this.state = { menuOpen: false };')
    assert 'data-area-spin' not in s and 'map.js' not in s and '{{ region' not in s
    (ROOT / page_name(t['slug'])).write_text(s)
    return page_name(t['slug'])


if __name__ == '__main__':
    made = {t['slug']: t['name'] for t in TOWNS}
    for i, t in enumerate(TOWNS):
        print('wrote', build(t, i, made))

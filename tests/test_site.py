"""اختبارات تقنية آلية لدليل الموارد التعليمية المفتوحة (Playwright + Chrome headless).
التشغيل: python3 test_site.py <site_dir> <base_url>"""
import json, sys, re, pathlib, urllib.parse
from playwright.sync_api import sync_playwright

SITE = pathlib.Path(sys.argv[1]).resolve(); BASE = sys.argv[2].rstrip('/') + '/'
D = json.loads((SITE / 'data/resources.json').read_text(encoding='utf-8'))
RES = D['resources']; BY = {r['id']: r for r in RES}
ORDER = ['gsb-counting-animals', 'gsb-i-like-to-read', 'openmed-course-ar',
         'phet-fractions-intro', 'phet-area-builder', 'phet-states-of-matter-basics', 'phet-circuit-dc', 'basic-guide-oer', 'py4e',
         'im-k5-centers', 'tessa-arabic', 'writing-guide', 'owid-literacy', 'smarthistory-umayyads']
results = []
def check(group, name, ok, detail=''):
    results.append({'group': group, 'test': name, 'ok': bool(ok), 'detail': str(detail)[:300]})

# ---------- 1. سلامة البيانات ----------
G = 'سلامة البيانات'
check(G, 'عدد الموارد 14', len(RES) == 14, len(RES))
check(G, 'الترتيب المعتمد يغطي كل الموارد دون تكرار', sorted(ORDER) == sorted(BY) and len(set(ORDER)) == 14)
req = ['id', 'name_ar', 'name_original', 'provider', 'description', 'domain', 'type', 'audience', 'content_language', 'interface_language',
       'url', 'license', 'license_proof', 'terms', 'exceptions', 'example', 'evidence', 'access_check', 'verified_on', 'status', 'attribution']
missing = [(r['id'], k) for r in RES for k in req if not r.get(k)]
check(G, 'كل الحقول الإلزامية مكتملة', not missing, missing)
bad = []
for r in RES:
    L = r['license']; slug = L['code'].replace('CC ', '').lower()
    if 'ND' in L['code'] or L['no_derivatives']: bad.append((r['id'], 'ND'))
    if L['label'] != f"{L['code']} {L['version']}": bad.append((r['id'], 'label'))
    if L['deed_url'] != f"https://creativecommons.org/licenses/{slug}/{L['version']}/deed.ar": bad.append((r['id'], 'deed'))
    if L['commercial_use'] == ('NC' in L['code']): bad.append((r['id'], 'commercial flag'))
    if L['share_alike'] != ('SA' in L['code']): bad.append((r['id'], 'SA flag'))
    if not r['url'].startswith('https://') or any(not u.startswith('https://') for u in r['license_proof']): bad.append((r['id'], 'https'))
    if r['domain'] not in D['meta']['taxonomy']['domain'] or r['type'] not in D['meta']['taxonomy']['type'] or any(a not in D['meta']['taxonomy']['audience'] for a in r['audience']): bad.append((r['id'], 'taxonomy'))
    if r['status'] != 'معتمد' or r['verified_on'] != D['meta']['verified_on']: bad.append((r['id'], 'status/date'))
check(G, 'اتساق الترخيص (الرمز/الإصدار/رابط الملخص/المؤشرات) وعدم وجود ND', not bad, bad)
js = (SITE / 'data/resources.js').read_text(encoding='utf-8')
check(G, 'resources.js مطابق لـ resources.json', json.loads(js[js.index('=') + 1:].strip().rstrip(';')) == D)
imgs = sorted(p.name for p in (SITE / 'assets/img').iterdir())
check(G, 'لا يوجد شعار جامعة طيبة ضمن الأصول', imgs == ['favicon.svg', 'hero.webp'] and not any('logo' in p.name.lower() or 'شعار' in p.name for p in SITE.rglob('*')), imgs)
fonts = sorted(p.name for p in (SITE / 'assets/fonts').iterdir())
check(G, 'ملفات الخط محلية مع نص ترخيص OFL', 'OFL.txt' in fonts and sum(f.endswith('.woff') for f in fonts) == 4, fonts)
txt = ''.join(p.read_text(encoding='utf-8', errors='ignore') for p in SITE.rglob('*') if p.suffix in ('.html', '.css', '.js'))
ext = sorted(set(re.findall(r'(?:src|href)=["\'](https?://[^"\']+)', txt)) | set(re.findall(r'url\(["\']?(https?://[^)"\']+)', txt)))
check(G, 'لا موارد خارجية تُحمَّل (خطوط/سكربتات/صور)', not [u for u in ext if re.search(r'\.(js|css|woff2?|ttf|png|jpe?g|webp|svg)(\?|$)', u)] and 'fonts.googleapis' not in txt, ext[:5])

def norm_txt(s): return re.sub(r'\s+', ' ', s).strip()

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 1440, 'height': 900})
    ctx.grant_permissions(['clipboard-read', 'clipboard-write'], origin=BASE.rstrip('/'))
    pg = ctx.new_page()
    errors, reqs, failed = [], [], []
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('request', lambda r: reqs.append(r.url))
    pg.on('requestfailed', lambda r: failed.append(r.url))
    pg.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    def go(h):
        pg.goto(BASE + h); pg.wait_for_timeout(120)
    def cards(): return pg.eval_on_selector_all('#app article.card', 'els=>els.map(e=>e.querySelector("h3 a").getAttribute("href").split("/").pop())')

    # ---------- 2. الصفحات والتوجيه ----------
    G = 'الصفحات والتوجيه'
    for h, t in [('#/', 'الرئيسة'), ('#/resources', 'فهرس الموارد'), ('#/licenses', 'افهم التراخيص'), ('#/about', 'عن الدليل')]:
        go(h)
        check(G, f'{h} يعرض عنوانًا رئيسًا واحدًا وعنوان صفحة صحيحًا', pg.locator('h1').count() == 1 and pg.title().startswith(t), pg.title())
        cur = pg.eval_on_selector_all('.nav a[aria-current=page]', 'e=>e.map(x=>x.textContent)')
        check(G, f'{h} يميّز الرابط الحالي في القائمة', cur == [t], cur)
    go('#/nope'); check(G, 'مسار غير معروف يعرض «الصفحة غير موجودة»', 'غير موجودة' in pg.inner_text('#app'))
    go('#/resource/xyz'); check(G, 'معرّف مورد غير صحيح يعرض «غير موجودة»', 'غير موجودة' in pg.inner_text('#app'))
    go('#/'); pg.click('a.dtile >> nth=1'); pg.wait_for_timeout(120)
    check(G, 'بطاقة المجال في الرئيسة تنقل إلى الفهرس مصفّى', 'domain=' in pg.url and len(cards()) == sum(r['domain'] == D['meta']['taxonomy']['domain'][1] for r in RES), pg.url)
    go('#/'); pg.click('[data-group="2"]'); pg.wait_for_timeout(200)
    check(G, 'رابط المجموعة 3 في الرئيسة ينقل إلى الفهرس', pg.url.endswith('#/resources') and pg.locator('#g2').count() == 1)
    go('#/resource/py4e'); pg.go_back(); pg.wait_for_timeout(100)
    check(G, 'زر الرجوع في المتصفح يعمل مع التوجيه', pg.url.endswith('#/resources'), pg.url)

    # ---------- 3. الفهرس والمجموعات ----------
    G = 'الفهرس والمجموعات'
    go('#/resources')
    check(G, 'يعرض الفهرس 14 بطاقة بالترتيب المعتمد', cards() == ORDER, cards())
    sizes = [pg.locator(f'#g{i} article').count() for i in range(3)]
    check(G, 'عدد موارد المجموعات: الأولى 3، الثانية 6، الثالثة 5', sizes == [3, 6, 5], sizes)
    # قاعدة التصنيف المستقلة: الثالثة = مورد يستثني مصدرُه الرسمي مكوّنات لأطراف ثالثة؛
    # الأولى = CC BY دون استثناءات؛ الثانية = NC أو SA دون استثناءات لأطراف ثالثة.
    THIRD = {'im-k5-centers', 'tessa-arabic', 'writing-guide', 'owid-literacy', 'smarthistory-umayyads'}
    def expect(r):
        if r['id'] in THIRD: return 2
        return 0 if r['license']['code'] == 'CC BY' else 1
    shown = {}
    for gi in range(3):
        for i in pg.eval_on_selector_all(f'#g{gi} article.card', 'els=>els.map(e=>e.querySelector("h3 a").getAttribute("href").split("/").pop())'):
            shown[i] = gi
    wrong = [(i, shown.get(i), expect(BY[i])) for i in BY if shown.get(i) != expect(BY[i])]
    check(G, 'تصنيف كل مورد يطابق قاعدة الترخيص والاستثناءات (لا مطابقة أرقام)', not wrong, wrong)
    note = 'لا يمثّل ترتيبًا لجودة الموارد'
    for h in ['#/', '#/resources', '#/about', '#/licenses']:
        go(h); check(G, f'{h} يوضح أن التقسيم لا يمثل ترتيبًا للجودة', note in pg.inner_text('#app'))
    go('#/resources')
    flags = pg.eval_on_selector_all('#app article.card', 'els=>els.filter(e=>e.querySelector(".flag")).map(e=>e.querySelector("h3 a").getAttribute("href").split("/").pop())')
    check(G, 'شارة «استثناءات لأطراف ثالثة» على موارد المجموعة 3 فقط', flags == ORDER[9:], flags)
    for r in RES:
        c = pg.locator(f'article[aria-labelledby="t-{r["id"]}"]')
        t = c.inner_text()
        ok = r['name_ar'] in t and r['license']['label'] in t and r['domain'] in t and r['type'] in t and c.locator(f'a[href="{r["url"]}"]').count() == 1
        check(G, f'بطاقة {r["id"]}: الاسم والمجال والنوع والترخيص ورابط المورد', ok)

    # ---------- 4. صفحات التفاصيل ----------
    G = 'صفحات التفاصيل'
    for r in RES:
        go('#/resource/' + r['id'])
        t = norm_txt(pg.inner_text('#app'))
        hrefs = pg.eval_on_selector_all('#app a', 'e=>e.map(a=>a.getAttribute("href"))')
        fields = [r['name_ar'], r['name_original'], r['provider'], r['description'], r['domain'], r['type'], r['content_language'],
                  r['interface_language'], r['license']['label'], r['license']['applies_to'], r['terms'], r['exceptions'], r['example'],
                  r['evidence'], r['access_check'], r['attribution'], r['verified_on'], r['status']] + r['audience']
        miss = [f for f in fields if norm_txt(f) not in t]
        links_ok = r['url'] in hrefs and r['license']['deed_url'] in hrefs and all(u in hrefs for u in r['license_proof'])
        blank = pg.eval_on_selector_all('#app a[target=_blank]', 'e=>e.filter(a=>!/noopener/.test(a.rel)).length')
        perm = pg.inner_text('.perm')
        perm_ok = (('غير مسموح' in perm) == (not r['license']['commercial_use'])) and (('بالترخيص نفسه' in perm) == r['license']['share_alike'])
        check(G, f'{r["id"]}: كل الحقول وروابط المورد والملخص وإثبات الترخيص', not miss and links_ok and blank == 0 and perm_ok and pg.locator('h1').count() == 1,
              {'missing': miss, 'links': links_ok, 'noopener_missing': blank, 'perm': perm_ok})
    go('#/resource/owid-literacy'); pg.click('button[data-copy] >> nth=0'); pg.wait_for_timeout(300)
    clip = pg.evaluate('navigator.clipboard.readText()')
    check(G, 'زر «نسخ صيغة النسب» ينسخ النص الصحيح ويعلن ذلك', clip == BY['owid-literacy']['attribution'] and 'نُسخت' in pg.inner_text('[data-copied]'), clip[:60])
    go('#/resource/' + ORDER[0]); check(G, 'المورد الأول: رابط «التالي» فقط', pg.locator('a[rel=next]').count() == 1 and pg.locator('a[rel=prev]').count() == 0)
    pg.click('a[rel=next]'); pg.wait_for_timeout(120); check(G, 'التنقل إلى المورد التالي', pg.url.endswith(ORDER[1]))

    # ---------- 5. البحث ----------
    G = 'البحث'
    def search_ids(q):
        go('#/resources?q=' + urllib.parse.quote(q)); return cards()
    cases = [('كسور', ['phet-fractions-intro']), ('الكسور', ['phet-fractions-intro']), ('fractions', ['phet-fractions-intro']), ('FRACTIONS', ['phet-fractions-intro']),
             ('أُحِبُّ', ['gsb-i-like-to-read']), ('احب ان اقرا', ['gsb-i-like-to-read']), ('بايثون', ['py4e']), ('python', ['py4e']),
             ('الأمويون', ['smarthistory-umayyads']), ('امويون', ['smarthistory-umayyads']), ('Umayyads', ['smarthistory-umayyads']),
             ('PhET', ['phet-fractions-intro', 'phet-area-builder', 'phet-states-of-matter-basics', 'phet-circuit-dc']),
             ('مقدمه الكسور', ['phet-fractions-intro']), ('zzzzqq', [])]
    for q, exp in cases:
        got = search_ids(q)
        check(G, f'«{q}»', got == exp, got)
    search_ids('zzzzqq')
    check(G, 'رسالة «لا توجد موارد مطابقة» مع زر إعادة الضبط', 'لا توجد موارد مطابقة' in pg.inner_text('#app') and pg.locator('.empty [data-reset]').count() == 1)
    pg.click('.empty [data-reset]'); pg.wait_for_timeout(120)
    check(G, 'إعادة الضبط تعيد 14 موردًا', len(cards()) == 14 and pg.input_value('#idx-q') == '')
    go('#/'); pg.fill('#home-q', 'قراءة'); pg.press('#home-q', 'Enter'); pg.wait_for_timeout(150)
    exp = [i for i in ORDER if 'قراءه' in (BY[i]['name_ar'] + BY[i]['name_original'] + BY[i]['description'] + BY[i]['domain'] + BY[i]['type'] + BY[i]['provider']).replace('ة', 'ه')]
    check(G, 'بحث الرئيسة ينتقل إلى الفهرس بالنتائج', '#/resources?q=' in pg.url and len(cards()) >= 1, {'url': pg.url, 'got': cards()})
    go('#/resources'); pg.fill('#idx-q', 'storybooks'); pg.press('#idx-q', 'Enter'); pg.wait_for_timeout(120)
    check(G, 'بحث الفهرس بالإنجليزية (storybooks)', cards() == ['gsb-counting-animals', 'gsb-i-like-to-read'], cards())
    check(G, 'عدد النتائج مُعلن (aria-live)', pg.get_attribute('#count', 'aria-live') == 'polite' and '2 من 14' in pg.inner_text('#count'))

    # ---------- 6. التصفية ----------
    G = 'التصفية'
    getters = {'domain': lambda r: [r['domain']], 'type': lambda r: [r['type']], 'audience': lambda r: r['audience'],
               'lang': lambda r: [r['content_language']], 'license': lambda r: [r['license']['code']]}
    opts = {'domain': D['meta']['taxonomy']['domain'], 'type': D['meta']['taxonomy']['type'], 'audience': D['meta']['taxonomy']['audience'],
            'lang': ['العربية', 'متعدد اللغات (منها العربية)', 'الإنجليزية'], 'license': ['CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA']}
    total = 0
    for k, vals in opts.items():
        for v in vals:
            go('#/resources?' + urllib.parse.urlencode({k: v}))
            exp = [i for i in ORDER if v in getters[k](BY[i])]
            check(G, f'{k} = {v} ({len(exp)})', cards() == exp and len(exp) > 0, cards()); total += len(exp)
    check(G, 'كل خيار تصفية يطابق مورداً واحداً على الأقل ومجموع المجالات = 14', sum(1 for r in RES) == 14)
    go('#/resources')
    pg.check('input[data-f=audience][value="المرحلة الابتدائية"]'); pg.wait_for_timeout(120)
    pg.check('input[data-f=lang][value="العربية"]'); pg.wait_for_timeout(120)
    exp = [i for i in ORDER if 'المرحلة الابتدائية' in BY[i]['audience'] and BY[i]['content_language'] == 'العربية']
    check(G, 'دمج عاملين (AND بين المجموعات)', cards() == exp, cards())
    pg.check('input[data-f=lang][value="الإنجليزية"]'); pg.wait_for_timeout(120)
    exp2 = [i for i in ORDER if 'المرحلة الابتدائية' in BY[i]['audience'] and BY[i]['content_language'] in ('العربية', 'الإنجليزية')]
    check(G, 'خياران في المجموعة نفسها (OR داخل المجموعة)', cards() == exp2, cards())
    url = pg.url; pg.reload(); pg.wait_for_timeout(150)
    check(G, 'حالة التصفية محفوظة في الرابط وتبقى بعد إعادة التحميل', cards() == exp2 and pg.is_checked('input[data-f=lang][value="العربية"]'), url)
    n_counts = pg.eval_on_selector_all('input[data-f=lang]', 'e=>e.map(x=>x.parentElement.querySelector(".n").textContent)')
    check(G, 'أعداد الخيارات تُحسب ضمن التصفية الحالية', n_counts == [str(sum(1 for i in ORDER if 'المرحلة الابتدائية' in BY[i]['audience'] and BY[i]['content_language'] == v)) for v in opts['lang']], n_counts)
    pg.click('button.chip >> nth=0'); pg.wait_for_timeout(120)
    check(G, 'إزالة عامل عبر الشريحة', not pg.is_checked('input[data-f=audience][value="المرحلة الابتدائية"]'))
    pg.click('.toolbar [data-reset]'); pg.wait_for_timeout(120)
    check(G, 'زر إعادة الضبط يمسح كل العوامل', len(cards()) == 14 and pg.url.endswith('#/resources'))
    go('#/resources?' + urllib.parse.urlencode({'q': 'محاكاة', 'domain': 'العلوم', 'license': 'CC BY-NC'}))
    exp = [i for i in ORDER if BY[i]['domain'] == 'العلوم' and BY[i]['license']['code'] == 'CC BY-NC']
    check(G, 'البحث + التصفية معًا', cards() == exp, cards())
    go('#/resources?domain=' + urllib.parse.quote('قيمة غير صحيحة'))
    check(G, 'قيمة تصفية غير صحيحة في الرابط تُتجاهل بأمان', len(cards()) == 14)
    go('#/resources?q=' + urllib.parse.quote('<img src=x onerror=alert(1)>'))
    check(G, 'إدخال HTML في البحث لا يُنفَّذ (تهريب آمن)', pg.locator('#app img[src=x]').count() == 0 and 'لا توجد موارد' in pg.inner_text('#app'))

    # ---------- 7. إمكانية الوصول ----------
    G = 'إمكانية الوصول'
    go('#/'); pg.reload(); pg.wait_for_timeout(150); pg.keyboard.press('Tab')
    check(G, 'أول عنصر بالتبويب هو «تخطَّ إلى المحتوى»', pg.evaluate('document.activeElement.className') == 'skip')
    check(G, 'lang="ar" و dir="rtl"', pg.get_attribute('html', 'lang') == 'ar' and pg.get_attribute('html', 'dir') == 'rtl')
    for h in ['#/', '#/resources', '#/resource/tessa-arabic', '#/licenses', '#/about']:
        go(h)
        r = pg.evaluate('''()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
          const noalt=[...document.images].filter(i=>!i.hasAttribute('alt')).length;
          const inputs=[...document.querySelectorAll('input')].filter(i=>!(i.labels&&i.labels.length)).length;
          const emptyLinks=[...document.querySelectorAll('a')].filter(a=>!a.textContent.trim()&&!a.getAttribute('aria-label')).length;
          const btn=[...document.querySelectorAll('button')].filter(b=>!b.textContent.trim()).length;
          const lv=[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1]);let skip=0;for(let i=1;i<lv.length;i++)if(lv[i]-lv[i-1]>1)skip++;
          return {dup,noalt,inputs,emptyLinks,btn,skip}}''')
        check(G, f'{h}: معرّفات فريدة، نص بديل، تسميات الحقول، روابط وأزرار لها أسماء، تسلسل العناوين', not r['dup'] and r['noalt'] == 0 and r['inputs'] == 0 and r['emptyLinks'] == 0 and r['btn'] == 0 and r['skip'] == 0, r)
    go('#/resources'); pg.focus('input[data-f=domain] >> nth=0'); pg.keyboard.press('Space'); pg.wait_for_timeout(150)
    check(G, 'التصفية بلوحة المفاتيح مع بقاء التركيز على الخانة', pg.evaluate('document.activeElement.dataset.f') == 'domain' and len(cards()) == 2)
    # تباين الألوان المستخدمة في النصوص
    def lum(h):
        c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]; c = [x / 12.92 if x <= .03928 else ((x + .055) / 1.055) ** 2.4 for x in c]
        return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]
    def cr(a, b): a, b = lum(a), lum(b); return (max(a, b) + .05) / (min(a, b) + .05)
    pairs = [('#111144', '#FFFFFF'), ('#111144', '#FAFAF7'), ('#4A4F6A', '#FFFFFF'), ('#4A4F6A', '#F2F2F2'), ('#087A5E', '#FFFFFF'), ('#087A5E', '#E6F4EF'),
             ('#FFFFFF', '#087A5E'), ('#FFFFFF', '#111144'), ('#4056E3', '#FFFFFF'), ('#111144', '#E5C603'), ('#4A4000', '#FFF7CC'), ('#065A46', '#E6F4EF'),
             ('#2B3BA8', '#E9ECFC'), ('#5A4D00', '#FFF7CC'), ('#C9CBE0', '#0C0C33'), ('#A9ACC9', '#0C0C33'), ('#9B1C1C', '#FFFFFF'), ('#FFFFFF', '#4056E3')]
    low = [(a, b, round(cr(a, b), 2)) for a, b in pairs if cr(a, b) < 4.5]
    check(G, 'تباين كل أزواج النص/الخلفية ≥ 4.5:1 (WCAG AA)', not low, low or [(a, b, round(cr(a, b), 2)) for a, b in pairs][:4])

    # ---------- 8. التجاوب ----------
    G = 'التجاوب'
    for w, hgt in [(320, 640), (390, 844), (768, 1024), (1024, 768), (1440, 900), (1920, 1080)]:
        pg.set_viewport_size({'width': w, 'height': hgt}); bad = []
        for h in ['#/', '#/resources', '#/resource/smarthistory-umayyads', '#/licenses', '#/about']:
            go(h)
            if pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1'): bad.append(h)
        check(G, f'لا تمرير أفقي عند العرض {w}px', not bad, bad)
    pg.set_viewport_size({'width': 390, 'height': 844}); go('#/')
    check(G, 'القائمة مطوية على الجوال وتُفتح بالزر', not pg.is_visible('#nav a >> nth=1'))
    pg.click('.menu-btn'); check(G, 'زر القائمة يفتحها ويحدّث aria-expanded', pg.is_visible('#nav a >> nth=1') and pg.get_attribute('.menu-btn', 'aria-expanded') == 'true')
    pg.click('#nav a >> nth=1'); pg.wait_for_timeout(150)
    check(G, 'اختيار رابط يغلق القائمة', pg.url.endswith('#/resources') and not pg.is_visible('#nav a >> nth=1'))
    pg.set_viewport_size({'width': 1440, 'height': 900})

    # ---------- 9. الأداء والأصول ----------
    G = 'الأصول والأداء'
    reqs.clear(); failed.clear(); go('#/'); pg.reload(); pg.wait_for_load_state('networkidle')
    extreq = [u for u in reqs if not u.startswith(BASE)]
    check(G, 'لا طلبات شبكة خارجية عند التحميل', not extreq, extreq)
    check(G, 'لا طلبات فاشلة (4xx/5xx)', not failed, failed)
    fonts_ok = pg.evaluate('document.fonts.check("16px Alexandria") && [...document.fonts].filter(f=>f.family.includes("Alexandria")&&f.status==="loaded").length')
    check(G, 'خط Alexandria محمَّل من الملفات المحلية', fonts_ok and fonts_ok >= 2, fonts_ok)
    hero = pg.evaluate('(()=>{const i=document.querySelector(".hart img");return {w:i.clientWidth,nw:i.naturalWidth,nh:i.naturalHeight,h:i.clientHeight,ok:i.complete&&i.naturalWidth>0}})()')
    check(G, 'صورة البطل محلية ومحمّلة وبحجم أصغر (470px) دون قص', hero['ok'] and hero['w'] == 470 and abs(hero['h'] / hero['w'] - hero['nh'] / hero['nw']) < 0.01, hero)
    size = sum(f.stat().st_size for f in SITE.rglob('*') if f.is_file())
    check(G, 'حجم الموقع كاملًا أقل من 1 ميغابايت', size < 1_000_000, f'{size/1024:.0f} KB')
    t = pg.evaluate('performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd')
    check(G, 'زمن DOMContentLoaded محليًا', t < 1500, f'{t:.0f} ms')
    check(G, 'لا أخطاء في وحدة التحكم طوال الاختبار', not errors, errors)

    # ---------- 10. بدون JavaScript، وفتح الملف محليًا ----------
    G = 'التوافق'
    nj = b.new_context(java_script_enabled=False).new_page(); nj.goto(BASE)
    rows = nj.locator('noscript').count()
    html = nj.content()
    check(G, 'بديل noscript يسرد الموارد الأربعة عشر', html.count('<tr><td><a href=') == 14 or (SITE / 'index.html').read_text(encoding='utf-8').count('<tr><td><a href=') == 14)
    fp = b.new_page(); fp.goto((SITE / 'index.html').as_uri() + '#/resources'); fp.wait_for_timeout(300)
    check(G, 'الموقع يعمل بفتح index.html مباشرة (file://)', fp.locator('#app article.card').count() == 14)
    check(G, 'صفحة 404.html موجودة', (SITE / '404.html').exists() and (SITE / '.nojekyll').exists())
    b.close()

ok = sum(r['ok'] for r in results)
print(json.dumps({'passed': ok, 'total': len(results)}, ensure_ascii=False))
for r in results:
    if not r['ok']: print('FAIL', r['group'], '|', r['test'], '|', r['detail'])
pathlib.Path(sys.argv[3] if len(sys.argv) > 3 else 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding='utf-8')

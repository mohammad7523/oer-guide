/* دليل الموارد التعليمية المفتوحة — منطق الواجهة
   صفحة واحدة بتوجيه عبر الوسم (#)، بلا خادم ولا مكتبات خارجية.
   البيانات: data/resources.js (نسخة مولّدة من data/resources.json). */
(function () {
  'use strict';

  var DATA = window.OER_DATA;
  var app = document.getElementById('app');
  if (!DATA || !app) { return; }
  var RES = DATA.resources;
  var BY_ID = {};
  RES.forEach(function (r, i) { r._i = i; BY_ID[r.id] = r; });

  /* ---------- مجموعات العرض: تعكس شروط الترخيص والاستثناءات، لا جودة الموارد ---------- */
  var GROUPS = [
    { title: 'مرخّصة دون استثناءات',
      text: 'تُستخدم مباشرة مع الالتزام بنسبة العمل إلى مؤلفه وذكر الترخيص.',
      ids: ['gsb-counting-animals', 'gsb-i-like-to-read', 'openmed-course-ar'] },
    { title: 'مرخّصة بقيود NC أو SA',
      text: 'تُستخدم لأغراض غير تجارية، أو تُشارك تعديلاتها بالترخيص نفسه.',
      ids: ['phet-fractions-intro', 'phet-area-builder', 'phet-states-of-matter-basics', 'phet-circuit-dc', 'basic-guide-oer', 'py4e'] },
    { title: 'مرخّصة مع استثناءات لأطراف ثالثة',
      text: 'بعض مكوناتها (صور أو بيانات أو رسوم) تحمل تراخيص مختلفة؛ اقرأ الاستثناء قبل إعادة الاستخدام.',
      ids: ['im-k5-centers', 'tessa-arabic', 'writing-guide', 'owid-literacy', 'smarthistory-umayyads'] }
  ];
  var GROUP_NOTE = 'تقسيم الموارد إلى ثلاث مجموعات يعكس شروط تراخيصها ووجود استثناءات فيها، ولا يمثّل ترتيبًا لجودة الموارد أو قيمتها التعليمية.';
  var GROUP_OF = {};
  GROUPS.forEach(function (g, gi) { g.ids.forEach(function (id) { GROUP_OF[id] = gi; }); });
  // ترتيب العرض الرسمي = ترتيب المجموعات
  var ORDER = [].concat(GROUPS[0].ids, GROUPS[1].ids, GROUPS[2].ids);

  /* ---------- لون وشكل زخرفي لكل مجال (زخرفة فقط؛ النص كحلي دائمًا) ---------- */
  var DOM = {
    'الرياضيات': ['#4056E3', 'arch'], 'العلوم': ['#0A8E6E', 'quarter'], 'اللغة والمهارات': ['#00AEDA', 'tri'],
    'الحاسب والبرمجة': ['#111144', 'star'], 'العلوم الإنسانية والاجتماعية': ['#E5C603', 'sun'],
    'التربية والتعليم المفتوح': ['#40E0D0', 'rings']
  };

  function motif(kind, c, s) {
    var w = s, h = w / 2, g = '';
    if (kind === 'arch') {
      g = '<path d="M0 ' + w + ' A' + h + ' ' + h + ' 0 0 1 ' + w + ' ' + w + 'Z" fill="' + c + '"/><path d="M' + w * .25 + ' ' + w + ' A' + w / 4 + ' ' + w / 4 + ' 0 0 1 ' + w * .75 + ' ' + w + 'Z" fill="#fff" opacity=".55"/>';
    } else if (kind === 'quarter') {
      g = '<path d="M0 0H' + w + 'A' + w + ' ' + w + ' 0 0 1 0 ' + w + 'Z" fill="' + c + '"/>';
    } else if (kind === 'tri') {
      g = '<path d="M0 ' + w + 'L' + w / 4 + ' ' + h + 'L' + h + ' ' + w + 'Z M' + h + ' ' + w + 'L' + w * .75 + ' ' + h + 'L' + w + ' ' + w + 'Z M' + w / 4 + ' ' + h + 'L' + h + ' 0L' + w * .75 + ' ' + h + 'Z" fill="' + c + '"/>';
    } else if (kind === 'star') {
      g = '<path d="M' + h + ' 0Q' + h + ' ' + h + ' ' + w + ' ' + h + 'Q' + h + ' ' + h + ' ' + h + ' ' + w + 'Q' + h + ' ' + h + ' 0 ' + h + 'Q' + h + ' ' + h + ' ' + h + ' 0Z" fill="' + c + '"/>';
    } else if (kind === 'sun') {
      var ls = '';
      for (var a = 0; a < 24; a++) {
        ls += '<line x1="' + h + '" y1="' + h + '" x2="' + (h + h * Math.cos(a * Math.PI / 12)).toFixed(1) + '" y2="' + (h + h * Math.sin(a * Math.PI / 12)).toFixed(1) + '"/>';
      }
      g = '<g stroke="' + c + '" stroke-width="1.6">' + ls + '</g><circle cx="' + h + '" cy="' + h + '" r="' + w / 10 + '" fill="' + c + '"/>';
    } else {
      for (var i = 2; i < h; i += 6) {
        g += '<path d="M' + i + ' ' + w + 'A' + (h - i) + ' ' + (h - i) + ' 0 0 1 ' + (w - i) + ' ' + w + '" fill="none" stroke="' + c + '" stroke-width="2.2"/>';
      }
    }
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + w + ' ' + w + '" aria-hidden="true" focusable="false">' + g + '</svg>';
  }

  function strip() {
    var k = [['#0A8E6E', 'quarter'], ['#4056E3', 'arch'], ['#111144', 'tri'], ['#00AEDA', 'star'], ['#0A8E6E', 'rings'], ['#4056E3', 'sun']];
    var out = '';
    for (var i = 0; i < 80; i++) {
      out += '<span style="background:' + (i % 2 ? '#F2F2F2' : '#fff') + '">' + motif(k[i % 6][1], k[i % 6][0], 26) + '</span>';
    }
    return '<div class="strip" aria-hidden="true">' + out + '</div>';
  }

  /* ---------- أدوات ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // تطبيع عربي للبحث: حذف التشكيل والتطويل وتوحيد الألف والياء والتاء المربوطة
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[ً-ٰٟۖ-ۭ]/g, '')
      .replace(/ـ/g, '')
      .replace(/[آأإٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/[،؛؟.,;:!?()\[\]«»"'\-–—_/\\]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function stripAl(t) { return t.length > 4 && t.indexOf('ال') === 0 ? t.slice(2) : t; }
  function licParts(r) { return r.license.code.replace(/^CC\s*/, '').split('-'); }
  function licFamily(r) { return r.license.code; } // مثل: CC BY-NC
  function langFamily(r) { return r.content_language; }
  function shortProvider(p) { return p.split('–')[0].split('(')[0].split('،')[0].trim(); }

  var HAY = {};
  RES.forEach(function (r) {
    HAY[r.id] = norm([r.name_ar, r.name_original, r.provider, r.description, r.domain, r.type,
      r.audience.join(' '), r.content_language, r.interface_language, r.license.label, r.license.code].join(' '));
  });
  function matchQuery(r, q) {
    var terms = norm(q).split(' ').filter(Boolean);
    if (!terms.length) { return true; }
    var hay = HAY[r.id];
    return terms.every(function (t) { return hay.indexOf(t) !== -1 || hay.indexOf(stripAl(t)) !== -1; });
  }

  var FILTERS = [
    { key: 'domain', label: 'المجال', opts: DATA.meta.taxonomy.domain, get: function (r) { return [r.domain]; } },
    { key: 'type', label: 'نوع المورد', opts: DATA.meta.taxonomy.type, get: function (r) { return [r.type]; } },
    { key: 'audience', label: 'الفئة المستهدفة', opts: DATA.meta.taxonomy.audience, get: function (r) { return r.audience; } },
    { key: 'lang', label: 'لغة المحتوى', opts: ['العربية', 'متعدد اللغات (منها العربية)', 'الإنجليزية'], get: function (r) { return [langFamily(r)]; } },
    { key: 'license', label: 'نوع الترخيص', opts: ['CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA'], get: function (r) { return [licFamily(r)]; } }
  ];

  /* ---------- الحالة والعنوان ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#/, '') || '/';
    var qi = h.indexOf('?');
    var path = qi === -1 ? h : h.slice(0, qi);
    var params = new URLSearchParams(qi === -1 ? '' : h.slice(qi + 1));
    return { path: path.replace(/\/+$/, '') || '/', params: params };
  }
  function stateFromParams(p) {
    var st = { q: p.get('q') || '' };
    FILTERS.forEach(function (f) {
      var v = p.getAll(f.key).filter(function (x) { return f.opts.indexOf(x) !== -1; });
      st[f.key] = v;
    });
    return st;
  }
  function stateToHash(st) {
    var p = new URLSearchParams();
    if (st.q) { p.set('q', st.q); }
    FILTERS.forEach(function (f) { st[f.key].forEach(function (v) { p.append(f.key, v); }); });
    var s = p.toString();
    return '#/resources' + (s ? '?' + s : '');
  }
  function filterRes(st, skipKey) {
    return ORDER.map(function (id) { return BY_ID[id]; }).filter(function (r) {
      if (!matchQuery(r, st.q)) { return false; }
      return FILTERS.every(function (f) {
        if (f.key === skipKey || !st[f.key].length) { return true; }
        var vals = f.get(r);
        return st[f.key].some(function (v) { return vals.indexOf(v) !== -1; });
      });
    });
  }

  /* ---------- مكونات ---------- */
  var LC = { BY: 'نسب المصنف', NC: 'غير تجاري', SA: 'المشاركة بالمثل' };
  function chips(r) {
    return licParts(r).filter(function (p) { return LC[p]; }).map(function (p) {
      return '<span class="lc lc-' + p.toLowerCase() + '"><b>' + p + '</b>' + LC[p] + '</span>';
    }).join('');
  }
  function searchForm(id, value, label) {
    return '<form class="search" role="search" data-search action="#/resources">' +
      '<label class="sr-only" for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" name="q" type="search" autocomplete="off" value="' + esc(value) + '" placeholder="ابحث بالعربية أو الإنجليزية: كسور، fractions، قراءة، بايثون…">' +
      '<button class="btn" type="submit">بحث</button></form>';
  }
  function card(r, hTag) {
    var d = DOM[r.domain] || ['#0A8E6E', 'quarter'];
    var aud = r.audience.slice(0, 2).join('، ') + (r.audience.length > 2 ? '…' : '');
    var flag = GROUP_OF[r.id] === 2 ? '<div class="flag">⚠ يتضمن استثناءات لأطراف ثالثة</div>' : '';
    hTag = hTag || 'h3';
    return '<article class="card" aria-labelledby="t-' + r.id + '">' +
      '<div class="cband"><span class="corner">' + motif(d[1], d[0], 40) + '</span><span class="dom">' + esc(r.domain) + '</span><span class="typ">' + esc(r.type) + '</span></div>' +
      '<div class="cbody"><' + hTag + ' id="t-' + r.id + '"><a href="#/resource/' + r.id + '">' + esc(r.name_ar) + '</a></' + hTag + '>' +
      '<div class="prov">' + esc(shortProvider(r.provider)) + '</div>' +
      '<p class="desc">' + esc(r.description) + '</p>' +
      '<dl class="meta"><div><dt>الفئة</dt><dd>' + esc(aud) + '</dd></div><div><dt>لغة المحتوى</dt><dd>' + esc(r.content_language) + '</dd></div></dl>' +
      '<div class="lic"><span class="lname ltr">' + esc(r.license.label) + '</span><div class="lcs">' + chips(r) + '</div></div>' + flag +
      '</div><div class="cfoot"><a class="btn-s" href="#/resource/' + r.id + '">عرض التفاصيل<span class="sr-only"> عن ' + esc(r.name_ar) + '</span></a>' +
      '<a class="ext" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">زيارة المورد<span class="sr-only"> (يفتح في نافذة جديدة)</span></a></div></article>';
  }
  function crumb(items) {
    return '<nav class="crumb" aria-label="مسار التنقل"><ol>' + items.map(function (it, i) {
      return '<li>' + (it[1] && i < items.length - 1 ? '<a href="' + it[1] + '">' + esc(it[0]) + '</a>' : '<span aria-current="page">' + esc(it[0]) + '</span>') + '</li>';
    }).join('') + '</ol></nav>';
  }
  function countBy(fn) {
    return RES.filter(fn).length;
  }

  /* ---------- الصفحات ---------- */
  function viewHome() {
    var nAr = countBy(function (r) { return r.content_language !== 'الإنجليزية'; });
    var nPrimary = countBy(function (r) { return r.audience.indexOf('المرحلة الابتدائية') !== -1; });
    var doms = DATA.meta.taxonomy.domain.map(function (d) {
      var n = countBy(function (r) { return r.domain === d; });
      return '<a class="dtile" href="#/resources?domain=' + encodeURIComponent(d) + '"><span class="dm">' + motif(DOM[d][1], DOM[d][0], 58) + '</span><b>' + esc(d) + '</b><small>' + n + (n > 2 ? ' موارد' : n === 2 ? ' موردان' : ' مورد') + '</small></a>';
    }).join('');
    var groups = GROUPS.map(function (g, i) {
      return '<div class="gcard g' + i + '"><span class="gn" aria-hidden="true">' + (i + 1) + '</span><div><h3 style="margin:0;font-size:16.5px">' + esc(g.title) + '</h3><p>' + esc(g.text) + '</p><a href="#/resources#g' + i + '" data-group="' + i + '">' + g.ids.length + ' موارد ←</a></div></div>';
    }).join('');
    var feat = ['gsb-i-like-to-read', 'phet-fractions-intro', 'smarthistory-umayyads'].map(function (id) { return card(BY_ID[id]); }).join('');
    return '<section class="hero" aria-labelledby="hero-title"><div class="wrap hgrid"><div class="htext">' +
      '<span class="eyebrow">دليل إلكتروني للموارد التعليمية المفتوحة</span>' +
      '<h1 id="hero-title">اكتشف المعرفة،<br>وتعلّم <em>بحرية</em></h1>' +
      '<p>' + RES.length + ' موردًا تعليميًا مفتوحًا في ستة مجالات، لكلٍّ منها ترخيص مفتوح تحقّقنا منه في مصادره الرسمية، مع شرح واضح لما يُسمح به وما يُشترط.</p>' +
      searchForm('home-q', '', 'ابحث في موارد الدليل') +
      '<div class="cta"><a class="btn-o" href="#/resources">تصفّح الفهرس كاملًا</a><a class="btn-o" href="#/licenses">افهم التراخيص</a></div>' +
      '<ul class="stats"><li><b>' + RES.length + '</b><span>موردًا موثّقًا</span></li><li><b>' + DATA.meta.taxonomy.domain.length + '</b><span>مجالات</span></li><li><b>' + nAr + '</b><span>محتواها بالعربية</span></li><li><b>' + nPrimary + '</b><span>للمرحلة الابتدائية</span></li></ul>' +
      '</div><div class="hart"><img src="assets/img/hero.webp" width="470" height="521" alt="" fetchpriority="high"></div></div></section>' +
      strip() +
      '<section class="sec" aria-labelledby="h-dom"><div class="wrap"><div class="shead"><h2 id="h-dom">تصفّح حسب المجال</h2><a class="more" href="#/resources">عرض كل الموارد ←</a></div><div class="dgrid">' + doms + '</div></div></section>' +
      '<section class="sec alt" aria-labelledby="h-grp"><div class="wrap"><div class="shead"><h2 id="h-grp">كيف نُظّمت الموارد؟</h2><p>كل الموارد مفتوحة، لكن شروط إعادة الاستخدام تختلف من ترخيص إلى آخر، فجمعناها في ثلاث مجموعات بحسب هذه الشروط.</p></div>' +
      '<p class="callout"><strong>تنبيه:</strong> ' + GROUP_NOTE + '</p><div class="ggrid">' + groups + '</div></div></section>' +
      '<section class="sec" aria-labelledby="h-feat"><div class="wrap"><div class="shead"><h2 id="h-feat">من موارد الدليل</h2><a class="more" href="#/resources">كل الموارد (' + RES.length + ') ←</a></div><div class="cgrid">' + feat + '</div></div></section>' +
      '<section class="licband" aria-labelledby="h-lic"><div class="wrap lgrid"><div><h2 id="h-lic">مفتوح لا يعني بلا شروط</h2><p>«مجاني» يعني أنك لا تدفع، و«مفتوح» يعني أن الترخيص يسمح لك بإعادة الاستخدام والتعديل والمشاركة وفق شروط معلنة. نشرح لك كل ترخيص بلغة واضحة.</p><a class="btn-y" href="#/licenses">افهم التراخيص</a></div>' +
      '<div class="lexp"><div><span class="lc lc-by"><b>BY</b>نسب المصنف</span><p>اذكر المؤلف والمصدر والترخيص.</p></div><div><span class="lc lc-sa"><b>SA</b>المشاركة بالمثل</span><p>انشر تعديلك بالترخيص نفسه.</p></div><div><span class="lc lc-nc"><b>NC</b>غير تجاري</span><p>لا تستخدمه لأغراض تجارية.</p></div></div></div></section>';
  }

  function viewIndex(params) {
    var st = stateFromParams(params);
    var list = filterRes(st);
    var fs = FILTERS.map(function (f) {
      var base = filterRes(st, f.key);
      return '<fieldset><legend>' + f.label + '</legend>' + f.opts.map(function (o, i) {
        var id = 'f-' + f.key + '-' + i;
        var n = base.filter(function (r) { return f.get(r).indexOf(o) !== -1; }).length;
        var on = st[f.key].indexOf(o) !== -1;
        var label = f.key === 'license' ? '<span class="ltr">' + esc(o) + '</span>' : esc(o);
        return '<label for="' + id + '"><input type="checkbox" id="' + id + '" data-f="' + f.key + '" value="' + esc(o) + '"' + (on ? ' checked' : '') + '>' + label + '<span class="n" aria-label="' + n + ' نتائج">' + n + '</span></label>';
      }).join('') + '</fieldset>';
    }).join('');
    var active = [];
    if (st.q) { active.push('<button class="chip" type="button" data-clear="q" aria-label="إزالة كلمة البحث ' + esc(st.q) + '">«' + esc(st.q) + '» ✕</button>'); }
    FILTERS.forEach(function (f) {
      st[f.key].forEach(function (v) {
        active.push('<button class="chip" type="button" data-clear="' + f.key + '" data-v="' + esc(v) + '" aria-label="إزالة عامل التصفية ' + esc(v) + '">' + esc(v) + ' ✕</button>');
      });
    });
    var any = active.length > 0;
    var body;
    if (!list.length) {
      body = '<div class="empty" role="status"><h2>لا توجد موارد مطابقة</h2><p>جرّب كلمة بحث أخرى (بالعربية أو الإنجليزية)، أو خفّف عوامل التصفية.</p><button type="button" class="btn" data-reset>إعادة ضبط البحث والتصفية</button></div>';
    } else {
      body = '<p class="callout" style="margin-top:0">' + GROUP_NOTE + '</p>' + GROUPS.map(function (g, gi) {
        var items = list.filter(function (r) { return GROUP_OF[r.id] === gi; });
        if (!items.length) { return ''; }
        return '<section class="rgroup" id="g' + gi + '" aria-labelledby="gh' + gi + '"><div class="ghead g' + gi + '"><span class="gn" aria-hidden="true">' + (gi + 1) + '</span><h2 id="gh' + gi + '">' + esc(g.title) + '</h2><small>' + items.length + ' من ' + g.ids.length + '</small><p>' + esc(g.text) + '</p></div><div class="cgrid">' + items.map(function (r) { return card(r); }).join('') + '</div></section>';
      }).join('');
    }
    return '<section class="phead"><div class="wrap">' + crumb([['الرئيسة', '#/'], ['فهرس الموارد']]) +
      '<h1>فهرس الموارد</h1>' + searchForm('idx-q', st.q, 'ابحث في الفهرس') +
      '<div class="toolbar"><span id="count" class="count" role="status" aria-live="polite">' + (any ? 'النتائج: ' + list.length + ' من ' + RES.length : 'كل الموارد: ' + RES.length) + '</span>' +
      (any ? '<span aria-hidden="true">·</span>' + active.join('') + '<button type="button" class="btn-o btn-sm" data-reset>إعادة الضبط</button>' : '') + '</div></div></section>' +
      '<div class="wrap igrid"><details class="filters" open id="filters"><summary>عوامل التصفية</summary><form aria-label="عوامل التصفية" data-filters>' + fs + '</form></details><div>' + body + '</div></div>';
  }

  function permList(r) {
    var L = r.license, out = [];
    out.push('<li class="ok"><span aria-hidden="true">✓</span>نسخ المورد ومشاركته وتعديله مع نسبته إلى مؤلفه</li>');
    out.push(L.commercial_use ? '<li class="ok"><span aria-hidden="true">✓</span>الاستخدام التجاري مسموح</li>' : '<li class="no"><span aria-hidden="true">✕</span>الاستخدام التجاري غير مسموح</li>');
    if (L.share_alike) { out.push('<li class="cond"><span aria-hidden="true">↻</span>نشر أي تعديل بالترخيص نفسه</li>'); }
    return '<ul class="perm">' + out.join('') + '</ul>';
  }

  function viewDetail(id) {
    var r = BY_ID[id];
    if (!r) { return viewNotFound(); }
    var d = DOM[r.domain];
    var gi = GROUP_OF[r.id];
    var pos = ORDER.indexOf(r.id);
    var prev = BY_ID[ORDER[pos - 1]], next = BY_ID[ORDER[pos + 1]];
    var exc = gi === 2
      ? '<section class="panel exc" aria-labelledby="h-exc"><h2 id="h-exc"><span aria-hidden="true">⚠ </span>استثناءات لأطراف ثالثة</h2><p>' + esc(r.exceptions) + '</p></section>'
      : '<section class="panel" aria-labelledby="h-exc"><h2 id="h-exc">نطاق الترخيص وملاحظاته</h2><p>' + esc(r.exceptions) + '</p></section>';
    return '<section class="phead dhead"><div class="wrap">' + crumb([['الرئيسة', '#/'], ['فهرس الموارد', '#/resources'], [r.name_ar]]) +
      '<div class="dtop"><span class="dicon">' + motif(d[1], d[0] === '#111144' ? '#40E0D0' : d[0], 88) + '</span><div>' +
      '<div class="badges"><a class="dom" href="#/resources?domain=' + encodeURIComponent(r.domain) + '">' + esc(r.domain) + '</a><a class="typ" href="#/resources?type=' + encodeURIComponent(r.type) + '">' + esc(r.type) + '</a><span class="st">✓ ' + esc(r.status) + ' · تاريخ التحقق ' + esc(r.verified_on) + '</span></div>' +
      '<h1>' + esc(r.name_ar) + '</h1><div class="orig" lang="en" dir="ltr" style="text-align:right">' + esc(r.name_original) + '</div>' +
      '<p class="lead">' + esc(r.description) + '</p>' +
      '<div class="cta"><a class="btn" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">زيارة المورد ↗<span class="sr-only"> (يفتح في نافذة جديدة)</span></a><button type="button" class="btn-o" data-copy="attr">نسخ صيغة النسب</button><span class="copied" data-copied role="status" aria-live="polite"></span></div>' +
      '</div></div></div></section>' + strip() +
      '<div class="wrap dgrid2"><div>' +
      '<section class="panel" aria-labelledby="h-data"><h2 id="h-data">بيانات المورد</h2><dl class="kv">' +
      '<div><dt>الاسم الأصلي</dt><dd lang="en" dir="ltr" style="text-align:right">' + esc(r.name_original) + '</dd></div>' +
      '<div><dt>الجهة المقدّمة</dt><dd>' + esc(r.provider) + '</dd></div>' +
      '<div><dt>المجال</dt><dd>' + esc(r.domain) + '</dd></div>' +
      '<div><dt>نوع المورد</dt><dd>' + esc(r.type) + '</dd></div>' +
      '<div><dt>الفئة المستهدفة</dt><dd>' + esc(r.audience.join('، ')) + '</dd></div>' +
      '<div><dt>لغة المحتوى</dt><dd>' + esc(r.content_language) + '</dd></div>' +
      '<div><dt>لغة الواجهة</dt><dd>' + esc(r.interface_language) + '</dd></div>' +
      '<div><dt>رابط المورد</dt><dd><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer" dir="ltr">' + esc(r.url) + '</a></dd></div>' +
      '<div><dt>الوصول</dt><dd>' + esc(r.access_check) + '</dd></div></dl></section>' +
      '<section class="panel" aria-labelledby="h-terms"><h2 id="h-terms">ما يُسمح به وما يُشترط</h2><p>' + esc(r.terms) + '</p></section>' +
      exc +
      '<section class="panel" aria-labelledby="h-ex"><h2 id="h-ex">مثال استخدام تعليمي</h2><p>' + esc(r.example) + '</p></section>' +
      '</div><aside aria-label="الترخيص والتحقق">' +
      '<section class="panel licp" aria-labelledby="h-lic2"><span class="cap" id="h-lic2">الترخيص</span><div class="lbig ltr" style="text-align:right">' + esc(r.license.label) + '</div><div class="lcs">' + chips(r) + '</div>' + permList(r) +
      '<div class="applies"><b>يشمل الترخيص:</b> ' + esc(r.license.applies_to) + '</div>' +
      '<a class="ext" href="' + esc(r.license.deed_url) + '" target="_blank" rel="noopener noreferrer license">ملخص الترخيص بالعربية (Creative Commons)</a></section>' +
      '<section class="panel" aria-labelledby="h-attr"><h2 id="h-attr">صيغة النسب المقترحة</h2><p class="attr" lang="en" dir="ltr" id="attr-text">' + esc(r.attribution) + '</p><button type="button" class="btn-s" data-copy="attr">نسخ</button></section>' +
      '<section class="panel" aria-labelledby="h-proof"><h2 id="h-proof">إثبات الترخيص</h2><ul class="proof">' + r.license_proof.map(function (u) {
        return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" dir="ltr">' + esc(u) + '</a></li>';
      }).join('') + '</ul><h3 style="font-size:15px;margin:14px 0 4px">كيف تحقّقنا</h3><p class="small">' + esc(r.evidence) + '</p></section>' +
      '</aside></div>' +
      '<nav class="wrap pager" aria-label="التنقل بين الموارد">' +
      (prev ? '<a href="#/resource/' + prev.id + '" rel="prev"><small>→ المورد السابق</small>' + esc(prev.name_ar) + '</a>' : '<span></span>') +
      (next ? '<a href="#/resource/' + next.id + '" rel="next"><small>المورد التالي ←</small>' + esc(next.name_ar) + '</a>' : '<span></span>') + '</nav>';
  }

  function licList(code) {
    return RES.filter(function (r) { return r.license.code === code; }).map(function (r) {
      return '<a href="#/resource/' + r.id + '">' + esc(r.name_ar) + '</a> <span class="small ltr">(' + esc(r.license.version) + ')</span>';
    }).join('، ') || '—';
  }
  function viewLicenses() {
    var L = [
      ['CC BY', 'by', 'نَسب المصنَّف', ['النسخ والمشاركة بأي وسيط', 'التعديل والبناء على العمل', 'الاستخدام التجاري'], ['ذكر المؤلف والمصدر والترخيص، والإشارة إلى أي تعديل']],
      ['CC BY-SA', 'by-sa', 'نَسب المصنَّف – المشاركة بالمثل', ['النسخ والمشاركة', 'التعديل', 'الاستخدام التجاري'], ['النسبة', 'نشر العمل المعدَّل بالترخيص نفسه']],
      ['CC BY-NC', 'by-nc', 'نَسب المصنَّف – غير تجاري', ['النسخ والمشاركة', 'التعديل'], ['النسبة', 'عدم الاستخدام لأغراض تجارية']],
      ['CC BY-NC-SA', 'by-nc-sa', 'نَسب المصنَّف – غير تجاري – المشاركة بالمثل', ['النسخ والمشاركة', 'التعديل'], ['النسبة', 'عدم الاستخدام التجاري', 'نشر العمل المعدَّل بالترخيص نفسه']]
    ];
    var cards = L.map(function (l) {
      return '<section class="panel" aria-labelledby="lc-' + l[1] + '"><h3 id="lc-' + l[1] + '" style="margin:0"><span class="ltr">' + l[0] + '</span> — ' + l[2] + '</h3>' +
        '<div class="lcs">' + l[0].replace('CC ', '').split('-').map(function (p) { return '<span class="lc lc-' + p.toLowerCase() + '"><b>' + p + '</b>' + LC[p] + '</span>'; }).join('') + '</div>' +
        '<p style="margin:10px 0 0"><b>يُسمح لك:</b></p><ul>' + l[3].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
        '<p style="margin:6px 0 0"><b>بشرط:</b></p><ul>' + l[4].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
        '<p class="small" style="margin-top:8px"><b>في الدليل:</b> ' + licList(l[0]) + '</p>' +
        '<a class="ext" href="https://creativecommons.org/licenses/' + l[1] + '/4.0/deed.ar" target="_blank" rel="noopener noreferrer">الملخص الرسمي بالعربية (الإصدار 4.0)</a></section>';
    }).join('');
    return '<section class="phead"><div class="wrap">' + crumb([['الرئيسة', '#/'], ['افهم التراخيص']]) + '<h1>افهم التراخيص</h1><p class="lead" style="margin:0">دليل مختصر لتراخيص المشاع الإبداعي (Creative Commons) المستخدمة في هذا الدليل.</p></div></section>' +
      '<div class="wrap prose" style="padding:10px 0 56px">' +
      '<h2>مجاني أم مفتوح؟</h2><p>المورد <b>المجاني</b> تستطيع الوصول إليه دون مقابل، لكن ذلك لا يمنحك حق نسخه أو تعديله أو إعادة نشره. أما المورد <b>المفتوح</b> فيُنشر بترخيص يسمح صراحةً بإعادة الاستخدام والتعديل والمشاركة وفق شروط معلنة. لذلك لم يُدرج في هذا الدليل إلا ما وجدنا ترخيصه المفتوح مكتوبًا في مصدر رسمي.</p>' +
      '<h2>الشروط التزامات لا عيوب</h2><p>عناصر مثل <span class="ltr">NC</span> (غير تجاري) و<span class="ltr">SA</span> (المشاركة بالمثل) لا تنقص من قيمة المورد، بل تحدد كيف تعيد استخدامه. معظم الاستخدامات التعليمية في الفصل غير تجارية أصلًا.</p>' +
      '<div class="lic-cards">' + cards + '</div>' +
      '<h2>لماذا استُبعدت تراخيص «بلا اشتقاق» (ND)؟</h2><p>تمنع تراخيص <span class="ltr">ND</span> نشر نسخ معدّلة من العمل، والدليل يشترط حرية التعديل والتكييف، فلا يتضمن أي مورد يكون ترخيصه الأساسي <span class="ltr">ND</span>.</p>' +
      '<h2>كيف أنسب العمل؟ (قاعدة TASL)</h2><table class="ttable"><thead><tr><th>العنصر</th><th>المقصود</th></tr></thead><tbody>' +
      '<tr><td>العنوان (Title)</td><td>اسم المورد</td></tr><tr><td>المؤلف (Author)</td><td>الشخص أو الجهة المالكة</td></tr><tr><td>المصدر (Source)</td><td>رابط المورد الأصلي</td></tr><tr><td>الترخيص (License)</td><td>اسم الترخيص وإصداره مع رابطه</td></tr></tbody></table>' +
      '<p>في صفحة كل مورد صيغة نسب جاهزة للنسخ.</p>' +
      '<h2>استثناءات الأطراف الثالثة</h2><p>قد يتضمن المورد المفتوح صورًا أو بيانات أو رسومًا تملكها جهات أخرى وتحمل تراخيص مختلفة. هذه المكونات لا يشملها ترخيص المورد، ونوضّحها في صفحة كل مورد ضمن المجموعة الثالثة. ' + GROUP_NOTE + '</p>' +
      '<p class="small">هذه الصفحة شرح تعليمي مبسّط وليست استشارة قانونية؛ النص الملزم هو نص الترخيص الرسمي على موقع Creative Commons.</p></div>';
  }

  function viewAbout() {
    return '<section class="phead"><div class="wrap">' + crumb([['الرئيسة', '#/'], ['عن الدليل']]) + '<h1>عن الدليل</h1></div></section>' +
      '<div class="wrap prose" style="padding:10px 0 56px">' +
      '<p class="callout"><strong>مشروع أكاديمي طلابي ضمن جامعة طيبة</strong>، أُعدّ لمتطلبات مقرر دراسي، وليس موقعًا رسميًا صادرًا عن الجامعة ولا يمثّلها. استُلهمت ألوانه من الهوية البصرية للجامعة دون استخدام شعارها.</p>' +
      '<h2>الهدف</h2><p>مساعدة المعلمين والطلاب على الوصول إلى موارد تعليمية <b>مفتوحة الترخيص</b> (لا مجانية فحسب)، مع بيانات موثّقة توضّح شروط إعادة استخدام كل مورد.</p>' +
      '<h2>معايير الإدراج</h2><ul><li>ترخيص مفتوح مكتوب في مصدر رسمي (صفحة المورد، أو صفحة حقوق داخل الوثيقة، أو سجل المستودع، أو سياسة المنصة التي تشمل المورد صراحةً).</li><li>استبعاد تراخيص <span class="ltr">ND</span>، وقبول <span class="ltr">NC</span> و<span class="ltr">SA</span> مع بيان القيود.</li><li>عمل رابط المورد ورابط إثبات ترخيصه دون تسجيل حساب.</li><li>بيان أي استثناءات لأطراف ثالثة.</li></ul>' +
      '<h2>منهجية التحقق</h2><table class="ttable"><thead><tr><th>المستوى</th><th>مصدر الإثبات</th></tr></thead><tbody><tr><td>1</td><td>ترخيص مذكور في صفحة المورد نفسها</td></tr><tr><td>2</td><td>صفحة حقوق داخل الوثيقة أو الكتاب</td></tr><tr><td>3</td><td>سجل المستودع الرسمي (مثل Zenodo)</td></tr><tr><td>4</td><td>سياسة ترخيص المنصة إذا شملت المورد صراحةً</td></tr></tbody></table>' +
      '<p>تاريخ آخر تحقق: <b>' + esc(DATA.meta.verified_on) + '</b>. التراخيص قد تتغير؛ راجع رابط الإثبات قبل إعادة النشر.</p>' +
      '<h2>التصنيف</h2><p>صُنّفت الموارد حسب <b>المجال</b> (' + DATA.meta.taxonomy.domain.length + ')، و<b>نوع المورد</b> (' + DATA.meta.taxonomy.type.length + ')، و<b>الفئة المستهدفة</b> (' + DATA.meta.taxonomy.audience.length + ')، مع لغة المحتوى ونوع الترخيص. ' + GROUP_NOTE + '</p>' +
      '<h2>حقوق محتوى الدليل والأصول</h2><ul>' +
      '<li>نصوص الدليل (الأوصاف والتصنيف والشروح) متاحة بترخيص <a href="https://creativecommons.org/licenses/by/4.0/deed.ar" target="_blank" rel="noopener noreferrer license" class="ltr">CC BY 4.0</a>. كل مورد يحتفظ بترخيصه الأصلي.</li>' +
      '<li>الخط: Alexandria، © The Alexandria Project Authors، بترخيص <a href="assets/fonts/OFL.txt">SIL Open Font License 1.1</a>، محفوظ محليًا.</li>' +
      '<li>الصورة الافتتاحية: رسم أصلي أُنشئ لهذا المشروع بأداة ImagineArt، لا يتضمن شعارًا أو نصًا.</li>' +
      '<li>الأشكال الهندسية: رسوم أصلية بصيغة SVG أُعدّت للدليل.</li></ul>' +
      '<p class="small">ملاحظة: لا يستخدم الدليل أي ملفات تتبّع أو خدمات خارجية؛ كل ملفاته محلية.</p></div>';
  }

  function viewNotFound() {
    return '<section class="sec"><div class="wrap"><div class="empty"><h1 style="font-size:24px;margin:0 0 6px">الصفحة غير موجودة</h1><p>قد يكون الرابط غير صحيح.</p><a class="btn" href="#/">العودة إلى الرئيسة</a> <a class="btn-o" href="#/resources">فهرس الموارد</a></div></div></section>';
  }

  /* ---------- التوجيه ---------- */
  var TITLES = { '/': 'الرئيسة', '/resources': 'فهرس الموارد', '/licenses': 'افهم التراخيص', '/about': 'عن الدليل' };
  var SITE = 'دليل الموارد التعليمية المفتوحة';
  var lastPath = null;

  function render() {
    var h = parseHash();
    var path = h.path, html, title, nav = path;
    var m = path.match(/^\/resource\/([a-z0-9-]+)$/);
    if (path === '/') { html = viewHome(); title = TITLES['/']; }
    else if (path === '/resources') { html = viewIndex(h.params); title = TITLES[path]; }
    else if (m) { var r = BY_ID[m[1]]; html = viewDetail(m[1]); title = r ? r.name_ar : 'غير موجود'; nav = '/resources'; }
    else if (path === '/licenses') { html = viewLicenses(); title = TITLES[path]; }
    else if (path === '/about') { html = viewAbout(); title = TITLES[path]; }
    else { html = viewNotFound(); title = 'غير موجود'; }
    var samePage = lastPath === path;
    app.innerHTML = html;
    document.title = title + ' — ' + SITE;
    document.querySelectorAll('.nav a').forEach(function (a) {
      if (a.getAttribute('href') === '#' + nav) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });
    document.getElementById('nav').classList.remove('open');
    document.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
    if (!samePage) {
      window.scrollTo(0, 0);
      var h1 = app.querySelector('h1');
      if (h1 && lastPath !== null) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    }
    lastPath = path;
    if (window.innerWidth <= 860) { var f = document.getElementById('filters'); if (f) { f.open = false; } }
  }

  function go(hash, replace) {
    if (replace) { history.replaceState(null, '', hash); render(); }
    else { location.hash = hash; }
  }
  function currentState() { return stateFromParams(parseHash().params); }

  /* ---------- الأحداث ---------- */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.hasAttribute('data-search')) {
      e.preventDefault();
      var q = f.querySelector('input').value.trim();
      var st = parseHash().path === '/resources' ? currentState() : stateFromParams(new URLSearchParams());
      st.q = q;
      go(stateToHash(st), parseHash().path === '/resources');
      var inp = document.getElementById('idx-q'); if (inp) { inp.focus(); var v = inp.value; inp.value = ''; inp.value = v; }
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('input[data-f]')) {
      var st = currentState();
      st.q = (document.getElementById('idx-q') || { value: st.q }).value.trim();
      var k = t.getAttribute('data-f');
      st[k] = Array.prototype.map.call(document.querySelectorAll('input[data-f="' + k + '"]:checked'), function (x) { return x.value; });
      var id = t.id;
      go(stateToHash(st), true);
      var el = document.getElementById(id); if (el) { el.focus(); }
    }
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a');
    if (!t) { return; }
    if (t.hasAttribute('data-reset')) {
      go('#/resources', true);
      var i = document.getElementById('idx-q'); if (i) { i.focus(); }
    } else if (t.hasAttribute('data-clear')) {
      var st = currentState(), k = t.getAttribute('data-clear');
      if (k === 'q') { st.q = ''; } else { var v = t.getAttribute('data-v'); st[k] = st[k].filter(function (x) { return x !== v; }); }
      go(stateToHash(st), true);
      var i2 = document.getElementById('idx-q'); if (i2) { i2.focus(); }
    } else if (t.hasAttribute('data-copy')) {
      var txt = (document.getElementById('attr-text') || {}).textContent || '';
      var done = function (ok) {
        document.querySelectorAll('[data-copied]').forEach(function (s) { s.textContent = ok ? 'نُسخت صيغة النسب.' : 'تعذّر النسخ؛ حدّد النص وانسخه يدويًا.'; });
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta); done(ok);
      }
    } else if (t.hasAttribute('data-group')) {
      e.preventDefault();
      var g = t.getAttribute('data-group');
      go('#/resources', false);
      setTimeout(function () { var s = document.getElementById('g' + g); if (s) { s.scrollIntoView(); } }, 60);
    }
  });
  document.querySelector('.menu-btn').addEventListener('click', function () {
    var n = document.getElementById('nav'); var open = n.classList.toggle('open');
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  window.addEventListener('hashchange', render);
  window.OER_APP = { norm: norm, filterRes: filterRes, stateFromParams: stateFromParams, GROUPS: GROUPS, ORDER: ORDER };
  render();
}());

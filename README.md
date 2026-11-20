# دليل الموارد التعليمية المفتوحة

> اكتشف المعرفة، وتعلّم بحرية

دليل إلكتروني ثابت (HTML/CSS/JS) يضم **14 موردًا تعليميًا مفتوحًا** بتراخيص Creative Commons تحقّقنا منها في مصادرها الرسمية (آخر تحقق: 20 نوفمبر 2026)، مصنّفة حسب المجال ونوع المورد والفئة المستهدفة، مع بحث عربي/إنجليزي وتصفية وصفحة تفاصيل لكل مورد.

**مشروع أكاديمي طلابي ضمن جامعة طيبة، وليس موقعًا رسميًا صادرًا عن الجامعة.** الألوان مستوحاة من هويتها البصرية، ولا يستخدم الموقع شعارها.

## بنية المشروع

```
index.html              الصفحة الوحيدة (توجيه عبر #)
404.html                صفحة الخطأ (تعيد إلى الرئيسة)
.nojekyll               لمنع معالجة Jekyll في GitHub Pages
assets/css/style.css    الأنماط
assets/js/app.js        البحث والتصفية والتوجيه وعرض الصفحات
assets/fonts/           خط Alexandria (WOFF) + OFL.txt
assets/img/hero.webp    الصورة الافتتاحية (ImagineArt)
assets/img/favicon.svg  أيقونة الموقع
data/resources.json     مصدر البيانات (يُعدَّل هذا الملف فقط)
data/resources.js       نسخة مولّدة من JSON (تتيح فتح الموقع مباشرة دون خادم)
tools/build_data.py     يولّد resources.js وقائمة noscript بعد أي تعديل على JSON
tests/test_site.py      الاختبارات الآلية (Playwright)
docs/                   تقرير الاختبار وتدقيق الروابط
CREDITS.md              مصادر الأصول وتراخيصها
```

## المسارات

| المسار | الصفحة |
|---|---|
| `#/` | الرئيسة: البحث المباشر، المجالات، المجموعات، موارد مختارة |
| `#/resources` | الفهرس مع البحث وخمسة عوامل تصفية (المجال، النوع، الفئة، لغة المحتوى، الترخيص) |
| `#/resources?q=كسور&audience=المرحلة الابتدائية` | حالة البحث والتصفية محفوظة في الرابط |
| `#/resource/<id>` | تفاصيل المورد: البيانات، الترخيص، الاستثناءات، صيغة النسب، روابط الإثبات |
| `#/licenses` | افهم التراخيص |
| `#/about` | عن الدليل ومنهجية التحقق |

## التشغيل محليًا

- **أبسط طريقة:** افتح `index.html` مباشرة في المتصفح، فهو يعمل دون خادم.
- **عبر خادم محلي** (مستحسن، لأن زر النسخ يحتاج سياقًا آمنًا):
  ```bash
  cd oer-guide
  python3 -m http.server 8000
  # ثم افتح http://localhost:8000
  ```

## تعديل البيانات

1. عدّل `data/resources.json`.
2. شغّل `python3 tools/build_data.py` (لا يحتاج مكتبات).
3. شغّل الاختبارات (اختياري):
   ```bash
   pip install playwright && python3 -m playwright install chromium
   python3 -m http.server 8000 &
   python3 tests/test_site.py . http://localhost:8000 results.json
   ```

## النشر على GitHub Pages

1. أنشئ مستودعًا عامًا جديدًا (مثل `oer-guide`) في حسابك على GitHub.
2. ارفع **محتويات** مجلد `oer-guide` إلى جذر المستودع، بحيث يكون `index.html` في الجذر:
   - من الواجهة: **Add file ← Upload files**، ثم اسحب الملفات والمجلدات، ثم **Commit changes**.
   - أو من الطرفية:
     ```bash
     cd oer-guide
     git init && git add . && git commit -m "دليل الموارد التعليمية المفتوحة 1.0"
     git branch -M main
     git remote add origin https://github.com/<اسم-المستخدم>/oer-guide.git
     git push -u origin main
     ```
3. من **Settings ← Pages**: اختر **Source: Deploy from a branch**، ثم الفرع `main` والمجلد `/ (root)`، ثم **Save**.
4. بعد دقيقة إلى دقيقتين يظهر الرابط: `https://<اسم-المستخدم>.github.io/oer-guide/`.
5. افتح الرابط وتحقق من الصفحات الخمس، ومن البحث والتصفية، ومن صفحة مورد واحد على الأقل.

## بديل: Cloudflare Pages

1. ادخل إلى **Workers & Pages ← Create ← Pages ← Upload assets** (لا يحتاج ربط Git).
2. سمِّ المشروع `oer-guide` وارفع مجلد `oer-guide` كما هو، ثم **Deploy**.
3. يظهر الرابط بالصيغة `https://oer-guide.pages.dev`.

> لا يحتاج الموقع إلى أي إعدادات بناء (Build command فارغ)، ولا مفاتيح API، ولا خدمات مدفوعة.

## الحقوق

- **نصوص الدليل** (الأوصاف والتصنيف والشروح): CC BY 4.0.
- **كل مورد مدرج** يحتفظ بترخيصه الأصلي المبيّن في صفحته.
- **الأصول البصرية:** انظر `CREDITS.md`.

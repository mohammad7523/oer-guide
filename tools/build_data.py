#!/usr/bin/env python3
"""يولّد data/resources.js وقائمة <noscript> في index.html من data/resources.json.
الاستخدام: python3 tools/build_data.py   (لا يحتاج مكتبات خارجية)"""
import json, html, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((root / 'data' / 'resources.json').read_text(encoding='utf-8'))
(root / 'data' / 'resources.js').write_text(
    '/* ملف مولّد آليًا من resources.json — لا تعدّله يدويًا (tools/build_data.py) */\n'
    'window.OER_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
E = html.escape
rows = ''.join(
    f'<tr><td><a href="{E(r["url"])}">{E(r["name_ar"])}</a></td><td>{E(r["provider"])}</td>'
    f'<td>{E(r["domain"])}</td><td dir="ltr"><a href="{E(r["license"]["deed_url"])}">{E(r["license"]["label"])}</a></td></tr>'
    for r in data['resources'])
block = ('<!--NOSCRIPT--><noscript><div class="wrap" style="padding:30px 0">'
         '<h1>دليل الموارد التعليمية المفتوحة</h1><p>يعمل البحث والتصفية بتفعيل JavaScript. هذه قائمة الموارد كاملة:</p>'
         '<table class="ttable"><thead><tr><th>المورد</th><th>الجهة</th><th>المجال</th><th>الترخيص</th></tr></thead>'
         f'<tbody>{rows}</tbody></table></div></noscript><!--/NOSCRIPT-->')
idx = root / 'index.html'
s = idx.read_text(encoding='utf-8')
s = re.sub(r'<!--NOSCRIPT-->.*?(<!--/NOSCRIPT-->|(?=\n</main>))', lambda m: block, s, flags=re.S)
idx.write_text(s, encoding='utf-8')
print('resources:', len(data['resources']))

"""Refresh locally hosted web fonts. Requires: pip install fonttools brotli py7zr.
Normal site builds use the checked-in WOFF2 files and do not need Python/network.
"""
from pathlib import Path
import urllib.request, argparse
from fontTools import subset
import py7zr
ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / 'modern-docs/test-results/font-sources'
OUT = ROOT / 'modern-docs/public/vendor'
CACHE.mkdir(parents=True, exist_ok=True)
def download(url, name):
    target = CACHE / name
    if not target.exists() or target.stat().st_size == 0:
        temporary = target.with_suffix(target.suffix + '.download')
        with urllib.request.urlopen(url, timeout=90) as response, temporary.open('wb') as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
        temporary.replace(target)
    return target
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--font', choices=['all','sans','mono'], default='all')
args = parser.parse_args()
fonts = []
if args.font in ('all','sans'):
    noto = download('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf', 'NotoSansSC.ttf')
    fonts.append((noto, 'KodDocsSans.woff2', 'Kod Docs Sans'))
if args.font in ('all','mono'):
    sarasa = download('https://github.com/be5invis/Sarasa-Gothic/releases/download/v1.0.42/SarasaMonoSC-TTF-Unhinted-1.0.42.7z', 'Sarasa.7z')
    with py7zr.SevenZipFile(sarasa) as archive:
        regular = next(name for name in archive.getnames() if name.endswith('SarasaMonoSC-Regular.ttf'))
        archive.extract(path=CACHE, targets=[regular])
    fonts.append((CACHE/regular, 'KodDocsMono.woff2', 'Kod Docs Mono'))
text = ''.join(chr(i) for i in range(32, 256))
for folder in ['start','setup','user','admin','guide','modern-docs','_layouts','_includes']:
    for file in (ROOT/folder).rglob('*'):
        if any(part in {'dist','static-dist','test-results','releases','vendor'} for part in file.parts): continue
        if file.is_file() and file.suffix in {'.md','.html','.mjs','.json'}:
            text += file.read_text(encoding='utf-8-sig')
codepoints = set(map(ord,text))
for source, output, family in fonts:
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    font = subset.load_font(str(source), options)
    available = set(font.getBestCmap())
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=codepoints & available)
    sub.subset(font)
    for record in font['name'].names:
        if record.nameID in (1,4,6,16):
            record.string = (family.replace(' ','') if record.nameID == 6 else family).encode(record.getEncoding())
    subset.save_font(font, str(OUT/output), options)
    print(output, (OUT/output).stat().st_size, 'bytes;', len(codepoints & available), 'characters')

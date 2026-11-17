# Catalogue test fonts

These are test-only, unmodified WOFF2 files; production font imports and assets are unaffected.
All 16 files (225,580 bytes) are required by the verified stylesheets: six Rubik subset files,
four Tomorrow files, and six Geist Mono subset files. Shared Rubik variable binaries are reused
for the 400/500/600 CSS faces. No redundant copies are included.

## Provenance and integrity

The files were originally emitted by Next.js 16.2.12 `next/font/google` from Google Fonts in
the successful `catalogue-pIuj5G` diagnostic run. They were subsequently verified in
`font-feasibility-20261117T150516Z-706de8b3`: Fontconfig identified the actual families/styles,
WOFF2 headers/lengths were checked, and all 16 emitted files matched the retained SHA-256 values.
Those historical runtime names are provenance only; the runner never reads those directories.

The original individual CDN URLs were not retained. We do not claim these subsets are
byte-identical to current upstream TTF releases. Embedded metadata inspected through installed
FreeType identifies Rubik version 2.300 (variable binaries named Rubik Light), Tomorrow version
2.002 (Bold/Bold Italic), and Geist Mono version 1.701. These names, copyright holders and OFL
license URLs agree with the corresponding upstream projects.

`manifest.json` records each asset's family, length and SHA-256; each stylesheet and license
also has a verification hash. Startup checks all of them without downloading anything.
The fixture is self-contained once added to version control and normal workspace dependencies
are installed. No ignored runtime, font cache, Fontconfig executable or external service is
needed during normal execution.

## Redistribution notices

All font binaries remain under **SIL Open Font License 1.1**. The upstream licenses permit
bundling/redistribution with software while retaining copyright and license notices; the fonts
must not be sold by themselves or relicensed. We retain the complete family-specific notices:

- Rubik: Copyright 2015 The Rubik Project Authors (https://github.com/googlefonts/rubik).
  See [rubik-OFL.txt](licenses/rubik-OFL.txt).
- Tomorrow: Copyright 2019 The Tomorrow Project Authors (https://github.com/MonicaRizzolli/Tomorrow).
  See [tomorrow-OFL.txt](licenses/tomorrow-OFL.txt).
- Geist Mono: Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font.git).
  See [geistmono-OFL.txt](licenses/geistmono-OFL.txt).

License text was retrieved from google/fonts commit
`7af0d90b4d532ffa4b041937b560c6df4e7b1e95`; exact source URLs and hashes are in the manifest.
Only trailing spaces and EOF whitespace in license text were normalized; upstream byte hashes
are retained separately from local hashes. Copyright notices and license terms are unchanged.
No binary conversion, subsetting, modification or font renaming was performed by HotLap.

## Version-specific response contract

The CSS snapshots preserve the successful run's weights, styles and Unicode ranges. Latin
comments preserve preload selection; other coverage remains unchanged. Only font URLs use
`__FONT_ORIGIN__` placeholders. The runner substitutes its owned loopback origin and generates
a CommonJS full-Google-stylesheet-URL-to-CSS mapping for `NEXT_FONT_GOOGLE_MOCKED_RESPONSES`.
Turbopack 16.2.12 mocks the stylesheet but still fetches binaries over HTTP, hence the owned
read-only binary listener. No live Google Fonts fallback is configured.

Changes to Next.js or production font options require reviewing the hook, URLs, coverage and
fixture integrity together. Update hashes only after verifying replacement assets and notices;
do not use updated hashes to hide corruption.

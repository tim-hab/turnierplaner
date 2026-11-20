const gulp = require('gulp');
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

gulp.task('default', async () => {
  const browserDir = path.resolve('dist/turnierplaner/browser');
  const outputDir = path.resolve('dist-single');
  const mainFile = fs.readdirSync(browserDir).find((file) => /^main-[^.]+\.js$/.test(file));

  if (!mainFile) {
    throw new Error('Angular main bundle was not found.');
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const bundle = await esbuild.build({
    entryPoints: [path.join(browserDir, mainFile)],
    bundle: true,
    format: 'iife',
    splitting: false,
    minify: true,
    write: false,
  });
  const script = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

  let html = fs.readFileSync(path.join(browserDir, 'index.html'), 'utf8');
  html = html.replace(/<link rel="modulepreload" href="[^"]+"><\/?link>/gi, '');
  html = html.replace(/<link rel="modulepreload" href="[^"]+">/gi, '');
  html = html.replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script src="[^"]+"[^>]*><\/script>/gi, '');
  html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi, '');
  html = html.replace(
    /(<app-root><\/app-root>)/i,
    () => `<app-root></app-root>\n<script>${script}</script>`,
  );

  const assetDirs = [
    path.join(browserDir, 'media'),
    path.join(browserDir, 'fonts'),
  ];

  for (const assetDir of assetDirs) {
    if (!fs.existsSync(assetDir)) continue;
    for (const file of fs.readdirSync(assetDir, { withFileTypes: true })) {
      if (!file.isFile()) continue;
      const mimeType = file.name.endsWith('.woff2')
        ? 'font/woff2'
        : file.name.endsWith('.ttf')
          ? 'font/ttf'
          : 'application/octet-stream';
      const dataUri = `data:${mimeType};base64,${fs.readFileSync(path.join(assetDir, file.name)).toString('base64')}`;
      html = html.replaceAll(`"./media/${file.name}"`, `"${dataUri}"`);
      html = html.replaceAll(`"./fonts/${file.name}"`, `"${dataUri}"`);
      html = html.replaceAll(`url("./media/${file.name}")`, `url("${dataUri}")`);
      html = html.replaceAll(`url("./fonts/${file.name}")`, `url("${dataUri}")`);
    }
  }

  const regularFont = path.resolve('src/fonts/DejaVuSans.ttf');
  const boldFont = path.resolve('src/fonts/DejaVuSans-Bold.ttf');
  const iconFont = path.resolve('src/fonts/material-icons.woff2');
  if (fs.existsSync(regularFont) && fs.existsSync(boldFont) && fs.existsSync(iconFont)) {
    const regularUri = `data:font/ttf;base64,${fs.readFileSync(regularFont).toString('base64')}`;
    const boldUri = `data:font/ttf;base64,${fs.readFileSync(boldFont).toString('base64')}`;
    const iconUri = `data:font/woff2;base64,${fs.readFileSync(iconFont).toString('base64')}`;
    const fontStyles = `<style>
@font-face{font-family:'Turnierplaner Sans';src:url('${regularUri}') format('truetype');font-style:normal;font-weight:300 500;font-display:swap}
@font-face{font-family:'Turnierplaner Sans';src:url('${boldUri}') format('truetype');font-style:normal;font-weight:700;font-display:swap}
@font-face{font-family:'Material Icons';src:url('${iconUri}') format('woff2');font-style:normal;font-weight:400;font-display:block}
.material-icons,.material-icons-outlined,.material-icons-round,.material-icons-sharp,.material-icons-two-tone{font-family:'Material Icons';font-weight:400;font-style:normal;font-size:24px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased;font-feature-settings:'liga'}
</style>`;
    html = html.replace(/(<app-root><\/app-root>)/i, `${fontStyles}\n$1`);
  }

  const faviconPath = path.resolve('public/favicon.ico');
  if (fs.existsSync(faviconPath)) {
    const favicon = fs.readFileSync(faviconPath).toString('base64');
    html = html.replace(
      '<link rel="icon" type="image/x-icon" href="favicon.ico">',
      `<link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,${favicon}">`,
    );
  }

  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
});

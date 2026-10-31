# Deploying Seed Classifier

The app is a **static site** in [`deploy/`](deploy/) — `index.html`,
`preprocess.js`, `seed_classifier.onnx`, `classes.json`, `model_meta.json`, and
the vendored ONNX Runtime in `deploy/vendor/`. No build step is required.

> **Important:** the app must be served over **HTTP(S)**. Opening `index.html`
> directly (`file://`) is blocked by the browser. Any static host below works
> because it serves correct MIME types for `.wasm` / `.mjs`.

---

## Option 1 — Netlify Drop (fastest, no CLI)

1. Open <https://app.netlify.com/drop>
2. Drag the **`deploy`** folder onto the page.
3. You get a live URL like `https://<random>.netlify.app` — share it or open it
   on your phone.

`netlify.toml` (repo root) is included if you later connect the repo instead.

---

## Option 2 — Vercel (CLI)

```bash
npx vercel --prod
```

Run this from the repository root. On first use, Vercel asks you to log in and
link or create a project. The root `vercel.json` publishes `deploy/`, serves
the private chat proxy in `api/chat.js`, and sets the required response
headers. Before deploying, add `GROQ_API_KEY` in the Vercel project’s
**Settings → Environment Variables**; never put the key in browser code or
commit it to the repository. Redeploy after adding or rotating the secret.
The command prints the public HTTPS URL; open that URL in Safari on your
iPhone, then choose **Share → Add to Home Screen**.

The Groq chat proxy is available on the Vercel deployment only. GitHub Pages
and other static hosts do not run the server-side function, so chat uses its
local guidance fallback there.

If a Groq API key was previously shared or exposed, revoke it in Groq and
create a replacement before setting `GROQ_API_KEY` in Vercel.

---

## Option 3 — GitHub Pages

A workflow is included at `.github/workflows/deploy-pages.yml`.

1. Push the repository to GitHub (`main` branch).
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push touching `deploy/` publishes it to
   `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so the `vendor/` assets are served untouched.

---

## Option 4 — Cloudflare Pages / Render / Surge

- **Cloudflare Pages:** connect the repo, set **Build output directory** to
  `deploy`, leave the build command empty. `deploy/_headers` is picked up.
- **Surge:** `npx surge deploy <your-domain>.surge.sh`

---

## Option 5 — Run locally (and on your phone, same Wi-Fi)

```bash
python tools/serve_deploy.py --lan
```

- Desktop: `http://localhost:8080/`
- Phone: the command prints something like `http://172.16.102.109:8080/` —
  open that on a phone connected to the **same Wi-Fi**.

On Windows you can also double-click **`serve.bat`**.

---

## Option 6 — Temporary public link (quick demo)

```bash
# Cloudflare quick tunnel (download cloudflared once)
cloudflared tunnel --url http://localhost:8080

# or via npm
npx localtunnel --port 8080
```

Both print a public `https://…` URL. These are temporary and stop when the
process ends.

---

## Option 7 — Installable Android and iOS apps

The app can be packaged for Android and iOS with Capacitor. Both native apps
package the existing `deploy/` interface and ONNX model, and the classifier
continues to run locally on the phone. The same responsive web app can also be
installed directly from Safari on iOS or Chrome on Android without an APK.

### Android APK

Requirements: Node.js/npm, Android Studio with the Android SDK, and a Java
Development Kit supported by the installed Android Gradle Plugin.

```bash
npm install
npm run android:add       # first time only
npm run android:sync
npm run android:open      # build and install from Android Studio
```

To build a debug APK from the repository root after adding the Android
platform, run:

```bash
cd android
.\gradlew.bat assembleDebug
```

The APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`. Use Android Studio's
**Build → Generate Signed Bundle / APK** for a release you intend to
distribute. Re-run `npm run android:sync` after changing files under `deploy/`.

The Android project is generated locally by Capacitor and is not committed
until the platform is added. This keeps the generated Gradle project and
platform dependencies out of source control by default.

### iOS app

Requirements: a Mac with Xcode installed and configured. Apple requires Xcode
to build and sign an iOS app; an iOS IPA cannot be produced on Windows.
Before building, add `NSCameraUsageDescription` to the iOS app's
`Info.plist` with a user-facing explanation such as "Seed Classifier uses the camera to
photograph a maize seed for classification."

```bash
npm install
npm run ios:add            # first time only, on macOS
npm run ios:sync
npm run ios:open           # build, sign, and install from Xcode
```

For either native platform, run the matching `*:sync` command after changing
files under `deploy/`. Native distribution requires signing with the relevant
platform's developer tools.

---

## Hosting checklist

- [ ] Only the `deploy/` folder is published (it is self-contained).
- [ ] `.wasm` served as `application/wasm`, `.mjs` as `text/javascript`
      (host configs above handle this).
- [ ] HTTPS enabled (required for camera via `getUserMedia`; `localhost` is
      exempt).
- [ ] Total payload ≈ 40 MB (mostly the ~11 MB ONNX Runtime WASM + ~3 MB model).

### Install on iPhone

After publishing the `deploy/` folder to an HTTPS host, open its public URL in
Safari on the iPhone. Tap **Share → Add to Home Screen → Add**. The installed
home-screen app is named **Seed Classifier** and works offline after its assets
have loaded. iPhone installation uses the website's public URL; it is not an
App Store download or an APK.

## Updating the model

After retraining, copy the artifacts and redeploy:

```bash
copy model\seed_classifier.onnx deploy\
copy model\classes.json        deploy\
copy model\model_meta.json     deploy\
```

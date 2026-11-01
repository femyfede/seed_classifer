/*
 * Centralised UI strings for Seed Classifier.
 * Agronomic content lives in guide-data.js, in both languages.
 */
export const LANGUAGES = {
  en: { label: "English", short: "EN", locale: "en-GB" },
  sw: { label: "Kiswahili", short: "SW", locale: "sw-TZ" },
};

export const TRANSLATIONS = {
  en: {
    appName: "Seed Classifier",
    skipToContent: "Skip to content",
    navHome: "Home",
    navScan: "Scan",
    navGuide: "Seed Guide",
    navHistory: "History",
    settings: "Settings",
    openSettings: "Open settings",
    installApp: "Install app",
    close: "Close",
    back: "Back",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    remove: "Remove",
    retake: "Retake",
    save: "Save",
    done: "Done",
    refresh: "Refresh",
    language: "Language",
    english: "English",
    kiswahili: "Kiswahili",
    online: "Ready to scan",
    offline: "Offline mode",
    offlineReady: "Offline ready",
    updateAvailable: "A new version of Seed Classifier is ready.",
    updateNow: "Update now",
    settingsSaved: "Settings saved",
    loading: "Loading…",

    tagline: "Know Your Seeds. Grow with Confidence.",
    heroEyebrow: "Maize seed intelligence",
    homeTitle: "Choose the Right Maize Seed",
    homeDescription:
      "Identify the supported maize seed categories from a clear photo, then explore practical growing guidance for your region of Tanzania.",
    scanSeeds: "Scan Maize Seeds",
    exploreGuide: "Explore Seed Guide",
    offlinePill: "Works offline",
    offlinePillDetail: "After the app and model are downloaded",
    trustLocal: "Photos stay on your phone. No image uploads.",
    heroAlt: "Illustration of a maize cob in a green field",

    statsTitle: "At a glance",
    statOnDevice: "On-device AI",
    statOnDeviceBody: "Your photo is analysed locally.",
    statClasses: "4 categories",
    statClassesBody: "Asili, Chotara, Huria and unrelated.",
    statOffline: "Built for offline",
    statOfflineBody: "Scan again without a network.",

    howItWorks: "How it works",
    step1Title: "Photograph a kernel",
    step1Body: "Use one seed on a plain surface with even lighting.",
    step2Title: "Identify on device",
    step2Body: "The AI model runs inside your browser.",
    step3Title: "Read local guidance",
    step3Body: "Explore growing notes for Tanzanian conditions.",

    exploreTypes: "Explore seed types",
    exploreTypesBody:
      "Each category is a broad seed group, not a guarantee of a specific variety or certification.",
    openCategory: "Open {name} guide",
    readGuide: "Read the guide",

    guideRegionTitle: "Growing Guide for Tanzania",
    guideRegionBody:
      "Choose your region for general soil, rainfall, seasonal and seed-selection guidance.",
    openRegionGuide: "Choose your region",
    quickRegions: "Popular regions",

    installTitle: "Install Seed Classifier",
    installBody:
      "Add Seed Classifier to your home screen for quick, full-screen access and offline use.",
    installButton: "Install app",
    installInstalled: "Seed Classifier is installed",
    installInstalledBody: "Open it from your home screen like any other app.",
    privacyNoteHome:
      "Seed Classifier runs on your device. Scan history and photos stay in your browser unless you delete them.",
    footerDisclaimer:
      "Seed Classifier supports decisions; it does not certify seed authenticity, quality or suitability. Always check the seed label and local extension advice.",

    scanTitle: "Scan maize seeds",
    scanSubtitle:
      "Photograph one maize kernel clearly. The model identifies the seed category on your device.",
    modelReady: "Model ready",
    modelLoading: "Loading AI model…",
    modelFailed: "Model unavailable",
    modelLocal: "Runs locally",
    cameraStart: "Use camera",
    cameraHint:
      "Place one kernel on a plain, contrasting surface. Fill most of the frame with the seed.",
    capturePhoto: "Capture photo",
    switchCamera: "Switch camera",
    closeCamera: "Close camera",
    cameraOpening: "Opening camera…",
    cameraReady: "Camera ready.",
    gallery: "Choose photo",
    takePhotoFallback: "Take photo",
    chooseAnother: "Choose another",
    uploadTitle: "Add a seed photo",
    uploadBody: "Take a photo now or choose one already saved on your phone.",
    dragDrop: "You can also drag and drop an image here on a computer.",
    previewTitle: "Ready to identify",
    previewHint:
      "Check that the seed is clear and in focus before running the model.",
    previewAlt: "Selected maize seed photo",
    identifySeeds: "Identify Seeds",
    identifyAgain: "Identify again",
    scanningTitle: "Analysing your photo…",
    scanningBody: "This can take a few seconds while the model starts.",

    resultTitle: "Classification result",
    predictedClass: "Seed category",
    confidence: "Model confidence",
    confidenceDisclaimer:
      "This is the model's confidence, not proof that a seed is genuine, certified or safe to plant.",
    lowConfidence:
      "Confidence is low. Try another photo with one seed, better light and a plain background.",
    lowConfidenceExplainer:
      "The model is uncertain about this seed. Try photographing with better lighting or a clearer background.",
    retryPhotography: "Retry with better photo",
    classProbabilities: "All category scores",
    resultImageAlt: "Photo used for this classification",
    unrelatedTitle: "This does not look like a supported seed",
    unrelatedBody:
      "The image does not clearly match the Asili, Chotara or Huria categories used by this model. Photograph one maize kernel on a plain surface, in focus and with even light, then try again.",
    scanAnother: "Scan another",
    exploreCategory: "Explore {name} guide",
    saveToHistory: "Save to history",
    saveConsentTitle: "Keep this result?",
    saveConsentBody:
      "History is stored only on this device. Choose whether to keep just the summary or include the photo.",
    saveSummary: "Keep summary only",
    saveWithPhoto: "Keep summary + photo",
    dontSave: "Don't save",
    savedSummary: "Summary saved to history",
    savedWithPhoto: "Result and photo saved to history",
    notSaved: "Result not saved",

    tipsTitle: "Tips for a better scan",
    tip1: "Use one maize kernel, not a handful.",
    tip2: "Use a plain background that contrasts with the seed.",
    tip3: "Use even daylight and avoid deep shadows.",
    tip4: "Hold the phone steady and let the seed fill the frame.",
    scanPrivacy:
      "The image is processed on this device. It is not uploaded to a server.",
    directCameraNote:
      "Direct camera access needs HTTPS or localhost. You can always upload a photo instead.",
    errorGeneric: "Something went wrong. Please try again.",
    errorModel:
      "The AI model could not be loaded. Check your connection, then retry. If it keeps failing, serve the app over HTTPS or localhost.",
    errorImage:
      "This image could not be opened. Try a JPEG or PNG photo from your camera or gallery.",
    errorFileType: "Please choose an image file.",
    errorFileSize: "That image is too large. Choose a photo smaller than 20 MB.",
    errorInference: "The model could not process this image. Try a different photo.",
    errorNoImage: "Choose or take a photo first.",
    errorCameraPermission:
      "Camera permission was denied. Allow camera access in your browser settings, or choose a photo instead.",
    errorCameraNotFound: "No camera was found on this device. Choose a photo instead.",
    errorCameraBusy:
      "The camera is unavailable, possibly because another app is using it. Close the other app or choose a photo.",
    errorCameraInsecure:
      "Camera access requires HTTPS or localhost. Open the app through a secure address, or choose a photo instead.",
    errorCameraUnsupported:
      "This browser does not support direct camera access. Choose a photo from your device instead.",
    retry: "Retry",
    tryAgain: "Try again",
    modelLoadingRuntime: "Starting the AI runtime…",
    modelLoadingModel: "Loading the maize seed model…",
    debugScores: "Model scores (debug)",

    guideTitle: "Seed guide",
    guideSubtitle:
      "Understand the three supported seed groups and the conditions that matter in Tanzania.",
    guideSeedTypes: "Seed types",
    guideRegions: "Growing guide",
    guideChooseCategory: "Choose a seed category",
    whatItMeans: "What this category means",
    classDisclaimer:
      "A prediction describes a broad visual category. It does not identify the exact variety, certify the seed, or predict yield.",
    officialNote:
      "For planting decisions, check the certified seed label and confirm recommendations with TOSCI or your local agricultural extension officer.",
    sectionOverview: "Overview & characteristics",
    sectionRegions: "Regions & ecological conditions",
    sectionSoil: "Soil requirements",
    sectionClimate: "Climate & rainfall",
    sectionWater: "Water & irrigation",
    sectionPlanting: "Planting tips & spacing",
    sectionFertilizer: "Fertilizer & nutrients",
    sectionPests: "Common diseases & pests",
    sectionHarvest: "Harvesting & storage",
    sectionLimitations: "Limitations & recommendations",
    categoryAsiliShort:
      "Traditional and farmer-saved maize types with wide local variation.",
    categoryChotaraShort:
      "Hybrid maize types bred from selected parent lines; fresh seed is normally bought each season.",
    categoryHuriaShort:
      "Open-pollinated improved types; seed can be saved with careful selection and isolation.",
    categoryAsili: "Asili",
    categoryChotara: "Chotara",
    categoryHuria: "Huria",
    categoryUnrelated: "Unrelated",

    regionGuideTitle: "Growing guide for your region",
    regionGuideSubtitle:
      "This is general guidance for Tanzanian conditions. It is not a variety recommendation.",
    regionSearchLabel: "Search Tanzanian regions",
    regionSearchPlaceholder: "Type a region name…",
    regionNoResults: "No region matches your search.",
    regionSelectHint: "Select a region to see its guidance.",
    regionListLabel: "Tanzanian regions",
    regionSelected: "Selected region",
    changeRegion: "Change region",
    regionEcologicalZone: "Ecological zone",
    regionLocalNote: "Local note",
    regionPlantingConditions: "Suitable planting conditions",
    regionSoilRainfall: "Soil and rainfall guidance",
    regionSeason: "Seasonal considerations",
    regionSeedAdvice: "Seed-selection advice",
    regionCaveat:
      "Suitability depends on the specific variety, its maturity period, altitude, soil and the current season. Confirm variety choices with a certified seed dealer or extension officer.",
    regionSeedWarning:
      "A seed category such as Asili, Chotara or Huria is not enough to choose the best variety for your region.",
    regionNotFound: "Region not found.",

    historyTitle: "Scan history",
    historySubtitle:
      "Results saved on this device. Photos are kept only when you choose to include them.",
    historyEmptyTitle: "No saved scans yet",
    historyEmptyBody:
      "After identifying a seed, choose whether to save the summary or the summary with its photo.",
    historyStartScan: "Scan your first sample",
    historyCount: "{count} saved scans",
    clearHistory: "Clear history",
    deleteEntry: "Delete this result",
    viewResult: "View result",
    historyNoPhoto: "Photo not saved",
    historyLocalNote:
      "History is stored in this browser only. Clearing browser data may remove it.",
    savedOn: "Saved {date}",
    clearHistoryTitle: "Clear all history?",
    clearHistoryBody:
      "This permanently removes every saved scan and any saved photos from this device. This cannot be undone.",
    clearHistoryConfirm: "Clear history",
    deleteEntryTitle: "Delete this result?",
    deleteEntryBody: "This saved result and its photo will be removed from this device.",
    deleteConfirm: "Delete result",
    historyDetailTitle: "Saved scan",
    historyLimitNote:
      "Up to 50 results are kept on this device. Older results are removed automatically.",

    settingsTitle: "Settings",
    settingsSubtitle: "Language, offline use, privacy and local data.",
    languageSectionTitle: "Language",
    languageSectionBody: "The interface changes immediately and keeps your current scan.",
    offlineSectionTitle: "Offline & storage",
    offlineSectionBody:
      "Core screens, the seed model and the AI runtime can be stored on your device for offline scanning.",
    statusOnline: "Connected & ready",
    statusOffline: "Offline mode active",
    statusOnlineBody: "Everything is working smoothly. Prepare the offline pack to scan without internet.",
    statusOfflineBody:
      "Seed Classifier continues to work if the app shell and model have already been downloaded.",
    prepareOffline: "Prepare offline use",
    offlinePreparing: "Preparing offline files…",
    offlineReadyYes: "Offline pack ready",
    offlineReadyNo: "Offline pack incomplete",
    offlineReadyToast: "Offline files are ready on this device",
    offlineFailedToast: "Some offline files could not be saved. Check your connection and retry.",
    storageUsed: "Approximate storage used: {size}",
    storageUnknown: "Storage usage is not available in this browser.",
    offlineShell: "App screens",
    offlineModel: "Seed model",
    offlineRuntime: "AI runtime",
    offlineAssetReady: "Ready",
    offlineAssetMissing: "Missing",
    installSectionTitle: "Install Seed Classifier",
    installSectionBody:
      "Installing adds Seed Classifier to your home screen and opens it in its own window.",
    installIosTitle: "On iPhone or iPad",
    installIosBody:
      "Open Seed Classifier in Safari, tap the Share button, then choose “Add to Home Screen”.",
    installAndroidTitle: "On Android",
    installAndroidBody:
      "Open the browser menu and choose “Install app” or “Add to Home screen”. If an install button appears above, you can use it.",
    installDesktopTitle: "On a computer",
    installDesktopBody:
      "Use the install icon in the browser address bar, or the browser menu, to install Seed Classifier.",
    installUnavailable:
      "This browser has not offered an automatic install prompt. Follow the instructions for your device.",
    installedStatus: "Installed on this device",
    notInstalledStatus: "Not installed yet",
    privacyTitle: "Privacy",
    privacyBody:
      "Seed Classifier is designed to keep your scan on your device. The classifier runs locally using WebAssembly and ONNX Runtime.",
    privacyBullet1: "Photos are not uploaded to a server.",
    privacyBullet2: "No account or sign-in is required.",
    privacyBullet3: "No external API is needed for classification.",
    privacyBullet4: "History and photos stay in your browser until you delete them.",
    dataTitle: "Local data",
    dataBody:
      "Manage the classification summaries, photos and preferences stored by Seed Classifier.",
    clearHistoryBtn: "Clear scan history",
    clearAllBtn: "Reset Seed Classifier on this device",
    clearAllTitle: "Reset Seed Classifier?",
    clearAllBody:
      "This removes history, preferences and the offline cache from this device. The app will need an internet connection to download the model again.",
    clearAllConfirm: "Reset app",
    dataCleared: "Local Seed Classifier data was cleared",
    historyCleared: "Scan history cleared",
    modelTitle: "About the model",
    modelBody:
      "The classifier is a small convolutional network exported to ONNX and run locally. It was trained on close-up images of individual maize kernels.",
    modelSizeLabel: "Input size",
    modelClassesLabel: "Categories",
    modelAccuracyLabel: "Held-out test accuracy",
    modelAccuracyNote:
      "Project evaluation on seed-disjoint test data. Real-world accuracy varies with lighting, background and the seed itself.",
    aboutTitle: "About Seed Classifier",
    aboutBody:
      "A mobile-first maize seed classifier and growing guide for Tanzania.",
    version: "Version",
    settingsCameraNote:
      "Direct camera access requires HTTPS or localhost. Photo upload works without camera permission.",
    debugMode: "Debug mode",
    debugModeBody: "Show raw model scores and technical details.",

    cameraPermissionTitle: "Camera access",
    cameraUnsupportedTitle: "Camera not supported",
    cameraErrorTitle: "Camera problem",
    cameraRetry: "Try camera again",
    navChat: "Chat",
    chatTitle: "Seed AI Assistant",
    chatSubtitle: "Ask me anything about maize seeds, growing, or your scan results.",
    clearChat: "Clear chat",
    chatInputPlaceholder: "Ask a question about seeds or growing…",
    chatInputLabel: "Message the Seed Assistant",
    sendChatMessage: "Send message",
  },
  sw: {
    appName: "Seed Classifier",
    skipToContent: "Ruka hadi maudhui",
    navHome: "Nyumbani",
    navScan: "Pima",
    navGuide: "Mwongozo",
    navHistory: "Historia",
    settings: "Mipangilio",
    openSettings: "Fungua mipangilio",
    installApp: "Sakinisha programu",
    close: "Funga",
    back: "Rudi",
    cancel: "Ghairi",
    confirm: "Thibitisha",
    delete: "Futa",
    remove: "Ondoa",
    retake: "Piga tena",
    save: "Hifadhi",
    done: "Tayari",
    refresh: "Sasisha",
    language: "Lugha",
    english: "Kiingereza",
    kiswahili: "Kiswahili",
    online: "Tayari kupima",
    offline: "Hali bila mtandao",
    offlineReady: "Tayari bila intaneti",
    updateAvailable: "Toleo jipya la Seed Classifier lipo tayari.",
    updateNow: "Sasisha sasa",
    settingsSaved: "Mipangilio imehifadhiwa",
    loading: "Inapakia…",

    tagline: "Fahamu Mbegu Zako. Lima kwa Ujasiri.",
    heroEyebrow: "Akili ya mbegu za mahindi",
    homeTitle: "Chagua Mbegu Sahihi ya Mahindi",
    homeDescription:
      "Tambua aina za mbegu za mahindi zinazotumika kupima kwa picha iliyo wazi, kisha pata mwongozo wa kilimo kwa mkoa wako Tanzania.",
    scanSeeds: "Pima Mbegu za Mahindi",
    exploreGuide: "Vinjari Mwongozo wa Mbegu",
    offlinePill: "Inafanya kazi bila intaneti",
    offlinePillDetail: "Baada ya programu na modeli kupakiwa",
    trustLocal: "Picha zinabaki kwenye simu yako. Hazipakiwi kwenye seva.",
    heroAlt: "Mchoro wa gunzi la mahindi kwenye shamba la kijani",

    statsTitle: "Kwa muhtasari",
    statOnDevice: "AI kwenye kifaa",
    statOnDeviceBody: "Picha yako inachambuliwa hapa hapa.",
    statClasses: "Aina 4",
    statClassesBody: "Asili, Chotara, Huria na isiyohusiana.",
    statOffline: "Imeundwa kwa bila intaneti",
    statOfflineBody: "Pima tena bila mtandao.",

    howItWorks: "Inavyofanya kazi",
    step1Title: "Piga picha ya mbegu",
    step1Body: "Tumia mbegu moja kwenye uso tambarare na mwanga wa kutosha.",
    step2Title: "Tambua kwenye kifaa",
    step2Body: "Modeli ya AI inafanya kazi ndani ya kivinjari chako.",
    step3Title: "Soma mwongozo wa eneo",
    step3Body: "Vinjari vidokezo vya kilimo kwa hali ya Tanzania.",

    exploreTypes: "Vinjari aina za mbegu",
    exploreTypesBody:
      "Kila aina ni kundi pana la mbegu, si uthibitisho wa aina mahususi au cheti.",
    openCategory: "Fungua mwongozo wa {name}",
    readGuide: "Soma mwongozo",

    guideRegionTitle: "Mwongozo wa Kilimo Tanzania",
    guideRegionBody:
      "Chagua mkoa wako upate mwongozo wa jumla kuhusu udongo, mvua, msimu na uteuzi wa mbegu.",
    openRegionGuide: "Chagua mkoa wako",
    quickRegions: "Mikoa inayotumika sana",

    installTitle: "Sakinisha Seed Classifier",
    installBody:
      "Weka Seed Classifier kwenye skrini yako ya nyumbani kwa ufikiaji wa haraka na matumizi bila intaneti.",
    installButton: "Sakinisha programu",
    installInstalled: "Seed Classifier imesakinishwa",
    installInstalledBody: "Ifungue kutoka skrini ya nyumbani kama programu nyingine.",
    privacyNoteHome:
      "Seed Classifier inafanya kazi kwenye kifaa chako. Historia na picha zinabaki kwenye kivinjari chako hadi uzifute.",
    footerDisclaimer:
      "Seed Classifier inasaidia maamuzi; haithibitishi uhalali, ubora au ufaafu wa mbegu. Kila mara angalia lebo ya mbegu na ushauri wa afisa ugani.",

    scanTitle: "Pima mbegu za mahindi",
    scanSubtitle:
      "Piga picha ya mbegu moja ya mahindi kwa uwazi. Modeli inatambua aina ya mbegu kwenye kifaa chako.",
    modelReady: "Modeli iko tayari",
    modelLoading: "Inapakia modeli ya AI…",
    modelFailed: "Modeli haipatikani",
    modelLocal: "Inafanya kazi hapa",
    cameraStart: "Tumia kamera",
    cameraHint:
      "Weka mbegu moja kwenye uso tambarare wenye rangi tofauti. Jaza sehemu kubwa ya picha kwa mbegu.",
    capturePhoto: "Piga picha",
    switchCamera: "Badilisha kamera",
    closeCamera: "Funga kamera",
    cameraOpening: "Inafungua kamera…",
    cameraReady: "Kamera iko tayari.",
    gallery: "Chagua picha",
    takePhotoFallback: "Piga picha",
    chooseAnother: "Chagua nyingine",
    uploadTitle: "Ongeza picha ya mbegu",
    uploadBody: "Piga picha sasa au chagua picha iliyohifadhiwa kwenye simu yako.",
    dragDrop: "Kwenye kompyuta unaweza pia kuburuta na kuangusha picha hapa.",
    previewTitle: "Tayari kupima",
    previewHint:
      "Hakikisha mbegu iko wazi na inaonekana vyema kabla ya kuanzisha modeli.",
    previewAlt: "Picha ya mbegu ya mahindi iliyochaguliwa",
    identifySeeds: "Tambua Mbegu",
    identifyAgain: "Tambua tena",
    scanningTitle: "Inachambua picha yako…",
    scanningBody: "Inaweza kuchukua sekunde chache modeli inapoanza.",

    resultTitle: "Matokeo ya utambuzi",
    predictedClass: "Aina ya mbegu",
    confidence: "Uhakika wa modeli",
    confidenceDisclaimer:
      "Huu ni uhakika wa modeli, si uthibitisho kuwa mbegu ni halisi, imethibitishwa au salama kupandwa.",
    lowConfidence:
      "Uhakika ni mdogo. Jaribu picha nyingine yenye mbegu moja, mwanga bora na mandhari tambarare.",
    lowConfidenceExplainer:
      "Modeli si hakika kuhusu mbegu hii. Jaribu kupiga picha kwa mwanga bora au mandhari safi.",
    retryPhotography: "Jaribu tena na picha nzuri",
    classProbabilities: "Alama za aina zote",
    resultImageAlt: "Picha iliyotumika kwa utambuzi huu",
    unrelatedTitle: "Hii haionekani kama mbegu inayotumika",
    unrelatedBody:
      "Picha haionekani wazi kuwa Asili, Chotara au Huria kama modeli inavyotambua. Piga picha ya mbegu moja ya mahindi kwenye uso tambarare, ikiwa wazi na kwa mwanga sawa, kisha jaribu tena.",
    scanAnother: "Pima nyingine",
    exploreCategory: "Soma mwongozo wa {name}",
    saveToHistory: "Hifadhi kwenye historia",
    saveConsentTitle: "Ungependa kuhifadhi matokeo haya?",
    saveConsentBody:
      "Historia inahifadhiwa kwenye kifaa hiki pekee. Chagua kuhifadhi muhtasari pekee au pamoja na picha.",
    saveSummary: "Hifadhi muhtasari pekee",
    saveWithPhoto: "Hifadhi muhtasari + picha",
    dontSave: "Usihifadhi",
    savedSummary: "Muhtasari umehifadhiwa kwenye historia",
    savedWithPhoto: "Matokeo na picha vimehifadhiwa kwenye historia",
    notSaved: "Matokeo hayakuhifadhiwa",

    tipsTitle: "Vidokezo vya kupima vizuri",
    tip1: "Tumia mbegu moja ya mahindi, si kiganja kimoja.",
    tip2: "Tumia mandhari tambarare yenye rangi tofauti na mbegu.",
    tip3: "Tumia mwanga wa mchana uliosawa na uepuke vivuli vizito.",
    tip4: "Shikilia simu kwa utulivu na uache mbegu ijaze picha.",
    scanPrivacy:
      "Picha inachambuliwa kwenye kifaa hiki. Haipakiwi kwenye seva.",
    directCameraNote:
      "Kamera ya moja kwa moja inahitaji HTTPS au localhost. Unaweza kila wakati kupakia picha badala yake.",
    errorGeneric: "Kuna hitilafu. Tafadhali jaribu tena.",
    errorModel:
      "Modeli ya AI haikuweza kupakiwa. Angalia muunganisho wako, kisha jaribu tena. Ikizidi kushindikana, tumikia programu kupitia HTTPS au localhost.",
    errorImage:
      "Picha hii haikuweza kufunguliwa. Jaribu picha ya JPEG au PNG kutoka kamera au ghala la picha.",
    errorFileType: "Tafadhali chagua faili la picha.",
    errorFileSize: "Picha hii ni kubwa mno. Chagua picha ndogo kuliko MB 20.",
    errorInference: "Modeli haikuweza kuchambua picha hii. Jaribu picha nyingine.",
    errorNoImage: "Chagua au piga picha kwanza.",
    errorCameraPermission:
      "Ruhusa ya kamera imekataliwa. Ruhusu kamera kwenye mipangilio ya kivinjari chako, au chagua picha badala yake.",
    errorCameraNotFound: "Hakuna kamera iliyopatikana kwenye kifaa hiki. Chagua picha badala yake.",
    errorCameraBusy:
      "Kamera haipatikani, labda programu nyingine inaitumia. Funga programu hiyo au chagua picha.",
    errorCameraInsecure:
      "Kamera inahitaji HTTPS au localhost. Fungua programu kupitia anwani salama, au chagua picha badala yake.",
    errorCameraUnsupported:
      "Kivinjari hiki hakitumii kamera ya moja kwa moja. Chagua picha kutoka kwenye kifaa chako badala yake.",
    retry: "Jaribu tena",
    tryAgain: "Jaribu tena",
    modelLoadingRuntime: "Inaanzisha mfumo wa AI…",
    modelLoadingModel: "Inapakia modeli ya mbegu za mahindi…",
    debugScores: "Alama za modeli (debug)",

    guideTitle: "Mwongozo wa mbegu",
    guideSubtitle:
      "Elewa makundi matatu ya mbegu yanayotumika na hali muhimu kwa kilimo cha Tanzania.",
    guideSeedTypes: "Aina za mbegu",
    guideRegions: "Mwongozo wa kilimo",
    guideChooseCategory: "Chagua aina ya mbegu",
    whatItMeans: "Aina hii inamaanisha nini",
    classDisclaimer:
      "Utambuzi unaeleza kundi pana la picha. Hautambui aina mahususi, hauthibitishi mbegu, na hautabiri mavuno.",
    officialNote:
      "Kwa maamuzi ya kupanda, angalia lebo ya mbegu iliyothibitishwa na uthibitisha ushauri na TOSCI au afisa ugani wa kilimo wa eneo lako.",
    sectionOverview: "Maelezo ya jumla na sifa",
    sectionRegions: "Mikoa na hali ya ikolojia",
    sectionSoil: "Mahitaji ya udongo",
    sectionClimate: "Hali ya hewa na mvua",
    sectionWater: "Maji na umwagiliaji",
    sectionPlanting: "Vidokezo vya upandaji na nafasi",
    sectionFertilizer: "Mbolea na lishe ya udongo",
    sectionPests: "Magonjwa na wadudu wa kawaida",
    sectionHarvest: "Mavuno na uhifadhi",
    sectionLimitations: "Mipaka na mapendekezo",
    categoryAsiliShort:
      "Mbegu za jadi zinazohifadhiwa na wakulima, zenye tofauti nyingi kati ya maeneo.",
    categoryChotaraShort:
      "Mbegu za mseto zilizozalishwa kwa wazazi teule; kwa kawaida mbegu mpya hununuliwa kila msimu.",
    categoryHuriaShort:
      "Mbegu huria zilizoboreshwa; zinaweza kuhifadhiwa kwa uteuzi makini na kutenganisha mashamba.",
    categoryAsili: "Asili",
    categoryChotara: "Chotara",
    categoryHuria: "Huria",
    categoryUnrelated: "Isiyohusiana",

    regionGuideTitle: "Mwongozo wa kilimo kwa mkoa wako",
    regionGuideSubtitle:
      "Huu ni mwongozo wa jumla kwa hali ya Tanzania. Si pendekezo la aina mahususi ya mbegu.",
    regionSearchLabel: "Tafuta mikoa ya Tanzania",
    regionSearchPlaceholder: "Andika jina la mkoa…",
    regionNoResults: "Hakuna mkoa unaolingana na utafutaji wako.",
    regionSelectHint: "Chagua mkoa ili uone mwongozo wake.",
    regionListLabel: "Mikoa ya Tanzania",
    regionSelected: "Mkoa uliochaguliwa",
    changeRegion: "Badilisha mkoa",
    regionEcologicalZone: "Kanda ya ikolojia",
    regionLocalNote: "Kidokezo cha eneo",
    regionPlantingConditions: "Masharti yanayofaa kwa upandaji",
    regionSoilRainfall: "Mwongozo wa udongo na mvua",
    regionSeason: "Mambo ya kuzingatia kwa msimu",
    regionSeedAdvice: "Ushauri wa kuchagua mbegu",
    regionCaveat:
      "Ufaafu unategemea aina mahususi ya mbegu, kipindi chake cha kukomaa, urefu wa eneo, udongo na msimu wa sasa. Thibitisha uteuzi wa aina na muuzaji wa mbegu zilizothibitishwa au afisa ugani.",
    regionSeedWarning:
      "Aina kama Asili, Chotara au Huria haitoshi kuchagua mbegu bora kwa mkoa wako.",
    regionNotFound: "Mkoa haupatikani.",

    historyTitle: "Historia ya upimaji",
    historySubtitle:
      "Matokeo yaliyohifadhiwa kwenye kifaa hiki. Picha huhifadhiwa tu ukichagua kuzijumuisha.",
    historyEmptyTitle: "Hakuna upimaji uliohifadhiwa bado",
    historyEmptyBody:
      "Baada ya kutambua mbegu, chagua kuhifadhi muhtasari au muhtasari pamoja na picha.",
    historyStartScan: "Pima sampuli yako ya kwanza",
    historyCount: "Upimaji {count} uliohifadhiwa",
    clearHistory: "Futa historia",
    deleteEntry: "Futa matokeo haya",
    viewResult: "Tazama matokeo",
    historyNoPhoto: "Picha haikuhifadhiwa",
    historyLocalNote:
      "Historia inahifadhiwa kwenye kivinjari hiki pekee. Kufuta data ya kivinjari kunaweza kuiondoa.",
    savedOn: "Ilihifadhiwa {date}",
    clearHistoryTitle: "Futa historia yote?",
    clearHistoryBody:
      "Hii itaondoa kabisa kila upimaji uliohifadhiwa na picha zozote kwenye kifaa hiki. Haiwezi kurejeshwa.",
    clearHistoryConfirm: "Futa historia",
    deleteEntryTitle: "Futa matokeo haya?",
    deleteEntryBody: "Matokeo haya na picha yake vitaondolewa kwenye kifaa hiki.",
    deleteConfirm: "Futa matokeo",
    historyDetailTitle: "Upimaji uliohifadhiwa",
    historyLimitNote:
      "Matokeo hadi 50 huhifadhiwa kwenye kifaa hiki. Matokeo ya zamani huondolewa kiotomatiki.",

    settingsTitle: "Mipangilio",
    settingsSubtitle: "Lugha, matumizi bila intaneti, faragha na data ya kifaa.",
    languageSectionTitle: "Lugha",
    languageSectionBody: "Kiolesura hubadilika mara moja na huhifadhi upimaji wa sasa.",
    offlineSectionTitle: "Bila intaneti na hifadhi",
    offlineSectionBody:
      "Skrini muhimu, modeli ya mbegu na mfumo wa AI vinaweza kuhifadhiwa kwenye kifaa chako kwa upimaji bila intaneti.",
    statusOnline: "Imeunganishwa na tayari",
    statusOffline: "Hali bila mtandao inashughuli",
    statusOnlineBody: "Kila kitu kinafanya kazi vizuri. Andaa kifurushi cha bila mtandao kupima bila mtandao.",
    statusOfflineBody:
      "Seed Classifier itaendelea kufanya kazi ikiwa sehemu kuu za programu na modeli zimepakiwa tayari.",
    prepareOffline: "Andaa matumizi bila intaneti",
    offlinePreparing: "Inaandaa faili za bila intaneti…",
    offlineReadyYes: "Kifurushi cha bila intaneti kiko tayari",
    offlineReadyNo: "Kifurushi cha bila intaneti hakijakamilika",
    offlineReadyToast: "Faili za bila intaneti ziko tayari kwenye kifaa hiki",
    offlineFailedToast: "Baadhi ya faili hazikuweza kuhifadhiwa. Angalia muunganisho na ujaribu tena.",
    storageUsed: "Hifadhi inayokadiriwa kutumika: {size}",
    storageUnknown: "Ukubwa wa hifadhi haupatikani kwenye kivinjari hiki.",
    offlineShell: "Skrini za programu",
    offlineModel: "Modeli ya mbegu",
    offlineRuntime: "Mfumo wa AI",
    offlineAssetReady: "Tayari",
    offlineAssetMissing: "Haipo",
    installSectionTitle: "Sakinisha Seed Classifier",
    installSectionBody:
      "Kusakinisha kunaweka Seed Classifier kwenye skrini ya nyumbani na kuifungua kwenye dirisha lake.",
    installIosTitle: "Kwenye iPhone au iPad",
    installIosBody:
      "Fungua Seed Classifier kwenye Safari, gusa kitufe cha Shiriki, kisha chagua “Add to Home Screen”.",
    installAndroidTitle: "Kwenye Android",
    installAndroidBody:
      "Fungua menyu ya kivinjari na chagua “Install app” au “Add to Home screen”. Kitufe cha kusakinisha kikionekana juu, unaweza kukitumia.",
    installDesktopTitle: "Kwenye kompyuta",
    installDesktopBody:
      "Tumia aikoni ya kusakinisha kwenye upau wa anwani wa kivinjari, au menyu ya kivinjari, kusakinisha Seed Classifier.",
    installUnavailable:
      "Kivinjari hiki hakijatoa mwaliko wa kusakinisha kiotomatiki. Fuata maelekezo ya kifaa chako.",
    installedStatus: "Imesakinishwa kwenye kifaa hiki",
    notInstalledStatus: "Haijasakinishwa bado",
    privacyTitle: "Faragha",
    privacyBody:
      "Seed Classifier imeundwa ili upimaji wako ubaki kwenye kifaa chako. Uainishaji unafanyika hapa kwa kutumia WebAssembly na ONNX Runtime.",
    privacyBullet1: "Picha hazipakiwi kwenye seva.",
    privacyBullet2: "Hakuna akaunti wala kuingia.",
    privacyBullet3: "Hakuna API ya nje inayohitajika kwa uainishaji.",
    privacyBullet4: "Historia na picha zinabaki kwenye kivinjari chako hadi uzifute.",
    dataTitle: "Data ya kifaa",
    dataBody:
      "Dhibiti muhtasari wa uainishaji, picha na mapendeleo yaliyohifadhiwa na Seed Classifier.",
    clearHistoryBtn: "Futa historia ya upimaji",
    clearAllBtn: "Weka upya Seed Classifier kwenye kifaa hiki",
    clearAllTitle: "Weka upya Seed Classifier?",
    clearAllBody:
      "Hii itaondoa historia, mapendeleo na hifadhi ya bila intaneti kwenye kifaa hiki. Programu itahitaji intaneti kupakua modeli tena.",
    clearAllConfirm: "Weka upya programu",
    dataCleared: "Data ya Seed Classifier kwenye kifaa imeondolewa",
    historyCleared: "Historia ya upimaji imefutwa",
    modelTitle: "Kuhusu modeli",
    modelBody:
      "Kitambuzi hiki ni mtandao mdogo wa convolutional uliohamishwa kwenda ONNX na kufanya kazi hapa kwenye kifaa. Ulifunzwa kwa picha za karibu za mbegu moja moja ya mahindi.",
    modelSizeLabel: "Ukubwa wa ingizo",
    modelClassesLabel: "Makundi",
    modelAccuracyLabel: "Usahihi kwenye data ya majaribio",
    modelAccuracyNote:
      "Tathmini ya mradi kwenye data ya mbegu zilizotenganishwa. Usahihi halisi hutofautiana kwa mwanga, mandhari na mbegu yenyewe.",
    aboutTitle: "Kuhusu Seed Classifier",
    aboutBody:
      "Kitambua mbegu za mahindi na mwongozo wa kilimo kwa Tanzania, kimeundwa kwa simu kwanza.",
    version: "Toleo",
    settingsCameraNote:
      "Kamera ya moja kwa moja inahitaji HTTPS au localhost. Kupakia picha kunafanya kazi bila ruhusa ya kamera.",
    debugMode: "Hali ya debug",
    debugModeBody: "Onyesha alama ghafi za modeli na maelezo ya kiufundi.",

    cameraPermissionTitle: "Ruhusa ya kamera",
    cameraUnsupportedTitle: "Kamera haitumiki",
    cameraErrorTitle: "Hitilafu ya kamera",
    cameraRetry: "Jaribu kamera tena",
    navChat: "Chat",
    chatTitle: "Msaidizi AI la Mbegu",
    chatSubtitle: "Nenda swali nyenye kuhusiana na mbegu za mahindi, kilimo au matokeo yako ya upimaji.",
    clearChat: "Futa chat",
    chatInputPlaceholder: "Uliza kuhusu mbegu au kilimo…",
    chatInputLabel: "Ujumbe kwa Msaidizi wa Mbegu",
    sendChatMessage: "Tuma ujumbe",
  },
};

export function translate(lang, key, vars) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let value = dict[key] ?? TRANSLATIONS.en[key] ?? key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}

export function applyStaticTranslations(root, lang) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = translate(lang, node.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", translate(lang, node.dataset.i18nPlaceholder));
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", translate(lang, node.dataset.i18nAriaLabel));
  });
  root.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", translate(lang, node.dataset.i18nTitle));
  });
  document.documentElement.lang = lang === "sw" ? "sw" : "en";
}

export function localeFor(lang) {
  return (LANGUAGES[lang] || LANGUAGES.en).locale;
}

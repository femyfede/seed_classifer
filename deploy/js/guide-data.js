/*
 * Local agronomy content for Seed Classifier.
 *
 * Content is intentionally general: it does not name or rank seed varieties,
 * promise yields, or claim disease resistance. Farmers are directed to the
 * seed label, TOSCI and local extension staff for variety-specific decisions.
 */
const bi = (en, sw) => ({ en, sw });

const sec = (enText, swText, enPoints = [], swPoints = []) => ({
  en: { text: enText, points: enPoints },
  sw: { text: swText, points: swPoints },
});

export const SECTION_ORDER = [
  "overview",
  "regions",
  "soil",
  "climate",
  "water",
  "planting",
  "fertilizer",
  "pests",
  "harvest",
  "limitations",
];

export const SEED_GUIDE = {
  local: {
    id: "local",
    nameKey: "categoryAsili",
    shortKey: "categoryAsiliShort",
    illustration: "assets/img/seed-asili.svg",
    accent: "#C9903A",
    sections: {
      overview: sec(
        "In Seed Classifier, Asili is the display name for the model category “local”. It is a broad group of traditional or farmer-saved maize types, not one registered variety. Plants, cobs and kernels vary in size, colour and maturity. Because these are populations rather than uniform varieties, two bags called Asili can behave differently.",
        "Katika Seed Classifier, Asili ni jina la kuonyesha kundi la modeli liitwalo “local”. Ni kundi pana la mbegu za jadi au zinazohifadhiwa na wakulima, si aina moja iliyosajiliwa. Mimea, magunzi na mbegu hutofautiana kwa ukubwa, rangi na kipindi cha kukomaa. Kwa kuwa ni makundi ya mbegu na si aina moja inayofanana, mifuko miwili inayoitwa Asili inaweza kutoa matokeo tofauti.",
        [
          "This classification is not a seed certificate.",
          "Local types can be adapted to an area, but they usually respond less to fertilizer than hybrids.",
          "Saved seed can lose quality without careful selection.",
        ],
        [
          "Utambuzi huu si cheti cha mbegu.",
          "Mbegu za jadi zinaweza kuwa zimezoea eneo, lakini kwa kawaida hazijibu mbolea kama mseto.",
          "Mbegu zilizohifadhiwa zinaweza kupungua ubora bila uteuzi makini.",
        ]
      ),
      regions: sec(
        "Local maize is grown across Tanzania, but suitability depends on where the seed came from. In the Southern and Northern Highlands, medium- to late-maturing local types may fit areas with reliable rainfall. In the drier Central Zone, early local types are usually safer. Match the maturity period to the length of your rainfall season.",
        "Mbegu za asili hupandwa kote Tanzania, lakini ufaafu hutegemea eneo mbegu ilikotoka. Katika Nyanda za Juu Kusini na Kaskazini, aina za kati au zinazokomaa kwa kuchelewa zinaweza kufaa maeneo yenye mvua za kuaminika. Katika Kanda ya Kati yenye ukame, aina za mapema kwa kawaida ni salama zaidi. Linganisha kipindi cha kukomaa na urefu wa msimu wako wa mvua.",
        [
          "Use seed known to have performed in your ward or nearby area.",
          "At high altitude, choose types that mature before cold or frost.",
          "In dry areas, prefer early, drought-tolerant local types.",
        ],
        [
          "Tumia mbegu inayojulikana kufanya vizuri katika kata yako au eneo la karibu.",
          "Kwenye nyanda za juu, chagua aina inayokomaa kabla ya baridi kali.",
          "Kwenye maeneo kame, pendelea aina za mapema zinazostahimili ukame.",
        ]
      ),
      soil: sec(
        "Maize grows best in deep, well-drained loam or sandy loam with a pH of about 5.5–7.0. Local maize can produce on poorer soils, but it still responds to manure, compost and balanced nutrients. Avoid waterlogged, compacted or eroded fields, and prepare a fine seedbed.",
        "Mahindi hukua vizuri kwenye udongo tifutifu au mchanga tifutifu wenye kina, unaopitisha maji vizuri na pH ya takriban 5.5–7.0. Mbegu za asili zinaweza kutoa mavuno kwenye udongo duni, lakini bado hujibu kwa samadi, mboji na virutubisho vilivyosawazishwa. Epuka mashamba yenye maji yaliyotuama, yaliyogandamizwa au mmomonyoko, na andaa udongo laini vya kutosha.",
        [
          "Mix well-rotted manure or compost before planting.",
          "A soil test every few seasons prevents guessing fertilizer rates.",
          "On slopes, use contour ridges or terraces to slow runoff.",
        ],
        [
          "Changanya samadi iliyooza vizuri au mboji kabla ya kupanda.",
          "Kipimo cha udongo kila baada ya misimu michache huzuia kubahatisha kiwango cha mbolea.",
          "Kwenye miteremko, tumia matuta ya kontua au matuta ya kupunguza mtiririko wa maji.",
        ]
      ),
      climate: sec(
        "Maize needs roughly 500–1,000 mm of water per season, depending on maturity, with reliable moisture at flowering and grain filling. Temperatures around 18–30 °C are suitable; frost damages the crop. Local types differ widely in altitude adaptation, so use seed from a similar environment.",
        "Mahindi huhitaji takriban mm 500–1,000 za maji kwa msimu, kulingana na kipindi cha kukomaa, pamoja na unyevu wa kuaminika wakati wa kutoa maua na kujaza punje. Joto la takriban 18–30 °C hufaa; baridi kali huharibu zao. Aina za asili hutofautiana sana kwa urefu wa eneo, hivyo tumia mbegu kutoka mazingira yanayofanana.",
        [
          "Do not plant late in a short rainfall season.",
          "Heat and drought at flowering reduce pollination and grain size.",
          "Confirm the altitude range of the seed source.",
        ],
        [
          "Usipande kwa kuchelewa kwenye msimu mfupi wa mvua.",
          "Joto kali na ukame wakati wa kutoa maua hupunguza uchavushaji na ukubwa wa punje.",
          "Thibitisha urefu wa eneo unaofaa kwa mbegu uliyonayo.",
        ]
      ),
      water: sec(
        "Most local maize is rain-fed. The most sensitive period is from tasselling through grain filling; drought then causes poor pollination and small grain. Supplementary irrigation helps if water is available. Mulching conserves soil moisture, but avoid waterlogging.",
        "Mahindi mengi ya asili hupandwa kwa kutegemea mvua. Kipindi kinachohitaji maji zaidi ni kuanzia kutoa maua hadi kujaza punje; ukame wakati huo husababisha uchavushaji hafifu na punje ndogo. Umwagiliaji wa ziada husaidia ikiwa maji yanapatikana. Matandazo huhifadhi unyevu wa udongo, lakini epuka maji kutuama.",
        [
          "Irrigate at flowering if you have water.",
          "Use contour ridges or furrows to capture rainfall.",
          "Avoid over-irrigation; maize roots also need air.",
        ],
        [
          "Mwagilia wakati wa kutoa maua ikiwa una maji.",
          "Tumia matuta au mifereji ya kontua kunasa mvua.",
          "Epuka kumwagilia kupita kiasi; mizizi ya mahindi pia huhitaji hewa.",
        ]
      ),
      planting: sec(
        "Plant at the onset of reliable rains, about 3–5 cm deep. A common spacing is 75 cm between rows and 25–30 cm within rows, with one plant per station. Seed rate varies with seed size, often about 20–25 kg/ha. Thin to one plant per hill after 2–3 weeks and weed early.",
        "Panda mwanzo wa mvua za kuaminika, kwa kina cha takriban sentimita 3–5. Nafasi ya kawaida ni sentimita 75 kati ya mistari na 25–30 ndani ya mstari, kwa mmea mmoja kwa kila shimo. Kiwango cha mbegu hutegemea ukubwa wa mbegu, mara nyingi takriban kilo 20–25 kwa hekta. Punguza hadi mmea mmoja kwa kila shimo baada ya wiki 2–3 na palilia mapema.",
        [
          "Use well-filled, undamaged seed.",
          "Test germination before planting saved seed.",
          "Do not mix different seed lots in one plot if you plan to save seed.",
        ],
        [
          "Tumia mbegu zilizojaa vizuri na zisizoharibika.",
          "Pima kiwango cha kuota kabla ya kupanda mbegu zilizohifadhiwa.",
          "Usichanganye mbegu za vyanzo tofauti kwenye shamba moja ikiwa unakusudia kuhifadhi mbegu.",
        ]
      ),
      fertilizer: sec(
        "Local maize often responds to organic matter and modest mineral fertilizer. Apply well-rotted manure or compost before planting. If a soil test or extension advice supports it, use a basal fertilizer such as DAP or NPK at planting and urea as a top-dress. Avoid blanket rates and place fertilizer away from direct contact with the seed.",
        "Mahindi ya asili mara nyingi hujibu kwa mbolea ya asili na mbolea ya madini kwa kiasi. Weka samadi iliyooza vizuri au mboji kabla ya kupanda. Ikiwa kipimo cha udongo au ushauri wa ugani unaunga mkono, tumia mbolea ya msingi kama DAP au NPK wakati wa kupanda na urea kama mbolea ya juu. Epuka viwango vya jumla visivyozingatia udongo, na weka mbolea mbali na mbegu.",
        [
          "Never guess fertilizer rates; ask for local advice.",
          "Place fertilizer about 5 cm from the seed.",
          "Combine organic and mineral fertilizer where possible.",
        ],
        [
          "Usibahatisha kiwango cha mbolea; omba ushauri wa eneo lako.",
          "Weka mbolea umbali wa takriban sentimita 5 kutoka kwenye mbegu.",
          "Changanya mbolea ya asili na ya madini inapowezekana.",
        ]
      ),
      pests: sec(
        "Scout for fall armyworm, stem borers, stalk borers and aphids. Important diseases include maize streak virus, maize lethal necrosis, grey leaf spot, common rust and ear rots. Use clean seed, crop rotation, tolerant varieties where available and integrated pest management. Poorly dried or stored grain can develop aflatoxin.",
        "Angalia viwavijeshi, wadudu wa shina na vidukari. Magonjwa muhimu ni pamoja na virusi vya mistari ya mahindi, ugonjwa wa MLN, madoa ya majani ya kijivu, kuvu ya kawaida na kuoza kwa magunzi. Tumia mbegu safi, mzunguko wa mazao, aina zinazostahimili inapopatikana na usimamizi jumuishi wa wadudu. Nafaka isiyokaushwa au kuhifadhiwa vizuri inaweza kuzaa aflatoksini.",
        [
          "Scout weekly; do not spray blindly.",
          "Remove or manage crop residues after harvest.",
          "Dry grain quickly and store it dry.",
        ],
        [
          "Angalia shamba kila wiki; usinyunyize dawa bila kujua tatizo.",
          "Ondoa au dhibiti mabaki ya mazao baada ya mavuno.",
          "Kausha nafaka haraka na uihifadhi ikiwa kavu.",
        ]
      ),
      harvest: sec(
        "Harvest when husks are dry and the grain has reached the black layer. Dry to about 13% moisture before storage. Keep grain in clean, dry, raised bags or containers; hermetic bags and PICS bags help control insects. Never store damp grain, because mould and aflatoxin can develop.",
        "Vuna magunzi yakiwa makavu na punje zimefika tabaka jeusi. Kausha hadi unyevu wa takriban asilimia 13 kabla ya kuhifadhi. Hifadhi nafaka kwenye mifuko au vyombo safi, vikavu na vilivyoinuliwa; mifuko maalum isiyopitisha hewa na mifuko ya PICS huzuia wadudu. Kamwe usihifadhi nafaka yenye unyevu, kwa sababu kuvu na aflatoksini vinaweza kutokea.",
        [
          "Check grain dryness before bagging.",
          "Clean the store and keep it dry.",
          "Use pallets; do not store bags directly on the floor.",
        ],
        [
          "Angalia ukavu wa nafaka kabla ya kuweka kwenye mifuko.",
          "Safisha ghala na uliweke kavu.",
          "Tumia mbao za kuinua; usiweke mifuko moja kwa moja sakafuni.",
        ]
      ),
      limitations: sec(
        "A prediction does not prove the variety, purity, germination or certification of a seed. Saved local seed can carry insects and disease and may lose vigour. For certified planting or market production, buy inspected seed with a TOSCI label and confirm choices with your extension officer.",
        "Utambuzi hauthibitishi aina, usafi, uwezo wa kuota au cheti cha mbegu. Mbegu za asili zilizohifadhiwa zinaweza kubeba wadudu na magonjwa na zinaweza kupungua nguvu. Kwa kupanda kwa hati au kwa soko, nunua mbegu zilizokaguliwa zenye lebo ya TOSCI na uthibitisha uchaguzi na afisa ugani.",
        [
          "Do not treat the prediction as certification.",
          "Avoid seed from diseased or insect-damaged fields.",
          "Keep records and compare results across seasons.",
        ],
        [
          "Usichukue utambuzi kama cheti.",
          "Epuka mbegu kutoka mashamba yenye magonjwa au wadudu.",
          "Weka kumbukumbu na linganisha matokeo kwa misimu.",
        ]
      ),
    },
  },

  chotara: {
    id: "chotara",
    nameKey: "categoryChotara",
    shortKey: "categoryChotaraShort",
    illustration: "assets/img/seed-chotara.svg",
    accent: "#477A4D",
    sections: {
      overview: sec(
        "In this project, Chotara is the display name for the model category “chotara”. It represents hybrid maize: seed produced by crossing selected parent lines. Hybrids are usually more uniform and respond well to good management, but they are not one variety. Maturity, grain colour and adaptation differ. First-generation (F1) hybrid seed is not normally saved for the next season because performance falls.",
        "Katika mradi huu, Chotara ni jina la kuonyesha kundi la modeli liitwalo “chotara”. Linawakilisha mbegu za mseto: mbegu zinazozalishwa kwa kuchanganya wazazi teule. Mbegu za mseto kwa kawaida hufanana zaidi na hujibu vizuri usimamizi mzuri, lakini si aina moja. Kipindi cha kukomaa, rangi ya punje na ufaafu hutofautiana. Mbegu ya mseto ya kizazi cha kwanza (F1) kwa kawaida haihifadhiwi kwa msimu ujao kwa sababu matokeo hupungua.",
        [
          "The model does not identify the hybrid name.",
          "Fresh hybrid seed is normally bought each season.",
          "Suitability depends on the variety, altitude and rainfall.",
        ],
        [
          "Modeli haitambui jina la mseto.",
          "Mbegu mpya ya mseto kwa kawaida hununuliwa kila msimu.",
          "Ufaafu hutegemea aina, urefu wa eneo na mvua.",
        ]
      ),
      regions: sec(
        "Hybrids are grown in all regions where moisture and inputs match the variety. Medium- and late-maturing hybrids fit areas with reliable rainfall, while early hybrids are safer in short-season areas. Do not use a predicted category to choose a specific hybrid: follow the maturity and altitude recommendation on the seed label.",
        "Mbegu za mseto hupandwa katika mikoa yote ambapo unyevu na pembejeo zinaendana na aina. Mseto wa kati au unaokomaa kwa kuchelewa hufaa maeneo yenye mvua za kuaminika, wakati mseto wa mapema ni salama zaidi kwenye maeneo ya msimu mfupi. Usitumie kundi lililotambuliwa kuchagua mseto mahususi: fuata maelezo ya kipindi cha kukomaa na urefu wa eneo kwenye lebo.",
        [
          "Match the hybrid's maturity to the length of your rain season.",
          "Ask the dealer or extension officer about altitude suitability.",
          "Late hybrids are risky in short or erratic seasons.",
        ],
        [
          "Linganisha kipindi cha kukomaa cha mseto na urefu wa msimu wa mvua.",
          "Uliza muuzaji au afisa ugani kuhusu urefu wa eneo unaofaa.",
          "Mseto unaochelewa kukomaa ni hatari kwenye misimu mifupi au isiyotabirika.",
        ]
      ),
      soil: sec(
        "Hybrids perform best in deep, fertile, well-drained loam or sandy loam with a pH of about 5.5–7.0. They respond strongly to soil fertility, so combine manure or compost with balanced fertilizer where possible. Prepare a fine seedbed and avoid compacted or waterlogged fields.",
        "Mbegu za mseto hufanya vizuri zaidi kwenye udongo tifutifu au mchanga tifutifu wenye kina, rutuba na mtiririko mzuri wa maji, pH ya takriban 5.5–7.0. Hujibu kwa nguvu kwa rutuba ya udongo, hivyo changanya samadi au mboji na mbolea iliyosawazishwa inapowezekana. Andaa udongo laini na epuka mashamba yaliyogandamizwa au yenye maji yaliyotuama.",
        [
          "A soil test is the best basis for fertilizer rates.",
          "Add organic matter before planting.",
          "Avoid fields that flood or compact easily.",
        ],
        [
          "Kipimo cha udongo ndiyo msingi bora wa kiwango cha mbolea.",
          "Ongeza mbolea ya asili kabla ya kupanda.",
          "Epuka mashamba yanayofurika au yanayogandamizwa kwa urahisi.",
        ]
      ),
      climate: sec(
        "Hybrids generally need about 600–1,200 mm of water per season, depending on maturity, with reliable moisture at flowering. Early hybrids can fit drier areas with about 500–800 mm; late hybrids need a longer, more reliable season. Heat and drought at flowering reduce yield.",
        "Mbegu za mseto kwa kawaida huhitaji takriban mm 600–1,200 za maji kwa msimu, kulingana na kipindi cha kukomaa, pamoja na unyevu wa kuaminika wakati wa kutoa maua. Mseto wa mapema unaweza kufaa maeneo makavu yenye takriban mm 500–800; mseto unaochelewa huhitaji msimu mrefu na wa kuaminika zaidi. Joto kali na ukame wakati wa kutoa maua hupunguza mavuno.",
        [
          "Use the variety's own rainfall and altitude recommendation.",
          "Avoid late planting when the season is already advanced.",
          "Protect flowering maize from moisture stress.",
        ],
        [
          "Tumia maelezo ya aina yenyewe kuhusu mvua na urefu wa eneo.",
          "Epuka kupanda kwa kuchelewa msimu ukiwa umeendelea.",
          "Linda mahindi yanayotoa maua dhidi ya upungufu wa unyevu.",
        ]
      ),
      water: sec(
        "Hybrids can be rain-fed or irrigated. Water demand is highest at tasselling, silking and grain filling. Supplementary irrigation gives the best return when fertilizer is also used well. Mulch to reduce evaporation, ensure drainage, and avoid both drought stress and waterlogging.",
        "Mbegu za mseto zinaweza kupandwa kwa kutegemea mvua au kwa umwagiliaji. Mahitaji ya maji ni makubwa zaidi wakati wa kutoa maua na kujaza punje. Umwagiliaji wa ziada hutoa faida zaidi pale mbolea inatumika vizuri pia. Weka matandazo kupunguza uvukizi, hakikisha mtiririko wa maji, na epuka ukame na maji kutuama.",
        [
          "Prioritise water at flowering and grain filling.",
          "Do not let water stand in the field.",
          "Mulch helps stretch available moisture.",
        ],
        [
          "Tilia kipaumbele maji wakati wa kutoa maua na kujaza punje.",
          "Usiruhusu maji yatuame shambani.",
          "Matandazo husaidia kudumisha unyevu uliopo.",
        ]
      ),
      planting: sec(
        "Plant with the reliable onset of rains, about 3–5 cm deep. A common spacing is 75 cm × 25 cm with one plant per hill, but follow the seed label where it differs. Seed rate is often about 20–25 kg/ha. Weed at 2–3 weeks and again at 5–6 weeks; do not plant late.",
        "Panda mwanzo wa mvua za kuaminika, kwa kina cha takriban sentimita 3–5. Nafasi ya kawaida ni sentimita 75 × 25 kwa mmea mmoja kwa kila shimo, lakini fuata lebo ya mbegu inapotofautiana. Kiwango cha mbegu mara nyingi ni takriban kilo 20–25 kwa hekta. Palilia wiki 2–3 na tena wiki 5–6; usipande kwa kuchelewa.",
        [
          "Use the spacing recommended for the specific hybrid.",
          "Keep the field weed-free early in the season.",
          "Thin to one healthy plant per hill.",
        ],
        [
          "Tumia nafasi inayopendekezwa kwa mseto husika.",
          "Weka shamba bila magugu mapema msimu.",
          "Punguza hadi mmea mmoja mwenye afya kwa kila shimo.",
        ]
      ),
      fertilizer: sec(
        "Hybrids respond strongly to fertilizer. Base rates on a soil test and official local recommendations. A common approach is a basal DAP or NPK application at planting followed by urea top-dressing, but the rates, timing and need depend on soil, rainfall and target production. Place fertilizer away from direct seed contact and combine it with organic matter where possible.",
        "Mbegu za mseto hujibu kwa nguvu kwa mbolea. Weka viwango kwa kuzingatia kipimo cha udongo na mapendekezo rasmi ya eneo. Mbinu ya kawaida ni mbolea ya msingi ya DAP au NPK wakati wa kupanda ikifuatiwa na urea ya juu, lakini viwango, muda na hitaji hutegemea udongo, mvua na lengo la uzalishaji. Weka mbolea mbali na mbegu na changanya na mbolea ya asili inapowezekana.",
        [
          "Do not copy a fertilizer rate without local advice.",
          "Too much nitrogen can cause lodging and disease pressure.",
          "Keep fertilizer away from direct seed contact.",
        ],
        [
          "Usinakili kiwango cha mbolea bila ushauri wa eneo.",
          "Nitrojeni nyingi kupita kiasi inaweza kusababisha mimea kuanguka na magonjwa kuongezeka.",
          "Weka mbolea mbali na mbegu.",
        ]
      ),
      pests: sec(
        "Hybrids face the same major pests and diseases as other maize: fall armyworm, stem borers, maize streak virus, maize lethal necrosis, grey leaf spot, common rust and ear rots. Resistance differs by hybrid, so check the label rather than assuming protection. Scout regularly, rotate crops, manage residues and dry grain properly.",
        "Mbegu za mseto hukabiliana na wadudu na magonjwa makuu kama mahindi mengine: viwavijeshi, wadudu wa shina, virusi vya mistari ya mahindi, ugonjwa wa MLN, madoa ya majani ya kijivu, kuvu ya kawaida na kuoza kwa magunzi. Upinzani hutofautiana kwa kila mseto, hivyo angalia lebo badala ya kudhani kuna ulinzi. Angalia shamba mara kwa mara, badilisha mazao, dhibiti mabaki na kausha nafaka vizuri.",
        [
          "Check the hybrid label for its own disease profile.",
          "Scout weekly, especially during humid weather.",
          "Rotate maize with legumes or other crops.",
        ],
        [
          "Angalia lebo ya mseto kwa maelezo ya magonjwa yake.",
          "Angalia shamba kila wiki, hasa wakati wa unyevu.",
          "Badilisha mahindi na mikunde au mazao mengine.",
        ]
      ),
      harvest: sec(
        "Harvest when the crop reaches physiological maturity and grain has formed the black layer. Dry to about 13% moisture. Store in clean, dry, raised bags or containers; hermetic bags and PICS bags help protect against insects. Grain from F1 hybrid plants is not recommended as planting seed for the next season.",
        "Vuna zao linapofika ukomavu na punje zimeunda tabaka jeusi. Kausha hadi unyevu wa takriban asilimia 13. Hifadhi kwenye mifuko au vyombo safi, vikavu na vilivyoinuliwa; mifuko isiyopitisha hewa na mifuko ya PICS husaidia kulinda dhidi ya wadudu. Nafaka kutoka mimea ya mseto wa F1 haipendekezwi kama mbegu ya kupanda msimu ujao.",
        [
          "Do not save F1 hybrid grain as seed.",
          "Dry and clean grain before storage.",
          "Monitor stored grain for insects and mould.",
        ],
        [
          "Usihifadhi nafaka ya mseto wa F1 kama mbegu.",
          "Kausha na safisha nafaka kabla ya kuhifadhi.",
          "Angalia nafaka iliyohifadhiwa kwa wadudu na kuvu.",
        ]
      ),
      limitations: sec(
        "A prediction cannot tell you the hybrid name, maturity or suitability. Hybrids usually require fresh seed and often more inputs; without adequate moisture and nutrients they may not outperform a well-adapted local type or OPV. Buy certified seed with a readable label and confirm the choice for your area.",
        "Utambuzi hauwezi kukujulisha jina la mseto, kipindi cha kukomaa au ufaafu wake. Mbegu za mseto kwa kawaida huhitaji mbegu mpya na mara nyingi pembejeo zaidi; bila unyevu na virutubisho vya kutosha zinaweza kutofautiana na mbegu za asili au huria zilizozoea eneo. Nunua mbegu zilizothibitishwa zenye lebo inayosomeka na uthibitisha uchaguzi kwa eneo lako.",
        [
          "The category is not a variety recommendation.",
          "Hybrid seed is an investment that needs good management.",
          "Check the TOSCI label and the dealer's advice.",
        ],
        [
          "Kundi hili si pendekezo la aina mahususi.",
          "Mbegu ya mseto ni uwekezaji unaohitaji usimamizi mzuri.",
          "Angalia lebo ya TOSCI na ushauri wa muuzaji.",
        ]
      ),
    },
  },

  huria: {
    id: "huria",
    nameKey: "categoryHuria",
    shortKey: "categoryHuriaShort",
    illustration: "assets/img/seed-huria.svg",
    accent: "#8FB58C",
    sections: {
      overview: sec(
        "In this project, Huria is the display name for the model category “huria”. It represents open-pollinated varieties (OPVs): improved populations that can be saved and replanted, although seed quality declines without careful selection and isolation. OPVs are often more uniform than many local types but less uniform than hybrids.",
        "Katika mradi huu, Huria ni jina la kuonyesha kundi la modeli liitwalo “huria”. Linawakilisha mbegu huria (open-pollinated varieties, OPV): makundi yaliyoboreshwa ambayo yanaweza kuhifadhiwa na kupandwa tena, ingawa ubora wa mbegu hupungua bila uteuzi makini na kutenganisha mashamba. Mbegu huria mara nyingi hufanana zaidi kuliko mbegu nyingi za jadi lakini si sawa kama mseto.",
        [
          "The category does not name the OPV variety.",
          "Saved seed can be replanted, but quality must be managed.",
          "Uniformity is usually lower than in hybrids.",
        ],
        [
          "Kundi hili halitaji jina la aina ya mbegu huria.",
          "Mbegu zilizohifadhiwa zinaweza kupandwa tena, lakini ubora lazima udhibitiwe.",
          "Kufanana kwa mimea kwa kawaida ni chini ya mseto.",
        ]
      ),
      regions: sec(
        "OPVs are widely adapted and are often chosen by farmers who want to save seed. Maturity ranges from early to late, so match the variety to your rainfall and altitude. Reliable highland areas may support later OPVs, while short-season areas need early types. A predicted category is not a regional variety recommendation.",
        "Mbegu huria huzoea maeneo mengi na mara nyingi huchaguliwa na wakulima wanaotaka kuhifadhi mbegu. Kipindi cha kukomaa huanzia mapema hadi kuchelewa, hivyo linganisha aina na mvua na urefu wa eneo lako. Maeneo ya nyanda za juu yenye mvua za kuaminika yanaweza kufaa aina zinazochelewa, wakati maeneo ya msimu mfupi yanahitaji aina za mapema. Kundi lililotambuliwa si pendekezo la aina kwa mkoa.",
        [
          "Choose a maturity period that fits your season.",
          "Confirm altitude adaptation before planting.",
          "Ask extension staff which OPVs are available locally.",
        ],
        [
          "Chagua kipindi cha kukomaa kinacholingana na msimu wako.",
          "Thibitisha ufaafu wa urefu wa eneo kabla ya kupanda.",
          "Uliza afisa ugani ni mbegu huria zipi zinapatikana eneo lako.",
        ]
      ),
      soil: sec(
        "OPVs grow best in deep, well-drained loam or sandy loam with a pH of about 5.5–7.0. They can tolerate somewhat lower fertility than hybrids but still respond to manure, compost and balanced nutrients. Avoid waterlogging and prepare the seedbed well.",
        "Mbegu huria hukua vizuri zaidi kwenye udongo tifutifu au mchanga tifutifu wenye kina na mtiririko mzuri wa maji, pH ya takriban 5.5–7.0. Zinaweza kustahimili rutuba ya chini kiasi kuliko mseto lakini bado hujibu kwa samadi, mboji na virutubisho vilivyosawazishwa. Epuka maji kutuama na andaa udongo vizuri.",
        [
          "Add compost or well-rotted manure.",
          "Use a soil test to plan fertilizer.",
          "Protect topsoil from erosion.",
        ],
        [
          "Ongeza mboji au samadi iliyooza vizuri.",
          "Tumia kipimo cha udongo kupanga mbolea.",
          "Linda udongo wa juu dhidi ya mmomonyoko.",
        ]
      ),
      climate: sec(
        "OPVs commonly need about 500–1,000 mm of water per season, depending on maturity, and temperatures around 18–30 °C. Drought at flowering reduces pollination and grain filling. Choose an OPV whose maturity and altitude recommendation match your area.",
        "Mbegu huria kwa kawaida huhitaji takriban mm 500–1,000 za maji kwa msimu, kulingana na kipindi cha kukomaa, na joto la takriban 18–30 °C. Ukame wakati wa kutoa maua hupunguza uchavushaji na kujaza punje. Chagua mbegu huria ambayo kipindi chake cha kukomaa na urefu wa eneo vinalingana na eneo lako.",
        [
          "Avoid late planting in short seasons.",
          "Protect flowering maize from drought stress.",
          "Check the altitude range of the variety.",
        ],
        [
          "Epuka kupanda kwa kuchelewa kwenye misimu mifupi.",
          "Linda mahindi yanayotoa maua dhidi ya ukame.",
          "Angalia urefu wa eneo unaofaa kwa aina hiyo.",
        ]
      ),
      water: sec(
        "Most OPVs are rain-fed. Moisture is especially important from tasselling to grain filling. Supplementary irrigation helps in dry spells, and mulching conserves moisture. Ensure drainage so roots are not waterlogged.",
        "Mbegu nyingi huria hupandwa kwa kutegemea mvua. Unyevu ni muhimu hasa kuanzia kutoa maua hadi kujaza punje. Umwagiliaji wa ziada husaidia wakati wa vipindi vya ukame, na matandazo huhifadhi unyevu. Hakikisha mtiririko wa maji ili mizizi isijae maji.",
        [
          "Irrigate during flowering if water is available.",
          "Mulch to conserve soil moisture.",
          "Avoid fields with poor drainage.",
        ],
        [
          "Mwagilia wakati wa kutoa maua ikiwa maji yanapatikana.",
          "Weka matandazo kuhifadhi unyevu wa udongo.",
          "Epuka mashamba yenye mtiririko mbaya wa maji.",
        ]
      ),
      planting: sec(
        "Plant at the onset of reliable rains, 3–5 cm deep, commonly 75 cm × 25–30 cm with one plant per hill. If you plan to save seed, isolate the crop from other maize that flowers at the same time—by distance or by planting dates—and remove off-types before flowering.",
        "Panda mwanzo wa mvua za kuaminika, kwa kina cha sentimita 3–5, kwa kawaida sentimita 75 × 25–30 kwa mmea mmoja kwa kila shimo. Ikiwa unakusudia kuhifadhi mbegu, tenganisha zao na mahindi mengine yanayotoa maua wakati mmoja—kwa umbali au kwa muda wa kupanda—na ondoa mimea isiyofaa kabla ya kutoa maua.",
        [
          "Keep records of the seed source.",
          "Rogue off-types before flowering.",
          "Harvest seed from healthy, representative plants.",
        ],
        [
          "Weka kumbukumbu za chanzo cha mbegu.",
          "Ondoa mimea isiyofaa kabla ya kutoa maua.",
          "Chukua mbegu kutoka mimea yenye afya na inayowakilisha aina.",
        ]
      ),
      fertilizer: sec(
        "OPVs respond to manure, compost and balanced fertilizer, though usually less dramatically than hybrids. Base rates on a soil test and local advice. A basal application at planting and a top-dress may be appropriate, but avoid excessive nitrogen and keep fertilizer away from direct seed contact.",
        "Mbegu huria hujibu kwa samadi, mboji na mbolea iliyosawazishwa, ingawa kwa kawaida si kwa kasi kama mseto. Weka viwango kwa kuzingatia kipimo cha udongo na ushauri wa eneo. Mbolea ya msingi wakati wa kupanda na mbolea ya juu zinaweza kufaa, lakini epuka nitrojeni nyingi na weka mbolea mbali na mbegu.",
        [
          "Do not over-apply nitrogen.",
          "Combine organic matter with mineral fertilizer.",
          "Ask for rates suited to your soil.",
        ],
        [
          "Usiweke nitrojeni nyingi kupita kiasi.",
          "Changanya mbolea ya asili na ya madini.",
          "Omba viwango vinavyofaa udongo wako.",
        ]
      ),
      pests: sec(
        "OPVs face the same common maize pests and diseases as other maize. Their tolerance varies by variety. Scout for fall armyworm, stem borers, maize streak virus, MLN, grey leaf spot, rust and ear rots. Use clean seed, rotation, residue management and integrated pest management. Saved seed can carry pests and disease.",
        "Mbegu huria hukabiliana na wadudu na magonjwa ya kawaida ya mahindi kama mahindi mengine. Ustahimilivu hutofautiana kwa aina. Angalia viwavijeshi, wadudu wa shina, virusi vya mistari ya mahindi, MLN, madoa ya majani ya kijivu, kuvu na kuoza kwa magunzi. Tumia mbegu safi, mzunguko wa mazao, usimamizi wa mabaki na usimamizi jumuishi wa wadudu. Mbegu zilizohifadhiwa zinaweza kubeba wadudu na magonjwa.",
        [
          "Inspect saved seed before planting.",
          "Scout the crop every week.",
          "Do not claim resistance without a label or official advice.",
        ],
        [
          "Kagua mbegu zilizohifadhiwa kabla ya kupanda.",
          "Angalia zao kila wiki.",
          "Usidai ustahimilivu bila lebo au ushauri rasmi.",
        ]
      ),
      harvest: sec(
        "Harvest at maturity and dry grain to about 13% moisture. For seed, select healthy cobs from healthy plants, shell carefully to avoid damage, and store in a dry, airtight container. Test germination before using saved seed.",
        "Vuna zao likikomaa na kausha nafaka hadi unyevu wa takriban asilimia 13. Kwa mbegu, chagua magunzi yenye afya kutoka mimea yenye afya, toa punje kwa uangalifu ili zisiharibike, na hifadhi kwenye chombo kikavu kisichopitisha hewa. Pima kiwango cha kuota kabla ya kutumia mbegu zilizohifadhiwa.",
        [
          "Select seed from healthy plants, not from the whole pile.",
          "Store seed separately from grain for eating.",
          "Test germination before planting.",
        ],
        [
          "Chagua mbegu kutoka mimea yenye afya, si kutoka nafaka yote.",
          "Hifadhi mbegu tofauti na nafaka ya kula.",
          "Pima kiwango cha kuota kabla ya kupanda.",
        ]
      ),
      limitations: sec(
        "The category does not identify the OPV or guarantee its performance. Saved seed can lose vigour and purity over seasons if selection and isolation are poor. Buy certified seed when possible, keep records, and check TOSCI or extension advice for variety-specific recommendations.",
        "Kundi hili halitambui aina ya mbegu huria wala kuthibitisha matokeo yake. Mbegu zilizohifadhiwa zinaweza kupungua nguvu na usafi kwa misimu ikiwa uteuzi na kutenganisha ni hafifu. Nunua mbegu zilizothibitishwa inapowezekana, weka kumbukumbu, na angalia ushauri wa TOSCI au ugani kwa mapendekezo ya aina mahususi.",
        [
          "Saved seed is not automatically the same quality as certified seed.",
          "Poor isolation can reduce purity.",
          "Confirm choices with local extension staff.",
        ],
        [
          "Mbegu zilizohifadhiwa si lazima ziwe na ubora sawa na mbegu zilizothibitishwa.",
          "Kutotenganisha vizuri kunaweza kupunguza usafi wa mbegu.",
          "Thibitisha uchaguzi na afisa ugani wa eneo lako.",
        ]
      ),
    },
  },
};

export const REGION_ZONES = {
  northern: {
    name: bi("Northern Highlands", "Nyanda za Juu Kaskazini"),
    conditions: bi(
      "Cooler highland conditions, often above 1,000 m. Choose fields with reliable moisture, good drainage and soil conservation on slopes.",
      "Hali ya nyanda za juu yenye baridi kiasi, mara nyingi zaidi ya mita 1,000. Chagua mashamba yenye unyevu wa kuaminika, mtiririko mzuri wa maji na uhifadhi wa udongo kwenye miteremko."
    ),
    soil: bi(
      "Volcanic and loam soils are common and can be fertile, but some are acidic. Test pH and use terraces or contour conservation on slopes.",
      "Udongo wa volkano na tifutifu hupatikana kwa wingi na unaweza kuwa na rutuba, lakini baadhi ni tindikali. Pima pH na tumia matuta ya kontua au uhifadhi wa udongo kwenye miteremko."
    ),
    rainfall: bi(
      "Many areas receive two rainy seasons—vuli around October–December and masika around March–May—but amounts vary greatly with slope and location.",
      "Maeneo mengi hupata misimu miwili ya mvua—vuli takriban Oktoba–Desemba na masika takriban Machi–Mei—lakini kiasi hutofautiana sana kwa mteremko na eneo."
    ),
    season: bi(
      "Plant with a reliable rain onset. Cool temperatures slow growth, and high areas can experience cold or frost. Avoid late planting.",
      "Panda mvua inapoanza kwa kuaminika. Joto la chini hupunguza ukuaji, na maeneo ya juu yanaweza kupata baridi kali au barafu. Epuka kupanda kwa kuchelewa."
    ),
    advice: bi(
      "Match maturity and altitude to the specific variety. Medium- to late-maturing types may fit reliable highland areas; early types are safer where rains are short.",
      "Linganisha kipindi cha kukomaa na urefu wa eneo na aina mahususi. Aina za kati au zinazochelewa zinaweza kufaa nyanda za juu zenye mvua za kuaminika; aina za mapema ni salama zaidi pale mvua ni fupi."
    ),
  },
  southern: {
    name: bi("Southern Highlands", "Nyanda za Juu Kusini"),
    conditions: bi(
      "Cool to mild highland conditions with reliable long rains in many areas. Choose well-drained fields and protect soil from erosion.",
      "Hali ya nyanda za juu yenye baridi hadi joto la wastani na mvua za masika zinazoaminika kwenye maeneo mengi. Chagua mashamba yenye mtiririko mzuri wa maji na linda udongo dhidi ya mmomonyoko."
    ),
    soil: bi(
      "Loam and clay loam soils are common. Some soils are acidic; drainage and erosion control matter, especially on sloping land.",
      "Udongo tifutifu na tifutifu wa mfinyanzi hupatikana kwa wingi. Baadhi ya udongo ni tindikali; mtiririko wa maji na udhibiti wa mmomonyoko ni muhimu, hasa kwenye ardhi yenye mteremko."
    ),
    rainfall: bi(
      "Most areas have one long rainy season from about November to April. Rainfall can be high, and humid periods favour some leaf diseases.",
      "Maeneo mengi yana msimu mmoja mrefu wa mvua kuanzia takriban Novemba hadi Aprili. Mvua inaweza kuwa nyingi, na vipindi vya unyevu huongeza baadhi ya magonjwa ya majani."
    ),
    season: bi(
      "Plant early in the long rains. Late planting risks end-of-season dry spells. Watch disease pressure in wet, humid weather.",
      "Panda mapema kwenye mvua za masika. Kupanda kwa kuchelewa kuna hatari ya ukame mwishoni wa msimu. Angalia magonjwa wakati wa mvua na unyevu."
    ),
    advice: bi(
      "Medium- to late-maturing varieties may fit reliable high-rainfall areas, but altitude and the specific variety matter. Early types suit shorter or drier pockets.",
      "Aina za kati au zinazochelewa zinaweza kufaa maeneo yenye mvua nyingi zinazoaminika, lakini urefu wa eneo na aina mahususi ni muhimu. Aina za mapema hufaa maeneo yenye msimu mfupi au ukame kiasi."
    ),
  },
  lake: {
    name: bi("Lake Zone", "Kanda ya Ziwa"),
    conditions: bi(
      "Warm lake-basin conditions. Moisture reliability varies from area to area; sandy soils and striga are common constraints in some districts.",
      "Hali ya joto ya bonde la ziwa. Uaminifu wa unyevu hutofautiana kati ya maeneo; udongo wa mchanga na kiduwi (striga) ni changamoto katika baadhi ya wilaya."
    ),
    soil: bi(
      "Sandy loam and sandy soils are common. Organic matter is often low; add manure or compost and conserve moisture.",
      "Udongo wa mchanga tifutifu na mchanga hupatikana kwa wingi. Mbolea ya asili mara nyingi ni ndogo; ongeza samadi au mboji na hifadhi unyevu."
    ),
    rainfall: bi(
      "Rainfall is bimodal in parts of the north-west and more variable or unimodal elsewhere. Amounts and dry spells differ widely by district.",
      "Mvua ni za misimu miwili katika sehemu za kaskazini-magharibi na zinabadilika zaidi au ni za msimu mmoja kwingine. Kiasi na vipindi vya ukame hutofautiana sana kwa wilaya."
    ),
    season: bi(
      "Plant with the first reliable rains. Dry spells can occur during the season; early or medium maturity reduces risk.",
      "Panda mvua za kwanza zinazoaminika. Vipindi vya ukame vinaweza kutokea msimuni; kukomaa mapema au kati hupunguza hatari."
    ),
    advice: bi(
      "Choose early to medium varieties where rains are short, and manage striga with rotation, tolerant crops and good soil fertility.",
      "Chagua aina za mapema hadi kati pale mvua ni fupi, na dhibiti kiduwi kwa mzunguko wa mazao, mazao yanayostahimili na rutuba nzuri ya udongo."
    ),
  },
  central: {
    name: bi("Central Zone", "Kanda ya Kati"),
    conditions: bi(
      "Semi-arid plateau with short, variable rainfall. Moisture conservation and early planting are important.",
      "Nyanda za kati zenye ukame wa kiasi na mvua fupi isiyotabirika. Kuhifadhi unyevu na kupanda mapema ni muhimu."
    ),
    soil: bi(
      "Sandy and loamy soils with low organic matter are common. Wind and water erosion can be significant; add organic matter and use conservation practices.",
      "Udongo wa mchanga na tifutifu wenye mbolea ya asili ndogo hupatikana kwa wingi. Mmomonyoko wa upepo na maji unaweza kuwa mkubwa; ongeza mbolea ya asili na tumia mbinu za uhifadhi."
    ),
    rainfall: bi(
      "Usually one main rainy season with roughly 500–800 mm in many areas, but the onset and distribution are uncertain.",
      "Kwa kawaida msimu mmoja mkuu wa mvua wenye takriban mm 500–800 kwenye maeneo mengi, lakini mwanzo na mgawanyo wake hautabiriki."
    ),
    season: bi(
      "Plant as soon as the rains are established. Drought at flowering is a major risk; avoid late-maturing varieties.",
      "Panda mara mvua inapothibitika. Ukame wakati wa kutoa maua ni hatari kubwa; epuka aina zinazochelewa kukomaa."
    ),
    advice: bi(
      "Early, drought-tolerant varieties are generally safer. Use mulch, tied ridges or other moisture conservation and confirm locally available options.",
      "Aina za mapema zinazostahimili ukame kwa kawaida ni salama zaidi. Tumia matandazo, matuta au mbinu nyingine za kuhifadhi unyevu na uthibitisha chaguo zinazopatikana eneo lako."
    ),
  },
  eastern: {
    name: bi("Eastern & Coastal Zone", "Kanda ya Mashariki na Pwani"),
    conditions: bi(
      "Warm, often humid conditions from sea level to about 1,000 m. Sandy soils, salinity in some areas and high pest pressure require attention.",
      "Hali ya joto na mara nyingi unyevu kutoka usawa wa bahari hadi takriban mita 1,000. Udongo wa mchanga, chumvi kwenye baadhi ya maeneo na wadudu wengi huhitaji uangalifu."
    ),
    soil: bi(
      "Sandy and sandy loam soils are common; some coastal soils are saline. Improve organic matter, use well-drained fields and manage salinity where it occurs.",
      "Udongo wa mchanga na mchanga tifutifu hupatikana kwa wingi; baadhi ya udongo wa pwani una chumvi. Ongeza mbolea ya asili, tumia mashamba yenye mtiririko mzuri wa maji na dhibiti chumvi inapotokea."
    ),
    rainfall: bi(
      "Many coastal areas have two rainy seasons, but amounts vary. Heavy rain can waterlog low fields, while dry spells can occur within the season.",
      "Maeneo mengi ya pwani yana misimu miwili ya mvua, lakini kiasi hutofautiana. Mvua kubwa inaweza kujaza maji kwenye mashamba ya chini, wakati vipindi vya ukame vinaweza kutokea ndani ya msimu."
    ),
    season: bi(
      "Plant with the rains, ensuring good drainage. Heat and humidity increase disease and pest pressure; scout regularly.",
      "Panda wakati wa mvua, ukihakikisha mtiririko mzuri wa maji. Joto na unyevu huongeza magonjwa na wadudu; angalia shamba mara kwa mara."
    ),
    advice: bi(
      "Choose early to medium, locally adapted varieties. Where salinity or waterlogging is a problem, seek specific advice before planting.",
      "Chagua aina za mapema hadi kati zilizozoea eneo. Pale chumvi au maji kutuama ni tatizo, pata ushauri mahususi kabla ya kupanda."
    ),
  },
  western: {
    name: bi("Western Zone", "Kanda ya Magharibi"),
    conditions: bi(
      "Warm inland conditions with a single main rainy season in many areas. Rainfall reliability varies, and transport or storage conditions can affect seed and grain quality.",
      "Hali ya joto ya bara yenye msimu mmoja mkuu wa mvua kwenye maeneo mengi. Uaminifu wa mvua hutofautiana, na hali za usafiri au uhifadhi zinaweza kuathiri ubora wa mbegu na nafaka."
    ),
    soil: bi(
      "Loam and sandy loam soils are common. Some soils are acidic or low in organic matter; use soil tests and organic inputs where available.",
      "Udongo tifutifu na mchanga tifutifu hupatikana kwa wingi. Baadhi ya udongo ni tindikali au una mbolea ya asili ndogo; tumia vipimo vya udongo na mbolea ya asili inapopatikana."
    ),
    rainfall: bi(
      "Usually one rainy season from about November to April, with variable totals. Dry spells can affect flowering.",
      "Kwa kawaida msimu mmoja wa mvua kuanzia takriban Novemba hadi Aprili, wenye kiasi kinachobadilika. Vipindi vya ukame vinaweza kuathiri kutoa maua."
    ),
    season: bi(
      "Plant early in the main season. Prepare storage before harvest because humidity and pests can damage grain.",
      "Panda mapema kwenye msimu mkuu. Andaa ghala kabla ya mavuno kwa sababu unyevu na wadudu wanaweza kuharibu nafaka."
    ),
    advice: bi(
      "Medium-maturing varieties may fit areas with a full rainy season; early varieties are safer in drier pockets. Confirm the variety's altitude range.",
      "Aina za kati zinaweza kufaa maeneo yenye msimu kamili wa mvua; aina za mapema ni salama zaidi kwenye maeneo makavu. Thibitisha urefu wa eneo unaofaa kwa aina."
    ),
  },
  zanzibar: {
    name: bi("Zanzibar & Pemba", "Zanzibar na Pemba"),
    conditions: bi(
      "Hot, humid island conditions with sandy or coral-derived soils. Drainage, salinity and pest pressure need attention.",
      "Hali ya joto na unyevu ya visiwani yenye udongo wa mchanga au uliotokana na matumbawe. Mtiririko wa maji, chumvi na wadudu huhitaji uangalifu."
    ),
    soil: bi(
      "Sandy and coral-derived soils are common, often with low organic matter and some salinity. Use compost, raised beds or ridges where drainage is poor.",
      "Udongo wa mchanga na uliotokana na matumbawe hupatikana kwa wingi, mara nyingi wenye mbolea ya asili ndogo na chumvi kiasi. Tumia mboji, matuta au vitanda vilivyoinuliwa pale mtiririko wa maji ni mbaya."
    ),
    rainfall: bi(
      "Two rainy seasons are typical, with heavy rain possible. Dry spells can still occur, and low-lying fields may waterlog.",
      "Kwa kawaida kuna misimu miwili ya mvua, na mvua kubwa inaweza kutokea. Vipindi vya ukame bado vinaweza kutokea, na mashamba ya chini yanaweza kujaa maji."
    ),
    season: bi(
      "Plant with the rains and maintain drainage. Heat and humidity increase pest and disease pressure; scout often.",
      "Panda wakati wa mvua na dumisha mtiririko wa maji. Joto na unyevu huongeza wadudu na magonjwa; angalia shamba mara kwa mara."
    ),
    advice: bi(
      "Choose early to medium, locally adapted varieties and seek island-specific extension advice, especially where salinity is present.",
      "Chagua aina za mapema hadi kati zilizozoea eneo na pata ushauri wa ugani wa visiwani, hasa pale chumvi ilipo."
    ),
  },
};

const region = (id, en, sw, zone, noteEn, noteSw) => ({
  id,
  name: bi(en, sw),
  zone,
  note: bi(noteEn, noteSw),
});

export const REGIONS = [
  region("arusha", "Arusha", "Arusha", "northern",
    "Includes cool highland areas and drier plains. Match maturity to altitude; frost is possible in high areas.",
    "Inajumuisha nyanda za juu zenye baridi na tambarare kame. Linganisha kukomaa na urefu wa eneo; baridi kali inawezekana kwenye maeneo ya juu."),
  region("dar-es-salaam", "Dar es Salaam", "Dar es Salaam", "eastern",
    "Hot coastal conditions with sandy soils. Use well-drained fields and watch salinity in some areas.",
    "Hali ya joto ya pwani na udongo wa mchanga. Tumia mashamba yenye mtiririko mzuri wa maji na angalia chumvi kwenye baadhi ya maeneo."),
  region("dodoma", "Dodoma", "Dodoma", "central",
    "Drought risk is highest on shallow or compacted soils. Time planting to the first reliable rains and conserve moisture around the roots.",
    "Hatari ya ukame huwa juu zaidi kwenye udongo mdogo au uliobanwa. Panda mvua za kwanza zinazoaminika na hifadhi unyevu kuzunguka mizizi."),
  region("geita", "Geita", "Geita", "lake",
    "Lake-zone conditions with variable rainfall. Striga can be a constraint in some districts.",
    "Hali ya Kanda ya Ziwa yenye mvua zinazobadilika. Kiduwi (striga) kinaweza kuwa changamoto kwenye baadhi ya wilaya."),
  region("iringa", "Iringa", "Iringa", "southern",
    "Southern Highlands with reliable long rains in many areas. Cooler conditions suit medium to late types where altitude and moisture allow.",
    "Nyanda za Juu Kusini zenye mvua za masika zinazoaminika kwenye maeneo mengi. Hali ya baridi kiasi hufaa aina za kati hadi zinazochelewa pale urefu wa eneo na unyevu vinaruhusu."),
  region("kagera", "Kagera", "Kagera", "lake",
    "Bimodal rains in many areas and warm conditions. Banana–maize systems need attention to soil erosion and fertility.",
    "Mvua za misimu miwili kwenye maeneo mengi na hali ya joto. Mifumo ya ndizi na mahindi huhitaji uangalifu kwa mmomonyoko na rutuba ya udongo."),
  region("katavi", "Katavi", "Katavi", "western",
    "Western conditions with a single main rainy season in many areas. Match maturity to rainfall duration.",
    "Hali ya magharibi yenye msimu mmoja mkuu wa mvua kwenye maeneo mengi. Linganisha kipindi cha kukomaa na urefu wa msimu wa mvua."),
  region("kigoma", "Kigoma", "Kigoma", "western",
    "Warm western conditions with variable rainfall. Plan storage before harvest to protect grain.",
    "Hali ya joto ya magharibi yenye mvua zinazobadilika. Panga uhifadhi kabla ya mavuno kulinda nafaka."),
  region("kilimanjaro", "Kilimanjaro", "Kilimanjaro", "northern",
    "Ranges from hot lowlands to cool highlands. Choose a variety by altitude; frost risk is real in high areas.",
    "Huanzia nyanda za chini zenye joto hadi nyanda za juu zenye baridi. Chagua aina kwa kuzingatia urefu wa eneo; hatari ya baridi kali ipo kwenye maeneo ya juu."),
  region("lindi", "Lindi", "Lindi", "eastern",
    "Coastal conditions with heat, humidity and sandy soils. Early to medium types and regular scouting are prudent.",
    "Hali ya pwani yenye joto, unyevu na udongo wa mchanga. Aina za mapema hadi kati na uangalizi wa mara kwa mara ni busara."),
  region("manyara", "Manyara", "Manyara", "northern",
    "Diverse zone with dry lowlands and cooler highlands. Choose by altitude and rainfall; early types are safer in dry areas.",
    "Kanda yenye tofauti kati ya nyanda za chini kame na nyanda za juu zenye baridi. Chagua kwa kuzingatia urefu na mvua; aina za mapema ni salama zaidi maeneo kame."),
  region("mara", "Mara", "Mara", "lake",
    "Lake-zone conditions, with bimodal rains in parts. Rainfall varies; manage striga and soil fertility.",
    "Hali ya Kanda ya Ziwa, na mvua za misimu miwili kwenye baadhi ya sehemu. Mvua hutofautiana; dhibiti kiduwi na rutuba ya udongo."),
  region("mbeya", "Mbeya", "Mbeya", "southern",
    "Southern Highlands with reliable long rains and cooler temperatures. Ensure drainage and watch leaf diseases in wet periods.",
    "Nyanda za Juu Kusini zenye mvua za masika zinazoaminika na joto la chini. Hakikisha mtiririko wa maji na angalia magonjwa ya majani wakati wa mvua."),
  region("morogoro", "Morogoro", "Morogoro", "eastern",
    "Includes coastal lowlands and cooler highland areas. Choose by altitude; humidity can increase disease pressure.",
    "Inajumuisha nyanda za chini za pwani na nyanda za juu zenye baridi. Chagua kwa kuzingatia urefu wa eneo; unyevu unaweza kuongeza magonjwa."),
  region("mtwara", "Mtwara", "Mtwara", "eastern",
    "Hot coastal conditions with sandy soils. Use early to medium types and check for salinity in low-lying fields.",
    "Hali ya joto ya pwani na udongo wa mchanga. Tumia aina za mapema hadi kati na angalia chumvi kwenye mashamba ya chini."),
  region("mwanza", "Mwanza", "Mwanza", "lake",
    "Lake-zone conditions with variable rainfall and sandy soils. Early to medium types reduce risk in short seasons.",
    "Hali ya Kanda ya Ziwa yenye mvua zinazobadilika na udongo wa mchanga. Aina za mapema hadi kati hupunguza hatari kwenye misimu mifupi."),
  region("njombe", "Njombe", "Njombe", "southern",
    "High Southern Highlands with cool temperatures and good rainfall. Late types may fit, but frost and drainage need attention.",
    "Nyanda za Juu Kusini zenye joto la chini na mvua nzuri. Aina zinazochelewa zinaweza kufaa, lakini baridi kali na mtiririko wa maji huhitaji uangalifu."),
  region("pwani", "Pwani", "Pwani", "eastern",
    "Coastal region with bimodal rains in many areas, sandy soils and humidity. Choose well-drained fields.",
    "Mkoa wa pwani wenye mvua za misimu miwili kwenye maeneo mengi, udongo wa mchanga na unyevu. Chagua mashamba yenye mtiririko mzuri wa maji."),
  region("rukwa", "Rukwa", "Rukwa", "southern",
    "Long rains are typical in many parts. Medium to late types may fit where rainfall and fertility are reliable.",
    "Mvua za masika ni za kawaida kwenye maeneo mengi. Aina za kati hadi zinazochelewa zinaweza kufaa pale mvua na rutuba ni za kuaminika."),
  region("ruvuma", "Ruvuma", "Ruvuma", "southern",
    "Warm southern conditions with a long rainy season. Plan for storage pests after harvest.",
    "Hali ya joto ya kusini yenye msimu mrefu wa mvua. Panga kudhibiti wadudu wa ghala baada ya mavuno."),
  region("shinyanga", "Shinyanga", "Shinyanga", "lake",
    "Transition between lake and central conditions, with variable rainfall. Early, drought-tolerant types reduce risk.",
    "Eneo la mpito kati ya Kanda ya Ziwa na Kati, lenye mvua zinazobadilika. Aina za mapema zinazostahimili ukame hupunguza hatari."),
  region("simiyu", "Simiyu", "Simiyu", "lake",
    "Lake-zone conditions with sandy soils and variable rainfall. Striga management and moisture conservation matter.",
    "Hali ya Kanda ya Ziwa yenye udongo wa mchanga na mvua zinazobadilika. Kudhibiti kiduwi na kuhifadhi unyevu ni muhimu."),
  region("singida", "Singida", "Singida", "central",
    "Dry spells can occur within the rainy season. Weed early and conserve moisture around the root zone.",
    "Vipindi vya ukame vinaweza kutokea ndani ya msimu wa mvua. Palilia mapema na hifadhi unyevu kuzunguka mzizi."),
  region("songwe", "Songwe", "Songwe", "southern",
    "Southern Highlands with cool temperatures and reliable rains in many areas. Watch drainage and leaf disease.",
    "Nyanda za Juu Kusini zenye joto la chini na mvua zinazoaminika kwenye maeneo mengi. Angalia mtiririko wa maji na magonjwa ya majani."),
  region("tabora", "Tabora", "Tabora", "western",
    "Western conditions with one main rainy season. Store grain carefully because of humidity and storage pests.",
    "Hali ya magharibi yenye msimu mmoja mkuu wa mvua. Hifadhi nafaka kwa uangalifu kwa sababu ya unyevu na wadudu wa ghala."),
  region("tanga", "Tanga", "Tanga", "eastern",
    "Coastal and highland areas with variable rainfall. Choose by altitude and scout for pests in humid periods.",
    "Maeneo ya pwani na nyanda za juu yenye mvua zinazobadilika. Chagua kwa kuzingatia urefu na angalia wadudu wakati wa unyevu."),
  region("kaskazini-unguja", "Unguja North", "Kaskazini Unguja", "zanzibar",
    "Island conditions with sandy soils, heat and humidity. Use early to medium types and ensure drainage.",
    "Hali ya visiwani yenye udongo wa mchanga, joto na unyevu. Tumia aina za mapema hadi kati na hakikisha mtiririko wa maji."),
  region("kusini-unguja", "Unguja South", "Kusini Unguja", "zanzibar",
    "Island conditions with sandy or coral-derived soils. Salinity and drainage need attention.",
    "Hali ya visiwani yenye udongo wa mchanga au wa matumbawe. Chumvi na mtiririko wa maji huhitaji uangalifu."),
  region("mjini-magharibi", "Mjini Magharibi (Zanzibar Urban/West)", "Mjini Magharibi", "zanzibar",
    "Urban and peri-urban island conditions. Use locally available seed advice and protect fields from waterlogging.",
    "Hali ya visiwani ya mijini na pembezoni. Tumia ushauri wa mbegu zinazopatikana eneo na linda mashamba dhidi ya maji kutuama."),
  region("kaskazini-pemba", "Pemba North", "Kaskazini Pemba", "zanzibar",
    "Hot, humid island conditions with sandy soils. Manage salinity, drainage and pests.",
    "Hali ya joto na unyevu ya visiwani yenye udongo wa mchanga. Dhibiti chumvi, mtiririko wa maji na wadudu."),
  region("kusini-pemba", "Pemba South", "Kusini Pemba", "zanzibar",
    "Island conditions with two rainy seasons and sandy soils. Choose adapted early to medium types.",
    "Hali ya visiwani yenye misimu miwili ya mvua na udongo wa mchanga. Chagua aina za mapema hadi kati zilizozoea eneo."),
];

export const QUICK_REGIONS = ["mbeya", "iringa", "dodoma", "mwanza"];

export function findRegion(id) {
  return REGIONS.find((item) => item.id === id) || null;
}

export function regionDisplay(regionItem, lang) {
  const zone = REGION_ZONES[regionItem.zone];
  const t = (pair) => pair[lang] || pair.en;
  const pattern = {
    en: "Rainfall reliability and timing vary within the region; confirm the current seasonal forecast and local advice.",
    sw: "Uaminifu na muda wa mvua hutofautiana ndani ya mkoa; thibitisha utabiri wa msimu na ushauri wa eneo.",
  };
  return {
    zone: t(zone.name),
    conditions: t(zone.conditions),
    localNote: t(regionItem.note),
    soil: `${t(zone.soil)} ${t(zone.rainfall)}`,
    season: `${t(zone.season)} ${t(pattern)}`,
    advice: t(zone.advice),
  };
}

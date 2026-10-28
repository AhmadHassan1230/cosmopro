# Cosmopro: media brief and open items

Drop new files into `assets/` under the exact names below, then run `node tools/build.mjs`. The build only adds a video once its file exists, and it versions every asset URL, so replacing a file under the same name shows up straight away.

Palette for every asset (the site is lilac, like their old site): soft lilac `#EFE8F6`, lilac mist `#D9CAEC`, deep aubergine `#221A2E`, frosted white glass, lavender serum, violet accent `#6C4A99`. Keep it soft and powdery, never neon purple. No logos, no readable text, no people's faces.

---

## 1. Videos: done (2026-10-28)

All six Flow clips are in `assets/video`. Each one got:
- a light lilac grade (half strength on hair colour, so the dye keeps its brown);
- a 0.8 s crossfade from its end into its start, so the loop is seamless;
- H.264 compression with no audio.

The original downloads are untouched.

| File | Source clip | Size |
|---|---|---|
| `hero.mp4` (1920×1080) | Serum drop falls into bottle | 1.1 MB |
| `hero-mobile.mp4` (720×1280) | Serum drop falling into bottle (vertical) | 0.6 MB |
| `skincare.mp4` (1280×720) | Cream and serum product film | 0.6 MB |
| `haircare.mp4` | Conditioner pouring past shampoo | 0.6 MB |
| `hair-colour.mp4` | Mixing hair colour in bowl | 1.4 MB |
| `toiletries.mp4` | Foam building on basin | 0.7 MB |

The posters (`poster-hero*.jpg`, `cat-*.jpg`) are each clip's first frame, so there's no visible change when the video starts. `hair-cleansing.jpg` and `hair-developers.jpg` are later frames of the haircare and hair-colour clips.

To redo a clip, keep the same file name. The re-encode recipe is in `tools/encode-video.sh` (scale, grade, loop crossfade, CRF 25–27).

---

## 2. Stills

Done: all ten new images are placed.
- Client types: the founder's desk, the lilac bottle line and the retail shelf.
- Factory: the production hall, the gloved hand on the valve and the filling nozzles.
- Private label and moisturisers: the bottles and jars on stone.
- Toiletries: the soap pumps. Hair colour: the colour tubes.
- Skincare lines: the triptych was split into three panels (jar → anti-ageing, dropper → serums, tube → face cleansing).

Still old placeholders with the old logo on the bottles (4:5, 2000px or more):

| File | Used for | Prompt |
|---|---|---|
| `skin-spf.jpg` | Sun protection | Unbranded white sunscreen tubes and a milky SPF fluid swatch on pale stone against a soft lilac wall, bright daylight. |
| `skin-moisturisers.jpg` | Men's grooming | Unbranded matte aubergine and white bottles: face wash, moisturiser, beard oil dropper; pale stone, soft lilac wall. |
| `hair-treatment.jpg` | Hair treatment | Unbranded hair mask jar, leave-in spray and a hair-oil dropper, a glossy mask swatch; pale stone, soft lilac wall. |
| `hair-styling.jpg` | Hair styling | Unbranded styling gel tube, wax tin and hair mist bottle; pale stone, soft lilac wall. |

Nice to have at higher resolution: the three triptych panels are only 392px wide each. Separate 4:5 renders of the jar, dropper and tube scenes would look sharper on retina screens.

---

## 3. Confirm with Cosmopro before launch

Content:
- [ ] **ISO 22716 (cosmetic GMP).** The old site claims it only inside copied template text, and there's no certificate on file. It's left off the site until confirmed.
- [ ] **"200+ products formulated / 50+ brands supported".** Same copied paragraph, so not used. Add them back to `stats` in `data.js` if they're true.
- [ ] **Client names.** The PSQCA licence covers "Stillman's" skin cream. If Cosmopro can name the brands it makes for, a short "Made for" row would build trust.
- [ ] **Response time.** The Start a project page says "within two working days".
- [ ] **Minimum order quantities.** The old site showed 300 kg as the heading for Personal care and Home care but 100 kg on every line. The site uses 100 kg.
- [ ] **Kitchen care.** The old list included "Hair perfume mist", which looks like a mistake and has been removed there (it stays under Hair styling).

Contact and setup (all in `data.js` → `site`):
- [ ] Which mobile number takes WhatsApp (currently +92 324 8592259).
- [ ] Office hours. The old site said "9–5 GMT", copied from a UK template; the site now says PKT.
- [ ] Form delivery. Forms currently open a pre-filled email to contact@cosmopro.net, with a WhatsApp option. For direct delivery, add a Formspree or Web3Forms URL as `formEndpoint`.
- [ ] Social links. The old footer had icons with no links. Add `{ label, url }` pairs to `socials`.
- [ ] Domain. Canonical URLs and the sitemap use `https://cosmopro.net`.

Removed from the old site because it was another company's text:
- The UK self-tan copy on Services and Enquire Here ("WLC products", EcoCert, CPNP, "made in the UK", spray tan ranges).
- "At Creative Cosmetics we specialise in colour cosmetics…" on Product Range.
- The "Spray Tan Solution" option in the enquiry form.

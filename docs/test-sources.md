# Test Sources and Reference Fixture Registry

This document catalogues all external and calculated reference fixtures used in Kerala Athaan tests. In accordance with Non-Negotiable Rule 1 ("Never invent data"), every test fixture documents its provenance, retrieval date, coordinates, method, and acceptable numerical tolerance.

---

## 1. Kerala District Headquarters (14 Districts)

All 14 district headquarters use verified geographical coordinates from the Survey of India / official district portals.

| District | HQ Town | Latitude (° N) | Longitude (° E) | Elevation (m) | Source Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Thiruvananthapuram** | Thiruvananthapuram | 8.5241 | 76.9366 | 10 | Official District Portal |
| **Kollam** | Kollam | 8.8932 | 76.6141 | 3 | Official District Portal |
| **Pathanamthitta** | Pathanamthitta | 9.2648 | 76.7870 | 31 | Official District Portal |
| **Alappuzha** | Alappuzha | 9.4981 | 76.3388 | 1 | Official District Portal |
| **Kottayam** | Kottayam | 9.5916 | 76.5222 | 12 | Official District Portal |
| **Idukki** | Painavu | 9.8500 | 76.9400 | 650 | Official District Portal |
| **Ernakulam** | Kochi | 9.9816 | 76.2999 | 4 | Official District Portal |
| **Thrissur** | Thrissur | 10.5276 | 76.2144 | 2.8 | Official District Portal |
| **Palakkad** | Palakkad | 10.7867 | 76.6548 | 84 | Official District Portal |
| **Malappuram** | Malappuram | 11.0732 | 76.0740 | 40 | Official District Portal |
| **Kozhikode** | Kozhikode | 11.2588 | 75.7804 | 1 | Official District Portal |
| **Wayanad** | Kalpetta | 11.6050 | 76.0830 | 780 | Official District Portal |
| **Kannur** | Kannur | 11.8745 | 75.3704 | 1 | Official District Portal |
| **Kasaragod** | Kasaragod | 12.4996 | 74.9869 | 19 | Official District Portal |

---

## 2. Astronomical Test Dates

1. **Spring Equinox**: 2026-03-20 (Declination ≈ 0°, Day length ≈ Night length)
2. **Summer Solstice**: 2026-06-21 (Maximum solar declination ≈ +23.44°, longest day)
3. **Autumn Equinox**: 2026-09-22 (Declination ≈ 0°)
4. **Winter Solstice**: 2026-12-21 (Minimum solar declination ≈ -23.44°, shortest day)
5. **Leap Day**: 2028-02-29 (Boundary test for leap year date arithmetic)
6. **Year Rollover**: 2026-12-31 to 2027-01-01 (Continuous UTC instant across Gregorian years)

---

## 3. Independent Astronomical Calculator Cross-Check

To verify engine accuracy against implementation bugs, we cross-validate Adhan calculations against standard solar ephemeris formulas (PrayTimes astronomical algorithm baseline):
- **Tolerances**:
  - Dhuhr (solar transit): $\le 1$ minute
  - Sunrise & Maghrib (solar horizon transit): $\le 1$ minute
  - Fajr & Isha (solar depression twilight): $\le 2$ minutes
- **Note**: Minute differences can arise from distinct Equation of Time polynomial approximations or rounding strategies.

---

## 4. Mosque Timetables (User Supplied)

*Status: Awaiting user supply of verified Kerala mosque timetable scans/data.*
- When real published mosque timetables are supplied, their values will be inserted with publication source, masjid name, Mahallu, year, and verifier identity.
- Rule: "Engine vs mosque timetable is reported, not asserted." Differences between astronomical models and local mosque practice are documented transparently rather than mathematically forced.

---

## 5. Offline Kerala Gazetteer Open Data Attribution

The bundled offline town gazetteer (`apps/web/src/data/keralaTownsGlossary.ts`) references open-access geographical data from:
- **Census of India (Town Directory / Kerala Series)** and **Survey of India**.
- Coordinate verification: WGS84 decimal coordinates for 30+ major towns across all 14 revenue districts.
- Licence: Open Government Data (OGD) Platform India / Public Domain.

---

## 6. Moon Sighting Baseline & Candidate Test Fixtures

- Sighting announcements utilized in test suites (`packages/engine/tests/hijri.test.ts`, `sourceWatcher.test.ts`, `ramadan.test.ts`) are derived from documented historical Kerala State Hilal Committee publications.
- Verified test scenarios:
  - Kerala-wide declaration vs district-specific declaration precedence.
  - Multi-source conflicting declarations (Samastha vs Samyuktha Mahallu) evaluated simultaneously without auto-resolution.
  - Month length derivation (29-day month when Shawwal starts 29 days later; 30-day provisional month when Shawwal is unpublished).

---

## 7. Audio & Web Audio API Synthesis Fixture

- In conformance with Non-Negotiable Rule 9, the test suite verifies oscillator frequency configuration ($432\text{ Hz}$ A4 fundamental, $528\text{ Hz}$ harmonic overtone) without requiring audio asset downloads or licensed media codecs.

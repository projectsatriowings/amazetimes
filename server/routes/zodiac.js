import express from 'express';
import { query } from '../db.js';
import { authenticate, requireReporterOrAdmin, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fallback in-memory seed in case table is bootstrapping
const fallbackZodiac = [
  { id: 1, sign_code: 'aries', name_ta: 'மேஷம்', name_en: 'Aries', glyph: '♈', ruling_planet: 'செவ்வாய்', prediction_text: 'இன்று புதிய முயற்சிகளில் வெற்றி கிட்டும். உத்தியோகத்தில் சக ஊழியர்களின் ஆதரவு கிடைக்கும். நிதி நிலைமை சீராக இருக்கும்.', lucky_number: '9', lucky_color: 'சிவப்பு', lucky_direction: 'கிழக்கு' },
  { id: 2, sign_code: 'taurus', name_ta: 'ரிஷபம்', name_en: 'Taurus', glyph: '♉', ruling_planet: 'சுக்கிரன்', prediction_text: 'குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும். வியாபாரத்தில் எதிர்பாராத லாபம் கிடைக்கும். ஆரோக்கியத்தில் கவனம் தேவை.', lucky_number: '6', lucky_color: 'வெள்ளை', lucky_direction: 'தெற்கு' },
  { id: 3, sign_code: 'gemini', name_ta: 'மிதுனம்', name_en: 'Gemini', glyph: '♊', ruling_planet: 'புதன்', prediction_text: 'பேச்சுத்திறமையால் காரியங்களைச் சாதிப்பீர்கள். பயணங்கள் அனுகூலமாக அமையும். நண்பர்கள் மூலம் சுபச்செய்தி வரும்.', lucky_number: '5', lucky_color: 'பச்சை', lucky_direction: 'வடக்கு' },
  { id: 4, sign_code: 'cancer', name_ta: 'கடகம்', name_en: 'Cancer', glyph: '♋', ruling_planet: 'சந்திரன்', prediction_text: 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். தாய்வழி உறவினர்களால் ஆதாயம் உண்டு. சுபகாரிய முயற்சிகள் கைகூடும்.', lucky_number: '2', lucky_color: 'வெள்ளி/வெள்ளை', lucky_direction: 'வடமேற்கு' },
  { id: 5, sign_code: 'simmam', name_ta: 'சிம்மம்', name_en: 'Leo', glyph: '♌', ruling_planet: 'சூரியன்', prediction_text: 'அரசு வழி காரியங்கள் தடையின்றி முடியும். சமூகத்தில் மதிப்பும் மரியாதையும் உயரும். தந்தையாரின் ஆசி கிட்டும்.', lucky_number: '1', lucky_color: 'தங்கம்/மஞ்சள்', lucky_direction: 'கிழக்கு' },
  { id: 6, sign_code: 'virgo', name_ta: 'கன்னி', name_en: 'Virgo', glyph: '♍', ruling_planet: 'புதன்', prediction_text: 'தொழிலில் புதிய ஒப்பந்தங்கள் கையெழுத்தாகும். செலவுகளைக் கட்டுப்படுத்துவது நல்லது. ஆன்மிக சிந்தனை மேலோங்கும்.', lucky_number: '5', lucky_color: 'பச்சை', lucky_direction: 'தெற்கு' },
  { id: 7, sign_code: 'libra', name_ta: 'துலாம்', name_en: 'Libra', glyph: '♎', ruling_planet: 'சுக்கிரன்', prediction_text: 'கூட்டுத் தொழிலில் நல்ல முன்னேற்றம் ஏற்படும். வாழ்க்கைத் துணையின் ஆதரவு உற்சாகம் தரும். பணவரவு திருப்திகரமாக இருக்கும்.', lucky_number: '6', lucky_color: 'வெளிர் நீலம்', lucky_direction: 'மேற்கு' },
  { id: 8, sign_code: 'scorpio', name_ta: 'விருச்சிகம்', name_en: 'Scorpio', glyph: '♏', ruling_planet: 'செவ்வாய்', prediction_text: 'கடின உழைப்பிற்கு ஏற்ற அங்கீகாரம் கிடைக்கும். எதிரிகள் விலகிச் செல்வர். பூர்வீக சொத்து விவகாரங்கள் சுமுகமாகும்.', lucky_number: '9', lucky_color: 'சிவப்பு/மெரூன்', lucky_direction: 'வடக்கு' },
  { id: 9, sign_code: 'sagittarius', name_ta: 'தனுசு', name_en: 'Sagittarius', glyph: '♐', ruling_planet: 'குரு', prediction_text: 'பெரியோர்களின் வழிகாட்டுதல் நற்பலன் தரும். ஆன்மிக தலங்களுக்குச் சென்று வரும் வாய்ப்பு அமையும். சுபச்செலவுகள் கூடும்.', lucky_number: '3', lucky_color: 'மஞ்சள்', lucky_direction: 'வடகிழக்கு' },
  { id: 10, sign_code: 'capricorn', name_ta: 'மகரம்', name_en: 'Capricorn', glyph: '♑', ruling_planet: 'சனி', prediction_text: 'பொறுமையுடன் செயல்பட்டால் வெற்றி நிச்சயம். புதிய முதலீடுகளைத் திட்டமிடுவீர்கள். வாகனப் பயணத்தில் கவனம் தேவை.', lucky_number: '8', lucky_color: 'நீலம்', lucky_direction: 'மேற்கு' },
  { id: 11, sign_code: 'aquarius', name_ta: 'கும்பம்', name_en: 'Aquarius', glyph: '♒', ruling_planet: 'சனி', prediction_text: 'நண்பர்கள் மற்றும் உடன் பிறந்தோரின் உதவி கிட்டும். நீண்ட நாள் ஆசைகள் நிறைவேறும். தொழிலில் லாபம் அதிகரிக்கும்.', lucky_number: '8', lucky_color: 'கருநீலம்', lucky_direction: 'வடக்கு' },
  { id: 12, sign_code: 'pisces', name_ta: 'மீனம்', name_en: 'Pisces', glyph: '♓', ruling_planet: 'குரு', prediction_text: 'எடுத்த காரியங்கள் இனிதே நிறைவேறும். பணவரவு தாராளமாக இருக்கும். குடும்பத்தில் சுபகாரியப் பேச்சுவார்த்தைகள் தொடங்கும்.', lucky_number: '3', lucky_color: 'பொன்மஞ்சள்', lucky_direction: 'கிழக்கு' }
];

// Helper: Auto-ensure table exists
async function ensureZodiacTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS zodiac_horoscopes (
      id SERIAL PRIMARY KEY,
      sign_code VARCHAR(30) UNIQUE NOT NULL,
      name_ta VARCHAR(50) NOT NULL,
      name_en VARCHAR(50) NOT NULL,
      glyph VARCHAR(10) NOT NULL,
      ruling_planet VARCHAR(50),
      prediction_text TEXT NOT NULL,
      lucky_number VARCHAR(20) DEFAULT '7',
      lucky_color VARCHAR(50) DEFAULT 'மஞ்சள்',
      lucky_direction VARCHAR(50) DEFAULT 'கிழக்கு',
      horoscope_date DATE DEFAULT CURRENT_DATE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const countRes = await query('SELECT COUNT(*) FROM zodiac_horoscopes');
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    for (const item of fallbackZodiac) {
      await query(`
        INSERT INTO zodiac_horoscopes (id, sign_code, name_ta, name_en, glyph, ruling_planet, prediction_text, lucky_number, lucky_color, lucky_direction)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (sign_code) DO NOTHING;
      `, [item.id, item.sign_code, item.name_ta, item.name_en, item.glyph, item.ruling_planet, item.prediction_text, item.lucky_number, item.lucky_color, item.lucky_direction]);
    }
  }
}

// Auto-run schema check once
ensureZodiacTable().catch(err => console.warn('Zodiac table ensure error:', err.message));

// GET /api/zodiac - Public get all 12 zodiac signs
router.get('/', async (req, res) => {
  try {
    await ensureZodiacTable();
    const result = await query('SELECT * FROM zodiac_horoscopes ORDER BY id ASC');
    res.json({
      success: true,
      signs: result.rows.length > 0 ? result.rows : fallbackZodiac
    });
  } catch (error) {
    console.warn('DB zodiac fetch error, using fallback:', error.message);
    res.json({ success: true, signs: fallbackZodiac });
  }
});

// PUT /api/zodiac/:id - Update specific zodiac sign (Reporter or Admin)
router.put('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { prediction_text, lucky_number, lucky_color, lucky_direction, ruling_planet } = req.body;

    if (!prediction_text) {
      return res.status(400).json({ success: false, message: 'ராசி பலன் விவரம் (Prediction Text) தேவை' });
    }

    const result = await query(`
      UPDATE zodiac_horoscopes
      SET prediction_text = $1,
          lucky_number = COALESCE($2, lucky_number),
          lucky_color = COALESCE($3, lucky_color),
          lucky_direction = COALESCE($4, lucky_direction),
          ruling_planet = COALESCE($5, ruling_planet),
          horoscope_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `, [prediction_text.trim(), lucky_number, lucky_color, lucky_direction, ruling_planet, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ராசி அடையாளம் கிடைக்கவில்லை' });
    }

    res.json({
      success: true,
      message: `${result.rows[0].name_ta} ராசி பலன் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது`,
      sign: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/zodiac/bulk - Bulk update all signs (Admin)
router.post('/bulk', authenticate, requireAdmin, async (req, res) => {
  try {
    const { signs } = req.body;
    if (!Array.isArray(signs)) {
      return res.status(400).json({ success: false, message: 'Signs array required' });
    }

    for (const s of signs) {
      if (s.id && s.prediction_text) {
        await query(`
          UPDATE zodiac_horoscopes
          SET prediction_text = $1,
              lucky_number = COALESCE($2, lucky_number),
              lucky_color = COALESCE($3, lucky_color),
              lucky_direction = COALESCE($4, lucky_direction),
              horoscope_date = CURRENT_DATE,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $5;
        `, [s.prediction_text, s.lucky_number, s.lucky_color, s.lucky_direction, s.id]);
      }
    }

    res.json({ success: true, message: 'அனைத்து 12 ராசி பலன்களும் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

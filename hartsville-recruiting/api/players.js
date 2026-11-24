
const SHEET_ID = '1gg2IkDkR-1gu9OkPx9OV3ClYMqlzd464qVPcdVCw9pU';

function parseCSV(s) {
  let rows = [], row = [], cell = '', quoted = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (c === '"') {
      if (quoted && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (c === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && s[i + 1] === '\n') i++;

      row.push(cell);

      if (row.some(x => x.trim())) {
        rows.push(row);
      }

      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }

  row.push(cell);

  if (row.some(x => x.trim())) {
    rows.push(row);
  }

  return rows;
}

const key = s => String(s || '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

module.exports = async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    's-maxage=60, stale-while-revalidate=120'
  );

  const url = process.env.SHEET_CSV_URL ||
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${process.env.SHEET_GID || '299793801'}`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'HartsvilleRecruiting/1.0'
      },
      signal: AbortSignal.timeout(9000)
    });

    if (!r.ok) {
      throw new Error(
        `Google Sheets returned ${r.status}`
      );
    }

    const body = await r.text();

    if (
      body.trimStart().startsWith('<!DOCTYPE') ||
      body.includes('<html')
    ) {
      throw new Error(
        'Google Sheet is not publicly readable as CSV'
      );
    }

    const rows = parseCSV(body);

    const headIndex = rows.findIndex(row =>
      row.some(v => key(v) === 'playername')
    );

    if (headIndex < 0) {
      throw new Error(
        'Could not find Player Name header'
      );
    }

    const headers = rows[headIndex].map(key);

    const pick = (r, ...names) => {
      for (const n of names) {
        const idx = headers.indexOf(key(n));

        if (idx >= 0 && r[idx]) {
          return String(r[idx]).trim();
        }
      }

      return '';
    };

    const players = rows.slice(headIndex + 1)
      .map((r, i) => ({

        // PLAYER INFORMATION

        id: i + 1,

        number: pick(
          r,
          'Number',
          'Jersey Number'
        ),

        name: pick(
          r,
          'Player Name',
          'Name'
        ),

        year: pick(
          r,
          'graduation year',
          'Class',
          'Grad Year'
        ),

        position: pick(r, 'Position'),

        height: pick(r, 'Height'),

        weight: pick(r, 'Weight'),

        // ACADEMICS

        gpa: pick(r, 'GPA'),

        act: pick(
          r,
          'ACT',
          'ACT Score'
        ),

        // STRENGTH

        bench: pick(
          r,
          'Bench',
          'Bench Press'
        ),

        squat: pick(
          r,
          'Squat',
          'Back Squat'
        ),

        powerClean: pick(
          r,
          'Power Clean',
          'Powerclean',
          'Clean'
        ),

        // ATHLETIC TESTING

        forty: pick(
          r,
          '40 Time',
          '40 Yard Dash'
        ),

        shuttle: pick(
          r,
          'Pro Shuttle'
        ),

        vertical: pick(
          r,
          'Vertical'
        ),

        broad: pick(
          r,
          'Broad Jump'
        ),

        // RECRUITING INFORMATION

        accolades: pick(
          r,
          'accolades'
        ),

        hudl: pick(
          r,
          'Hudl',
          'Hudl Link'
        ),

        // PLAYER PHOTOGRAPHS

        // Headshot for individual player profile
        photo: pick(
          r,
          'Link to Headshot',
          'Picture Links'
        ),

        // Action shot for main recruiting roster
        actionPhoto: pick(
          r,
          'Link to Action Shot'
        )

      }))
      .filter(p => p.name);

    // Player phone numbers and transcripts
    // are intentionally excluded from public data.

    res.status(200).json({
      players,
      updatedAt: new Date().toISOString()
    });

  } catch (e) {
    res.status(503).json({
      players: [],
      error: 'Spreadsheet connection is not ready.',
      detail: e.message
    });
  }
};

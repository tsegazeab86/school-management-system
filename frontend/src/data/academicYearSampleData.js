/**
 * academicYearSampleData.js
 * ---------------------------------------------------------------------------
 * DEMONSTRATION DATA ONLY for the Academic Years Management module.
 *
 * - Ethiopian (E.C.) and Gregorian (G.C.) years are BOTH stored explicitly.
 *   No conversion formula is applied or pretended to be a full calendar
 *   conversion. The sample pairs are illustrative and internally consistent.
 * - Dates are generated from a school-year anchor so the sample always has a
 *   meaningful current / upcoming / draft year, even when opened in a later
 *   calendar year.
 * - This file has no React and no storage access. academicYearService decides
 *   whether it is ever written (only when no usable records exist).
 */

const pad2 = (value) => String(value).padStart(2, '0');

/**
 * Ethiopian school years usually begin in September. For a date in Sep-Dec the
 * Gregorian academic-year anchor is the calendar year itself; Jan-Aug belongs
 * to the school year that started the previous September.
 */
export function getSampleAnchorYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 9 ? year : year - 1;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const [y, m, d] = String(value).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function idFragment(value) {
  return String(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function termStatus(startDate, endDate, today) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return 'upcoming';
  if (today < startDate) return 'upcoming';
  if (today > endDate) return 'completed';
  return 'active';
}

function buildTerms(yearId, startYear, endYear, today) {
  const definitions = [
    {
      label: 'Term 1',
      startDate: `${startYear}-09-11`,
      endDate: `${startYear}-12-12`,
      description: 'First semester: orientation, continuous assessment and mid-term reporting.',
    },
    {
      label: 'Term 2',
      startDate: `${endYear}-01-05`,
      endDate: `${endYear}-03-20`,
      description: 'Second semester: teaching, practical work and monthly assessments.',
    },
    {
      label: 'Term 3',
      startDate: `${endYear}-03-23`,
      endDate: `${endYear}-06-30`,
      description: 'Final semester: revision, final examinations and result preparation.',
    },
  ];

  return definitions.map((term, index) => ({
    id: `${yearId}-T${index + 1}`,
    name: term.label,
    startDate: term.startDate,
    endDate: term.endDate,
    description: term.description,
    status: termStatus(term.startDate, term.endDate, today),
  }));
}

function yearDescription(offset) {
  if (offset <= -2) {
    return 'Completed academic year retained for historical reporting and transcripts.';
  }
  if (offset === -1) {
    return 'Academic year closed; results and student records remain available.';
  }
  if (offset === 0) {
    return 'Active academic year for the current school session.';
  }
  if (offset === 1) {
    return 'Planned academic year; calendars and term structures are being prepared.';
  }
  return 'Draft configuration pending review, final dates and approval.';
}

/**
 * Build a deterministic list of thirteen academic years: ten completed /
 * archived years, the current year, one upcoming year and one draft year.
 *
 * @param {Date} [date] anchor date used to decide the current school year.
 * @returns {Array<object>} academic-year records ready for localStorage.
 */
export function buildAcademicYearSampleData(date = new Date()) {
  const anchor = getSampleAnchorYear(date);
  const today = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;

  const records = [];

  for (let offset = -10; offset <= 2; offset += 1) {
    const startYear = anchor + offset;
    const endYear = startYear + 1;
    const id = `AY-${startYear}-${endYear}`;
    const ecYear = startYear - 7;

    let status = 'inactive';
    let isDraft = false;
    let archivedAt = null;

    if (offset <= -2) {
      status = 'archived';
      archivedAt = `${endYear}-07-15T08:00:00.000Z`;
    } else if (offset === 1) {
      status = 'inactive';
    } else if (offset === 2) {
      status = 'inactive';
      isDraft = true;
    } else if (offset === 0) {
      status = 'active';
    }

    records.push({
      id,
      name: `${startYear}/${endYear}`,
      status,
      isDraft,
      ecYear: `${ecYear} E.C.`,
      gcYear: `${startYear}/${endYear} G.C.`,
      calendarSystem: 'BOTH',
      description: yearDescription(offset),
      startDate: `${startYear}-09-11`,
      endDate: `${endYear}-06-30`,
      registrationStartDate: `${startYear}-09-01`,
      registrationEndDate: `${startYear}-09-20`,
      terms: buildTerms(id, startYear, endYear, today),
      createdAt: `${startYear - 1}-08-20T08:00:00.000Z`,
      updatedAt: `${startYear}-09-01T08:00:00.000Z`,
      archivedAt,
      activity: [],
    });
  }

  return records;
}

/** Convenience export for callers that do not need a custom anchor date. */
export const SAMPLE_ACADEMIC_YEARS = buildAcademicYearSampleData();

export { idFragment as toSampleIdFragment };

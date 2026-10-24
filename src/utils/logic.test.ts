import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTestScore, getPerformanceBadge } from './scoring';
import { filterPYQs, getPYQYearBreakdown } from './pyqFilter';
import { generateSpacedRepetitionDates, calculateDaysRemaining, calculateStreak } from './schedule';
import { PYQQuestion } from '../types';

const mockQuestions: PYQQuestion[] = [
  {
    id: 'q1',
    examId: 'jee_main',
    year: 2024,
    paperName: 'Shift 1 - Jan 27',
    shift: 'Morning',
    subject: 'Physics',
    chapter: 'Kinematics',
    topic: 'Projectile Motion',
    questionEn: 'A projectile is launched with speed v at angle theta...',
    questionHi: 'एक प्रक्षेप्य को चाल v तथा कोण थीटा पर प्रक्षेपित किया जाता है...',
    optionsEn: ['v^2/g', 'v^2 sin 2theta / g', '2v / g', 'v cos theta'],
    optionsHi: ['v^2/g', 'v^2 sin 2theta / g', '2v / g', 'v cos theta'],
    correctOptionIndex: 1,
    explanationEn: 'Range R = (u^2 sin 2theta)/g',
    explanationHi: 'परास R = (u^2 sin 2theta)/g',
    verificationStatus: 'verified_official',
    originalSource: 'NTA JEE Main 2024 Shift 1 Q.2',
    rightsStatus: 'public_domain_gov',
  },
  {
    id: 'q2',
    examId: 'jee_main',
    year: 2023,
    paperName: 'Shift 2 - April 11',
    shift: 'Evening',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    topic: 'Hybridization',
    questionEn: 'Which of the following molecules has sp3d hybridization?',
    questionHi: 'निम्नलिखित में से किस अणु में sp3d संकरण है?',
    optionsEn: ['SF6', 'PCl5', 'CH4', 'BF3'],
    optionsHi: ['SF6', 'PCl5', 'CH4', 'BF3'],
    correctOptionIndex: 1,
    explanationEn: 'PCl5 has 5 bond pairs and 0 lone pairs, giving sp3d.',
    explanationHi: 'PCl5 में 5 बंध युग्म हैं, अत: sp3d संकरण है।',
    verificationStatus: 'verified_official',
    originalSource: 'NTA JEE Main 2023 Shift 2 Q.18',
    rightsStatus: 'public_domain_gov',
  },
  {
    id: 'q3',
    examId: 'upsc_prelims',
    year: 2026,
    paperName: 'GS Paper 1 Model',
    subject: 'Indian Polity',
    chapter: 'Preamble and Fundamental Rights',
    questionEn: 'Consider the following statements regarding Article 21...',
    questionHi: 'अनुच्छेद 21 के संबंध में निम्नलिखित कथनों पर विचार कीजिए...',
    optionsEn: ['1 only', '2 only', 'Both 1 and 2', 'Neither 1 nor 2'],
    optionsHi: ['केवल 1', 'केवल 2', '1 और 2 दोनों', 'न तो 1 और न ही 2'],
    correctOptionIndex: 2,
    explanationEn: 'Article 21 protects life and personal liberty.',
    explanationHi: 'अनुच्छेद 21 जीवन एवं व्यक्तिगत स्वतंत्रता का संरक्षण करता है।',
    verificationStatus: 'model_sample',
    originalSource: 'Official 2026 Model Test Series Specimen',
    rightsStatus: 'fair_use_educational',
  },
];

test('calculateTestScore calculates correct score with positive and negative marking', () => {
  // q1 correct (4), q2 incorrect (-1), q3 skipped (0)
  const result = calculateTestScore({
    questions: mockQuestions,
    answers: {
      q1: 1, // correct
      q2: 0, // incorrect
      // q3 skipped
    },
    marksPerCorrect: 4,
    negativeMarkingPerWrong: 1,
  });

  assert.equal(result.totalQuestions, 3);
  assert.equal(result.correct, 1);
  assert.equal(result.incorrect, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.score, 3); // 4 - 1 = 3
  assert.equal(result.maxScore, 12);
  assert.equal(result.accuracyPercentage, 50); // 1 / 2 attempted = 50%
});

test('calculateTestScore returns 0 accuracy when no questions are attempted', () => {
  const result = calculateTestScore({
    questions: mockQuestions,
    answers: {},
  });

  assert.equal(result.attempted, 0);
  assert.equal(result.accuracyPercentage, 0);
  assert.equal(result.score, 0);
});

test('getPerformanceBadge assigns correct tiered labels', () => {
  assert.equal(getPerformanceBadge(90).color, 'emerald');
  assert.equal(getPerformanceBadge(75).color, 'blue');
  assert.equal(getPerformanceBadge(55).color, 'amber');
  assert.equal(getPerformanceBadge(40).color, 'rose');
});

test('filterPYQs filters accurately by exam and historical vs 2026 year', () => {
  // Test historical filter (2021-2025)
  const historical = filterPYQs(mockQuestions, { year: 'historical' });
  assert.equal(historical.length, 2);
  assert.ok(historical.every(q => q.year >= 2021 && q.year <= 2025));

  // Test 2026 filter
  const year2026 = filterPYQs(mockQuestions, { year: '2026' });
  assert.equal(year2026.length, 1);
  assert.equal(year2026[0].id, 'q3');

  // Test exam filter
  const upsc = filterPYQs(mockQuestions, { examId: 'upsc_prelims' });
  assert.equal(upsc.length, 1);
  assert.equal(upsc[0].examId, 'upsc_prelims');

  // Test search query filter (case-insensitive in Hindi or English)
  const searchPhysics = filterPYQs(mockQuestions, { searchQuery: 'projectile' });
  assert.equal(searchPhysics.length, 1);
  assert.equal(searchPhysics[0].id, 'q1');

  const searchHindi = filterPYQs(mockQuestions, { searchQuery: 'अनुच्छेद' });
  assert.equal(searchHindi.length, 1);
  assert.equal(searchHindi[0].id, 'q3');
});

test('getPYQYearBreakdown correctly summarizes years and verification counts', () => {
  const breakdown = getPYQYearBreakdown(mockQuestions);
  assert.equal(breakdown.historicalCount, 2);
  assert.equal(breakdown.year2026Count, 1);
  assert.equal(breakdown.verifiedCount, 2);
  assert.equal(breakdown.byYear[2024], 1);
  assert.equal(breakdown.byYear[2023], 1);
  assert.equal(breakdown.byYear[2026], 1);
});

test('generateSpacedRepetitionDates generates spaced intervals', () => {
  const dates = generateSpacedRepetitionDates('ch1', 'Motion in 1D', 'Physics', '2026-10-01');
  assert.equal(dates.length, 5); // 1, 3, 7, 21, 45 days
  assert.equal(dates[0].scheduledDate, '2026-10-02');
  assert.equal(dates[1].scheduledDate, '2026-10-04');
  assert.equal(dates[2].scheduledDate, '2026-10-08');
});

test('calculateDaysRemaining computes correct calendar days difference', () => {
  const days = calculateDaysRemaining('2026-11-01', '2026-10-24');
  assert.equal(days, 8);
});

test('calculateStreak increments consecutive days and resets if missed', () => {
  assert.equal(calculateStreak(5, '2026-10-23', '2026-10-24'), 6);
  assert.equal(calculateStreak(5, '2026-10-24', '2026-10-24'), 5);
  assert.equal(calculateStreak(5, '2026-10-20', '2026-10-24'), 1);
});

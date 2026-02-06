import { supabase } from './supabaseClient';
import { PatientRecord, ScreeningResult } from '../types';

/**
 * Save patient report to database
 */
export const savePatientReport = async (
  userId: string,
  record: PatientRecord,
  result: ScreeningResult
) => {
  try {
    const { data, error } = await supabase
      .from('patient_reports')
      .insert([
        {
          user_id: userId,
          name: record.name,
          age: record.age,
          gender: record.gender,
          hemoglobin: record.hemoglobin,
          mcv: record.mcv,
          mch: record.mch,
          mchc: record.mchc,
          classification: result.classification,
          confidence_score: result.confidenceScore,
          risk_level: result.riskLevel,
          analysis_summary: result.analysisSummary,
          test_date: record.date || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error saving patient report:', error.message);
    throw error;
  }
};

/**
 * Get all patient reports for a user
 */
export const getUserReports = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('patient_reports')
      .select('*')
      .eq('user_id', userId)
      .order('test_date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching reports:', error.message);
    throw error;
  }
};

/**
 * Generate recovery path with AI insights
 */
export const generateRecoveryPath = async (
  userId: string,
  record: PatientRecord,
  result: ScreeningResult
) => {
  try {
    // Get previous reports to analyze trends
    const previousReports = await getUserReports(userId);
    
    let currentStatus: 'Improving' | 'Stable' | 'Declining' | 'Critical' = 'Stable';
    let hemoglobinTrend: 'Increasing' | 'Stable' | 'Decreasing' | null = null;
    let improvementPercentage: number | null = null;

    if (previousReports && previousReports.length > 1) {
      const prevReport = previousReports[1]; // Second most recent (first is current)
      const hemoglobinDiff = record.hemoglobin - prevReport.hemoglobin;
      
      if (hemoglobinDiff > 0.5) {
        hemoglobinTrend = 'Increasing';
        currentStatus = 'Improving';
        improvementPercentage = ((hemoglobinDiff / prevReport.hemoglobin) * 100);
      } else if (hemoglobinDiff < -0.5) {
        hemoglobinTrend = 'Decreasing';
        currentStatus = 'Declining';
        improvementPercentage = ((hemoglobinDiff / prevReport.hemoglobin) * 100);
      } else {
        hemoglobinTrend = 'Stable';
        currentStatus = 'Stable';
        improvementPercentage = 0;
      }

      if (result.riskLevel === 'Critical') {
        currentStatus = 'Critical';
      }
    }

    // Generate recommendations based on classification
    const recommendations = generateRecommendations(result.classification, record);
    const dietarySuggestions = generateDietarySuggestions(result.classification);
    const lifestyleChanges = generateLifestyleChanges(result.classification, record);

    // Find the most recent report ID
    const { data: latestReport } = await supabase
      .from('patient_reports')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestReport) {
      throw new Error('Could not find latest report');
    }

    const { data, error } = await supabase
      .from('recovery_paths')
      .insert([
        {
          user_id: userId,
          report_id: latestReport.id,
          current_status: currentStatus,
          recommendations,
          dietary_suggestions: dietarySuggestions,
          lifestyle_changes: lifestyleChanges,
          hemoglobin_trend: hemoglobinTrend,
          overall_improvement_percentage: improvementPercentage,
          ai_insights: result.analysisSummary,
          follow_up_date: getFollowUpDate(result.riskLevel),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error generating recovery path:', error.message);
    throw error;
  }
};

/**
 * Generate personalized recommendations
 */
const generateRecommendations = (classification: string, record: PatientRecord): string[] => {
  const recommendations: string[] = [];

  if (classification.includes('Iron Deficiency')) {
    recommendations.push('Take iron supplements (325mg ferrous sulfate daily)');
    recommendations.push('Schedule follow-up blood test in 4-6 weeks');
    recommendations.push('Consult with a hematologist if symptoms persist');
    recommendations.push('Monitor for side effects: constipation, dark stools');
  } else if (classification.includes('Vitamin B12')) {
    recommendations.push('Start Vitamin B12 supplementation (1000mcg daily)');
    recommendations.push('Consider folate supplementation (400-800mcg daily)');
    recommendations.push('Schedule follow-up in 8-12 weeks');
    recommendations.push('Evaluate for absorption issues if vegetarian/vegan');
  } else if (classification.includes('Chronic Disease')) {
    recommendations.push('Address underlying chronic condition');
    recommendations.push('Regular monitoring every 2-3 months');
    recommendations.push('Maintain adequate protein intake');
  }

  if (record.hemoglobin < 10) {
    recommendations.push('URGENT: Consult healthcare provider immediately');
    recommendations.push('Avoid strenuous physical activity');
  }

  return recommendations;
};

/**
 * Generate dietary suggestions
 */
const generateDietarySuggestions = (classification: string): string[] => {
  if (classification.includes('Iron Deficiency')) {
    return [
      'Red meat (beef, lamb) 2-3 times per week',
      'Leafy greens (spinach, kale) with vitamin C',
      'Legumes (lentils, beans, chickpeas)',
      'Fortified cereals and bread',
      'Avoid tea/coffee with meals (inhibits iron absorption)',
      'Pair iron-rich foods with vitamin C sources',
    ];
  } else if (classification.includes('Vitamin B12')) {
    return [
      'Fish (salmon, tuna, sardines)',
      'Eggs and dairy products',
      'Fortified nutritional yeast',
      'Meat and poultry',
      'B12-fortified plant milk if vegetarian',
    ];
  }

  return [
    'Balanced diet with variety of nutrients',
    'Adequate protein intake',
    'Fresh fruits and vegetables',
    'Whole grains',
  ];
};

/**
 * Generate lifestyle changes
 */
const generateLifestyleChanges = (classification: string, record: PatientRecord): string[] => {
  const changes: string[] = [
    'Adequate sleep (7-9 hours per night)',
    'Stress management techniques',
    'Regular light exercise as tolerated',
  ];

  if (record.hemoglobin < 11) {
    changes.push('Avoid high-altitude activities temporarily');
    changes.push('Take breaks during physical activities');
  }

  if (classification.includes('Iron Deficiency')) {
    changes.push('Cook in cast iron cookware to boost iron intake');
  }

  return changes;
};

/**
 * Calculate follow-up date based on risk level
 */
const getFollowUpDate = (riskLevel: string): string => {
  const today = new Date();
  let daysToAdd = 30;

  switch (riskLevel) {
    case 'Critical':
      daysToAdd = 7;
      break;
    case 'High':
      daysToAdd = 14;
      break;
    case 'Moderate':
      daysToAdd = 30;
      break;
    case 'Low':
      daysToAdd = 90;
      break;
  }

  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split('T')[0];
};

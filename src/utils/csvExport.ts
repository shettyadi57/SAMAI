import { HighRiskCorridor, HazardReport, InterventionRecord } from '../types';

export function exportCorridorsToCSV(corridors: HighRiskCorridor[], filename = 'suraksh_priority_queue.csv') {
  const headers = [
    'Rank',
    'Corridor Name',
    'District',
    'Road Type',
    'Risk Score',
    'Risk Category',
    'Total Crashes',
    'Fatal Crashes',
    'Severe Injuries',
    'Verified Citizen Hazards',
    'Incident Trend',
    'Recommended Action',
    'Review Status',
    'Latitude',
    'Longitude'
  ];

  const rows = corridors.map(c => [
    c.rank,
    `"${c.name}"`,
    `"${c.district}"`,
    `"${c.roadType}"`,
    c.riskScore,
    c.riskCategory.toUpperCase(),
    c.incidentCounts.total,
    c.incidentCounts.fatal,
    c.incidentCounts.severe,
    c.verifiedHazardsCount,
    c.recentTrend,
    `"${c.recommendedAction}"`,
    c.reviewStatus,
    c.latitude,
    c.longitude
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportReportsToCSV(reports: HazardReport[], filename = 'suraksh_hazard_reports.csv') {
  const headers = [
    'Report ID',
    'Category',
    'Urgency',
    'Status',
    'Resolved Address',
    'Latitude',
    'Longitude',
    'Submitted At',
    'Submitted By',
    'Description',
    'Official Notes'
  ];

  const rows = reports.map(r => [
    r.id,
    `"${r.categoryLabel}"`,
    r.urgency.toUpperCase(),
    r.status.toUpperCase(),
    `"${r.resolvedAddress}"`,
    r.latitude,
    r.longitude,
    r.createdAt,
    r.submittedBy.isAnonymous ? 'Anonymous Citizen' : `"${r.submittedBy.userName}"`,
    `"${(r.description || '').replace(/"/g, '""')}"`,
    `"${(r.verification?.officialNotes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

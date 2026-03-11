/**
 * PDF Export Utility
 * Generates professional PDF reports for compliance, capex, and scenarios
 */

interface ComplianceReportData {
  propertyName: string;
  address: string;
  epcRating: string;
  riskScore: number;
  complianceStatus: string;
  violations: Array<{
    type: string;
    severity: string;
    remediation: string;
  }>;
  generatedDate: string;
}

interface CapexReportData {
  propertyName: string;
  totalCost: number;
  items: Array<{
    item: string;
    cost: number;
    priority: string;
    timeline: string;
    roi: string;
  }>;
  generatedDate: string;
}

interface ScenarioReportData {
  scenarioName: string;
  description: string;
  affectedProperties: number;
  totalImpact: number;
  recommendations: string[];
  generatedDate: string;
}

/**
 * Generate a compliance report PDF
 * Uses browser's print API to generate PDF
 */
export function generateComplianceReportPDF(data: ComplianceReportData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #1e3a8a; font-size: 28px; }
        .header p { margin: 5px 0; color: #666; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1e3a8a; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .metric { padding: 15px; background: #f9fafb; border-left: 4px solid #3b82f6; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1e3a8a; margin-top: 5px; }
        .violation { padding: 15px; margin: 10px 0; background: #fef2f2; border-left: 4px solid #dc2626; }
        .violation-type { font-weight: bold; color: #991b1b; }
        .violation-severity { display: inline-block; padding: 2px 8px; background: #fee2e2; color: #991b1b; border-radius: 3px; font-size: 12px; margin-left: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
        .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 12px; margin-right: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Compliance Report</h1>
        <p><strong>${data.propertyName}</strong></p>
        <p>${data.address}</p>
        <p style="font-size: 12px; color: #999;">Generated: ${data.generatedDate}</p>
      </div>

      <div class="section">
        <h2>Property Summary</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">EPC Rating</div>
            <div class="metric-value">${data.epcRating}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Risk Score</div>
            <div class="metric-value">${data.riskScore}/100</div>
          </div>
          <div class="metric">
            <div class="metric-label">Compliance Status</div>
            <div class="metric-value" style="font-size: 18px;">${data.complianceStatus}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Active Violations (${data.violations.length})</h2>
        ${data.violations.map(v => `
          <div class="violation">
            <div class="violation-type">${v.type}<span class="violation-severity">${v.severity}</span></div>
            <div style="margin-top: 8px; font-size: 14px;"><strong>Remediation:</strong> ${v.remediation}</div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p><strong>Veridia Portfolio Intelligence Platform</strong></p>
        <p>This report is confidential and intended for authorized personnel only.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Generate a capex budget PDF
 */
export function generateCapexReportPDF(data: CapexReportData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #065f46; font-size: 28px; }
        .header p { margin: 5px 0; color: #666; }
        .total-cost { padding: 20px; background: #ecfdf5; border-left: 4px solid #10b981; margin: 20px 0; }
        .total-cost-label { font-size: 14px; color: #047857; text-transform: uppercase; }
        .total-cost-value { font-size: 32px; font-weight: bold; color: #065f46; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #f59e0b; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Capex Budget Report</h1>
        <p><strong>${data.propertyName}</strong></p>
        <p style="font-size: 12px; color: #999;">Generated: ${data.generatedDate}</p>
      </div>

      <div class="total-cost">
        <div class="total-cost-label">Total Capital Expenditure</div>
        <div class="total-cost-value">£${(data.totalCost / 1000000).toFixed(2)}M</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Cost</th>
            <th>Priority</th>
            <th>Timeline</th>
            <th>ROI</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.item}</td>
              <td>£${(item.cost / 1000).toFixed(0)}K</td>
              <td><span class="priority-${item.priority}">${item.priority}</span></td>
              <td>${item.timeline}</td>
              <td>${item.roi}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p><strong>Veridia Capital Planning Platform</strong></p>
        <p>This budget forecast is based on current market conditions and regulatory requirements.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Generate a scenario analysis PDF
 */
export function generateScenarioReportPDF(data: ScenarioReportData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 3px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #5b21b6; font-size: 28px; }
        .header p { margin: 5px 0; color: #666; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #5b21b6; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .metric { padding: 15px; background: #f9fafb; border-left: 4px solid #8b5cf6; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #5b21b6; margin-top: 5px; }
        .recommendation { padding: 12px; margin: 10px 0; background: #f3e8ff; border-left: 4px solid #8b5cf6; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Scenario Analysis Report</h1>
        <p><strong>${data.scenarioName}</strong></p>
        <p style="font-size: 12px; color: #999;">Generated: ${data.generatedDate}</p>
      </div>

      <div class="section">
        <h2>Scenario Description</h2>
        <p>${data.description}</p>
      </div>

      <div class="section">
        <h2>Impact Summary</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Affected Properties</div>
            <div class="metric-value">${data.affectedProperties}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Financial Impact</div>
            <div class="metric-value">£${(data.totalImpact / 1000000).toFixed(2)}M</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Recommendations</h2>
        ${data.recommendations.map(rec => `
          <div class="recommendation">
            <strong>•</strong> ${rec}
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p><strong>Veridia Scenario Planning Platform</strong></p>
        <p>This analysis is based on regulatory forecasts and market assumptions.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Export data as CSV for spreadsheet analysis
 */
export function exportAsCSV(filename: string, data: Array<Record<string, any>>) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

import { CarInquiry } from "@shared/schema";

export interface EmailTemplateData {
  inquiry: CarInquiry;
  valuationResult: any;
  planType: 'regular' | 'premium' | 'business';
  customerEmail?: string;
  language?: 'en' | 'bg';
}

// Email translations
const emailTranslations = {
  en: {
    subject: 'Your {brand} {model} Valuation Report - CarValueAI {plan} Analysis',
    greeting: 'Dear Valued Customer,',
    intro: 'Thank you for choosing CarValueAI for your vehicle valuation needs. We are pleased to provide you with your comprehensive {plan} plan analysis.',
    vehicleDetails: 'Vehicle Details',
    brand: 'Brand',
    model: 'Model',
    year: 'Year',
    mileage: 'Mileage',
    fuelType: 'Fuel Type',
    transmission: 'Transmission',
    vin: 'VIN',
    valuationSummary: 'Valuation Summary',
    estimatedValue: 'Estimated Market Value',
    confidence: 'Confidence Level',
    marketTrend: 'Market Trend',
    footerMessage: 'Thank you for choosing CarValueAI. We appreciate your business and hope our analysis helps you make informed decisions about your vehicle.',
    signature: 'Your sincerely,<br>The CarValueAI Team',
    website: 'Visit our website',
    contact: 'Contact us for any questions',
    regularFeatures: {
      title: 'Regular Plan Features',
      basicValuation: '✓ Basic market valuation',
      marketComparison: '✓ Market comparison analysis',
      summary: '✓ Detailed summary report'
    },
    premiumFeatures: {
      title: 'Premium Plan Features',
      allRegular: '✓ All Regular plan features',
      historicalData: '✓ 3-month historical market trends',
      projections: '✓ 3-month future projections',
      pricingStrategy: '✓ Smart pricing strategy recommendations',
      seasonalAnalysis: '✓ Seasonal market analysis'
    },
    businessFeatures: {
      title: 'Business Plan Features',
      allPremium: '✓ All Premium plan features',
      investmentRisk: '✓ Personal Investment Risk Assessment',
      dealerAnalysis: '✓ Professional dealer-level analysis',
      regionalPricing: '✓ Regional market pricing',
      competitorAnalysis: '✓ Detailed competitor analysis'
    }
  },
  bg: {
    subject: 'Вашият доклад за оценка на {brand} {model} - CarValueAI {plan} анализ',
    greeting: 'Уважаеми клиенте,',
    intro: 'Благодарим Ви, че избрахте CarValueAI за Вашите нужди от оценка на превозно средство. Радваме се да Ви предоставим обширния анализ по {plan} план.',
    vehicleDetails: 'Детайли за превозното средство',
    brand: 'Марка',
    model: 'Модел',
    year: 'Година',
    mileage: 'Пробег',
    fuelType: 'Вид гориво',
    transmission: 'Скоростна кутия',
    vin: 'VIN номер',
    valuationSummary: 'Резюме на оценката',
    estimatedValue: 'Прогнозна пазарна стойност',
    confidence: 'Ниво на увереност',
    marketTrend: 'Пазарна тенденция',
    footerMessage: 'Благодарим Ви, че избрахте CarValueAI. Оценяваме Вашия бизнес и се надяваме нашият анализ да Ви помогне да вземете обосновани решения относно Вашето превозно средство.',
    signature: 'С уважение,<br>Екипът на CarValueAI',
    website: 'Посетете нашия уебсайт',
    contact: 'Свържете се с нас за въпроси',
    regularFeatures: {
      title: 'Характеристики на обикновения план',
      basicValuation: '✓ Основна пазарна оценка',
      marketComparison: '✓ Сравнителен пазарен анализ',
      summary: '✓ Подробен обобщен доклад'
    },
    premiumFeatures: {
      title: 'Характеристики на премиум плана',
      allRegular: '✓ Всички характеристики от обикновения план',
      historicalData: '✓ 3-месечни исторически пазарни тенденции',
      projections: '✓ 3-месечни бъдещи прогнози',
      pricingStrategy: '✓ Препоръки за интелигентна ценова стратегия',
      seasonalAnalysis: '✓ Сезонен пазарен анализ'
    },
    businessFeatures: {
      title: 'Характеристики на бизнес плана',
      allPremium: '✓ Всички характеристики от премиум плана',
      investmentRisk: '✓ Лична оценка на инвестиционния риск',
      dealerAnalysis: '✓ Професионален анализ на ниво дилър',
      regionalPricing: '✓ Регионално пазарно ценообразуване',
      competitorAnalysis: '✓ Подробен анализ на конкуренцията'
    }
  }
};

export function generateEmailTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const { inquiry, valuationResult, planType, language = 'en' } = data;
  const t = emailTranslations[language];
  const planName = planType.charAt(0).toUpperCase() + planType.slice(1);
  
  const subject = t.subject
    .replace('{brand}', inquiry.brand)
    .replace('{model}', inquiry.model)
    .replace('{plan}', planName);
  
  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CarValueAI ${t.valuationSummary}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f8fafc;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
        }
        .logo { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 10px;
            letter-spacing: -1px;
        }
        .tagline { 
            font-size: 16px; 
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .plan-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content { 
            padding: 40px 30px; 
        }
        .vehicle-info {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        .vehicle-title {
            font-size: 24px;
            font-weight: bold;
            color: #1a202c;
            margin-bottom: 15px;
        }
        .vehicle-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-label {
            font-weight: 600;
            color: #4a5568;
        }
        .detail-value {
            color: #1a202c;
            font-weight: 500;
        }
        .valuation-section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1a202c;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        .price-box {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }
        .price-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        .price-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .confidence-level {
            font-size: 14px;
            opacity: 0.9;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .feature-card {
            background: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #e2e8f0;
        }
        .feature-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .feature-content {
            color: #4a5568;
            font-size: 14px;
        }
        .risk-assessment {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .risk-title {
            color: #c53030;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer-message {
            font-size: 16px;
            margin-bottom: 20px;
            line-height: 1.8;
        }
        .signature {
            font-style: italic;
            font-size: 14px;
            opacity: 0.8;
        }
        .disclaimer {
            font-size: 12px;
            color: #718096;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        @media (max-width: 600px) {
            .container { margin: 0; }
            .header, .content, .footer { padding: 20px; }
            .price-value { font-size: 24px; }
            .vehicle-details { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚗 CarValueAI</div>
            <div class="tagline">Professional Car Valuation Services</div>
            <div class="plan-badge">${planName} ${language === 'bg' ? 'Анализ' : 'Analysis'}</div>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; margin-bottom: 25px; color: #4a5568;">${t.greeting}</p>
            <p style="font-size: 16px; margin-bottom: 30px; color: #4a5568;">${t.intro.replace('{plan}', planName)}</p>
            
            <div class="vehicle-info">
                <div class="vehicle-title">${inquiry.year} ${inquiry.brand} ${inquiry.model}</div>
                <div class="section-title" style="font-size: 18px; margin-bottom: 15px;">${t.vehicleDetails}</div>
                <div class="vehicle-details">
                    <div class="detail-item">
                        <span class="detail-label">${t.year}:</span>
                        <span class="detail-value">${inquiry.year}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">${t.mileage}:</span>
                        <span class="detail-value">${inquiry.mileage?.toLocaleString()} km</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">${t.fuelType}:</span>
                        <span class="detail-value">${inquiry.fuelType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">${t.transmission}:</span>
                        <span class="detail-value">${inquiry.transmission}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">${t.vin}:</span>
                        <span class="detail-value">${inquiry.vin}</span>
                    </div>
                </div>
            </div>
            
            <div class="valuation-section">
                <div class="section-title">${t.valuationSummary}</div>
                <div class="price-box">
                    <div class="price-label">${t.estimatedValue}</div>
                    <div class="price-value">€${valuationResult?.marketValue?.toLocaleString() || 'N/A'}</div>
                    <div class="confidence-level">${t.confidence}: ${valuationResult?.confidenceLevel || 90}%</div>
                </div>
            </div>
            
            ${planType === 'premium' || planType === 'business' ? `
            <div class="valuation-section">
                <div class="section-title">Market Trend Analysis</div>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-title">Historical Trend</div>
                        <div class="feature-content">${valuationResult?.marketTrendAnalysis?.historicalTrendPercentage > 0 ? '+' : ''}${valuationResult?.marketTrendAnalysis?.historicalTrendPercentage}% over 3 months</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-title">Market Momentum</div>
                        <div class="feature-content">${valuationResult?.marketTrendAnalysis?.marketMomentum}</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-title">Best Time to Sell</div>
                        <div class="feature-content">${valuationResult?.marketTrendAnalysis?.bestTimeToSell}</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-title">Market Demand</div>
                        <div class="feature-content">${valuationResult?.marketInsights?.demand}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${planType === 'business' ? `
            <div class="valuation-section">
                <div class="section-title">Investment Risk Assessment</div>
                <div class="risk-assessment">
                    <div class="risk-title">Overall Risk Level: ${valuationResult?.investmentRiskAssessment?.overall}</div>
                    <div class="feature-content">
                        <strong>Recommendation:</strong> ${valuationResult?.investmentRiskAssessment?.recommendation}<br>
                        <strong>Optimal Holding Period:</strong> ${valuationResult?.investmentRiskAssessment?.holdingPeriod}<br>
                        <strong>Exit Strategy:</strong> ${valuationResult?.investmentRiskAssessment?.exitStrategy}
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <div class="footer-message">
                ${t.footerMessage}
            </div>
            <div class="signature">
                ${t.signature}
            </div>
            <div class="disclaimer">
                ${language === 'bg' ? 
                  'Тази оценка се базира на текущите пазарни условия и данни, налични по време на анализа. Пазарните стойности могат да колебаят поради различни фактори. CarValueAI предоставя оценки за информационни цели и не може да гарантира точни продажни цени. Валидна е 30 дни от датата на издаване.' :
                  'This valuation is based on current market conditions and data available at the time of analysis. Market values may fluctuate due to various factors. CarValueAI provides estimates for informational purposes and cannot guarantee exact selling prices. Valid for 30 days from issue date.'
                }
            </div>
        </div>
    </div>
</body>
</html>`;

  const text = `
CarValueAI ${planName} Valuation Report

Vehicle: ${inquiry.year} ${inquiry.brand} ${inquiry.model}
VIN: ${inquiry.vin}
Mileage: ${inquiry.mileage?.toLocaleString()} km
Fuel Type: ${inquiry.fuelType}
Transmission: ${inquiry.transmission}

Estimated Market Value: €${valuationResult?.marketValue?.toLocaleString() || 'N/A'}
Confidence Level: ${valuationResult?.confidenceLevel || 90}%

${planType === 'premium' || planType === 'business' ? `
Market Trend Analysis:
- Historical Trend: ${valuationResult?.marketTrendAnalysis?.historicalTrendPercentage > 0 ? '+' : ''}${valuationResult?.marketTrendAnalysis?.historicalTrendPercentage}% over 3 months
- Market Momentum: ${valuationResult?.marketTrendAnalysis?.marketMomentum}
- Best Time to Sell: ${valuationResult?.marketTrendAnalysis?.bestTimeToSell}
- Market Demand: ${valuationResult?.marketInsights?.demand}
` : ''}

${planType === 'business' ? `
Investment Risk Assessment:
- Overall Risk Level: ${valuationResult?.investmentRiskAssessment?.overall}
- Recommendation: ${valuationResult?.investmentRiskAssessment?.recommendation}
- Optimal Holding Period: ${valuationResult?.investmentRiskAssessment?.holdingPeriod}
- Exit Strategy: ${valuationResult?.investmentRiskAssessment?.exitStrategy}
` : ''}

Thank you for choosing CarValueAI for your vehicle valuation needs. We're committed to providing you with the most accurate and comprehensive market analysis available in Bulgaria. Your trust in our expertise drives us to continuously improve our services and deliver exceptional value to every client.

Your sincerely,
The CarValueAI Team

---
This valuation is based on current market conditions and data available at the time of analysis. Market values may fluctuate due to various factors. CarValueAI provides estimates for informational purposes and cannot guarantee exact selling prices. Valid for 30 days from issue date.
`;

  return { subject, html, text };
}

export function generateRegularPlanTemplate(data: EmailTemplateData) {
  return generateEmailTemplate({ ...data, planType: 'regular' });
}

export function generatePremiumPlanTemplate(data: EmailTemplateData) {
  return generateEmailTemplate({ ...data, planType: 'premium' });
}

export function generateBusinessPlanTemplate(data: EmailTemplateData) {
  return generateEmailTemplate({ ...data, planType: 'business' });
}
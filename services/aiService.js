const { Report } = require('../models');
const { Op } = require('sequelize');

/**
 * AI Service - handles report classification and chatbot responses.
 * Uses Anthropic Claude API if ANTHROPIC_API_KEY is set, otherwise falls back to mock responses.
 */

const CATEGORIES = ['pothole', 'lighting', 'water_leak', 'garbage', 'other'];

// Configurable Gemini model (gemini-1.5-* was retired)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const CATEGORY_KEYWORDS = {
  pothole: ['pothole', 'hole', 'road', 'crack', 'bump', 'pavement', 'street damage', 'حفرة', 'طريق', 'شارع', 'كسر'],
  lighting: ['light', 'lamp', 'dark', 'streetlight', 'bulb', 'electricity', 'إنارة', 'لمبة', 'ضلمة', 'نور', 'كهرباء'],
  water_leak: ['water', 'leak', 'pipe', 'flood', 'sewage', 'drain', 'مياه', 'تسريب', 'ماسورة', 'صرف', 'فيضان'],
  garbage: ['garbage', 'trash', 'waste', 'rubbish', 'dump', 'litter', 'recycle', 'زبالة', 'قمامة', 'نفايات', 'وسخ']
};

/**
 * Classify a report description into a category (mock implementation)
 */
function mockClassifyReport(description) {
  const lowerDesc = description.toLowerCase();
  
  let bestCategory = 'other';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lowerDesc.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Generate a title from the first meaningful words
  const words = description.split(/\s+/).slice(0, 6).join(' ');
  const title = words.length > 50 ? words.substring(0, 50) + '...' : words;

  return {
    category: bestCategory,
    title: title,
    confidence: bestScore > 0 ? 'high' : 'low'
  };
}

/**
 * Generate a chat response (mock implementation)
 */
function mockChatResponse(message, userContext) {
  const lowerMsg = message.toLowerCase();
  
  // Common Q&A patterns
  if (lowerMsg.includes('how') && (lowerMsg.includes('report') || lowerMsg.includes('بلاغ') || lowerMsg.includes('إبلاغ'))) {
    return 'To create a report: 1) Click "Create Report" 2) Describe the issue 3) Upload a photo 4) Confirm the location on the map 5) Submit! Your report will be reviewed by our team.\n\nلإنشاء بلاغ: 1) اضغط "إنشاء بلاغ" 2) اوصف المشكلة 3) ارفع صورة 4) أكد الموقع على الخريطة 5) ابعت! البلاغ هيتراجع من فريقنا.';
  }
  
  if (lowerMsg.includes('status') || lowerMsg.includes('حالة') || lowerMsg.includes('track') || lowerMsg.includes('تتبع')) {
    if (userContext?.reportsCount > 0) {
      return `You have ${userContext.reportsCount} report(s). You can check their status on your Profile page. Each report shows a timeline of all status changes.\n\nعندك ${userContext.reportsCount} بلاغ/بلاغات. تقدر تتابع حالتهم من صفحة حسابك. كل بلاغ فيه timeline بكل التغييرات.`;
    }
    return 'You can track your report status from your Profile page. Each report has a timeline showing every status change with notes from the admin.\n\nتقدر تتابع حالة بلاغك من صفحة حسابك. كل بلاغ فيه timeline بكل تغيير في الحالة مع ملاحظات الأدمن.';
  }

  if (lowerMsg.includes('upvote') || lowerMsg.includes('تصويت') || lowerMsg.includes('vote')) {
    return 'You can upvote any report to show it matters! Reports with more upvotes get higher priority. Just click the upvote button on any report.\n\nتقدر تعمل upvote لأي بلاغ عشان تبين إنه مهم! البلاغات اللي عليها upvotes أكتر بتاخد أولوية أعلى.';
  }

  // Default response
  return 'مرحباً! 👋 أنا المساعد الذكي الخاص بمنصة البلاغات المدنية.\n\nأستطيع مساعدتك في:\n🔹 الإبلاغ عن مشكلة في المرافق العامة\n🔹 متابعة حالة بلاغاتك السابقة\n🔹 الإجابة على أي استفسارات تخص المنصة\n\nكيف يمكنني مساعدتك اليوم؟ 😊';
}

/**
 * Classify a report description
 */
async function classifyReport(description) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig: { responseMimeType: "application/json" } });
      
      const prompt = `Classify the following infrastructure report into one of these categories: pothole, lighting, water_leak, garbage, other.
Return JSON only: {"category": "...", "title": "short descriptive title", "confidence": "high|medium|low"}
Report: "${description}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('AI classification error, falling back to mock:', error.message);
      return mockClassifyReport(description);
    }
  }
  
  return mockClassifyReport(description);
}

/**
 * Chat with the AI assistant
 */
async function chatWithUser(message, userContext) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      let systemInstruction = `You are the smart assistant of a civic reporting platform. You can answer ANY question the user asks - general knowledge, advice, casual chat, or anything else. For platform topics (reporting issues, tracking reports, upvotes), use your knowledge of this platform: citizens create reports about infrastructure issues (potholes, lighting, water leaks, garbage), track their status on their profile, and upvote reports to raise priority. Always respond in the same language and style the user writes in (Arabic dialects or English). Be concise, friendly and helpful.`;
      
      if (userContext) {
        systemInstruction += `\n\nUser context: ${JSON.stringify(userContext)}`;
      }
      
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: systemInstruction
      });
      
      const result = await model.generateContent(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI chat error, falling back to mock:', error.message);
      return mockChatResponse(message, userContext);
    }
  }
  
  return mockChatResponse(message, userContext);
}

/**
 * Find potentially duplicate reports nearby
 */
async function findDuplicates(description, latitude, longitude, category, radiusKm = 0.5) {
  try {
    // Simple bounding box search (without PostGIS)
    const latDelta = radiusKm / 111; // ~111km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
    
    const nearbyReports = await Report.findAll({
      where: {
        category,
        status: { [Op.notIn]: ['resolved', 'rejected'] },
        latitude: { [Op.between]: [latitude - latDelta, latitude + latDelta] },
        longitude: { [Op.between]: [longitude - lngDelta, longitude + lngDelta] }
      },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    return nearbyReports;
  } catch (error) {
    console.error('Duplicate detection error:', error.message);
    return [];
  }
}

module.exports = { classifyReport, chatWithUser, findDuplicates };

import axios from 'axios';

// Using free RSS to JSON API with public NYT/BBC feeds mapped to categories
const CATEGORY_FEEDS = {
  startup: 'https://news.ycombinator.com/rss',
  finance: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
  tech: 'https://techcrunch.com/feed/',
  politics: 'http://feeds.bbci.co.uk/news/politics/rss.xml',
  gaming: 'https://kotaku.com/rss',
  business: 'http://feeds.bbci.co.uk/news/business/rss.xml',
  health: 'http://feeds.bbci.co.uk/news/health/rss.xml',
  entertainment: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
  innovation: 'https://cdn.arstechnica.net/arstechnica.xml',
  world: 'http://feeds.bbci.co.uk/news/world/rss.xml',
};

export const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const generateSingleInsight = async (article) => {
  try {
    const prompt = `You are a news context generator. 
The user is looking at this article:
Title: ${article.title}
Category: ${article.category || 'News'}
Description: ${article.description || 'N/A'}

Generate a short 1-2 sentence compelling insight explaining why they should care about this news.
Assign a relevant persona from: 'student', 'investor', 'founder'.
Return ONLY a valid JSON object with exactly two string keys: "persona" and "insight". DO NOT include any markdown formatting or code blocks, only the JSON object itself!`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const validJsonText = jsonMatch ? jsonMatch[0] : responseText;
    const parsed = JSON.parse(validJsonText);
    
    if (parsed.persona && parsed.insight) {
      return parsed;
    }
    throw new Error("Invalid response format");

  } catch (error) {
    console.error('Error generating single AI insight with OpenRouter:', error);
    const fallbackPersonas = {
      student: `A great case study for understanding ${article.category || 'news'} trends. Key takeaway: Watch how market dynamics shape outcomes here.`,
      investor: `Potential market signal. If this scales, expect ripple effects across the sector.`,
      founder: `Interesting pivot point. Competitors might adapt similar strategies to gain traction.`
    };
    const personas = ['student', 'investor', 'founder'];
    const randomPersona = personas[Math.floor(Math.random() * personas.length)];
    return {
      persona: randomPersona,
      insight: fallbackPersonas[randomPersona]
    };
  }
};

export const askArticleQuestion = async (article, chatHistory, newQuestion) => {
  try {
    const systemPrompt = `You are a helpful AI news assistant. The user is reading an article titled "${article.title}" about "${article.category}". 
The article description is: "${article.description || 'No description available'}".
Your goal is to answer their questions accurately and concisely based on this context. 
IMPORTANT: Use plain text only. Use paragraph breaks for readable spacing, but DO NOT use asterisks for bolding, hashtags for headings, or other markdown formatting. Keep it conversational and easy to read.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: newQuestion }
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/free',
        messages: messages
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error asking article question:', error);
    return "I'm sorry, I couldn't reach the AI servers right now. Please try again later.";
  }
};

export const fetchNewsForInterests = async (interests) => {
  try {
    const promises = interests.map(async (interest) => {
      try {
        const feedUrl = CATEGORY_FEEDS[interest] || CATEGORY_FEEDS.world;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        
        const response = await axios.get(apiUrl);
        if (response.data.status === 'ok') {
          const items = response.data.items.slice(0, 10); // Take top 10 per category
          
          const articlesWithContext = items.map((item, index) => ({
            ...item,
            id: item.guid || item.link,
            category: interest,
            aiInsight: null,
            timestamp: new Date(item.pubDate).getTime()
          }));
          
          return articlesWithContext;
        }
        return [];
      } catch (err) {
        console.error(`Failed to fetch ${interest}:`, err.message);
        return [];
      }
    });

    const results = await Promise.all(promises);
    // Flatten and sort by newest
    const allArticles = results.flat().filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
    return allArticles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

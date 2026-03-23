import axios from 'axios';

// Using free RSS to JSON API with public NYT/BBC feeds mapped to categories
const CATEGORY_FEEDS = {
  startup: [
    'https://news.ycombinator.com/rss',
    'https://www.entrepreneur.com/latest.rss',
    'https://www.inc.com/rss'
  ],
  finance: [
    'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
    'https://search.cnbc.com/rs/search/combinedcms/view.xml?id=10000664',
    'https://seekingalpha.com/market_currents.xml'
  ],
  tech: [
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://www.wired.com/feed/rss'
  ],
  politics: [
    'http://feeds.bbci.co.uk/news/politics/rss.xml',
    'https://rss.politico.com/politics-news.xml',
    'https://thehill.com/homenews/politics/feed/'
  ],
  gaming: [
    'https://kotaku.com/rss',
    'https://www.polygon.com/rss/index.xml',
    'https://www.ign.com/rss/articles/feed'
  ],
  business: [
    'http://feeds.bbci.co.uk/news/business/rss.xml',
    'https://feeds.bloomberg.com/markets/news.rss',
    'http://feeds.reuters.com/reuters/businessNews'
  ],
  health: [
    'http://feeds.bbci.co.uk/news/health/rss.xml',
    'https://www.medicalnewstoday.com/feed',
    'https://www.healthline.com/rss'
  ],
  entertainment: [
    'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    'https://variety.com/feed/',
    'https://www.hollywoodreporter.com/feed/'
  ],
  innovation: [
    'https://cdn.arstechnica.net/arstechnica.xml',
    'https://www.technologyreview.com/feed/',
    'https://singularityhub.com/feed/'
  ],
  world: [
    'http://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'http://rss.cnn.com/rss/edition_world.rss'
  ],
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

export const generateAudioBriefing = async (articles) => {
  try {
    const prompt = `You are an energetic morning news anchor for a personalized radio station called Nexa Radio. 
Write a cohesive, engaging 1-minute radio script summarizing these ${articles.length} news stories. 
Transition smoothly between them. Do not include markdown, emojis, or stage directions. Return ONLY the spoken words.

Articles:
${articles.map((a, i) => `${i + 1}. Title: ${a.title}\nDescription: ${a.description}`).join('\n\n')}`;

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
    
    return response.data.choices[0].message.content.replace(/[\*\#\[\]]/g, ''); // strip markdown
  } catch (error) {
    console.error('Error generating audio briefing:', error);
    return "Welcome to Nexa. We experienced a slight delay retrieving your personalized script today, but please enjoy reading your curated feed below.";
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

export const fetchNewsForInterests = async (interests, customFeeds = [], page = 0) => {
  try {
    const builtInFeeds = interests.map(interest => {
      const feedArray = CATEGORY_FEEDS[interest] || CATEGORY_FEEDS.world;
      // Rotate through the array based on page number
      const url = feedArray[page % feedArray.length];
      return { url, category: interest };
    });
    
    // For custom feeds, fetch one different custom feed per page if they have multiple
    let userFeeds = [];
    if (customFeeds.length > 0) {
      const customUrl = customFeeds[page % customFeeds.length];
      userFeeds = [{ url: customUrl, category: 'Custom Feed' }];
    }
    
    const allSources = [...builtInFeeds, ...userFeeds];

    const promises = allSources.map(async (source) => {
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
        
        const response = await axios.get(apiUrl);
        if (response.data.status === 'ok') {
          const items = response.data.items.slice(0, 10); // Take top 10 per category
          
          const articlesWithContext = items.map((item, index) => ({
            ...item,
            id: item.guid || item.link,
            category: source.category,
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

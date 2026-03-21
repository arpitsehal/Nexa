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

export const OPENROUTER_API_KEY = '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';

// Batch AI Context Generator using OpenRouter Free Models
const generateBatchAiContexts = async (titles, category) => {
  try {
    const prompt = `You are a news context generator. The user is interested in ${category}. 
For each of the following ${titles.length} news titles, generate a short 1-2 sentence compelling insight explaining why they should care about this news.
Assign a relevant persona from: 'student', 'investor', 'founder'.
Return ONLY a valid JSON array of objects, each containing exactly two string keys: "persona" and "insight". The array must have exactly ${titles.length} items in the same order as the titles provided. DO NOT include any markdown formatting, only the array itself.

Titles:
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/free', // Using the automatic free tier models on OpenRouter
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
    
    // Safely parse out any markdown blocks if the AI includes them
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const validJsonText = jsonMatch ? jsonMatch[0] : responseText;
    const parsed = JSON.parse(validJsonText);
    
    // Ensure we return exactly the right number of items
    return titles.map((_, i) => {
      if (parsed[i] && parsed[i].persona && parsed[i].insight) {
        return parsed[i];
      }
      return {
        persona: 'student',
        insight: 'Interesting development in this sector. Worth monitoring for future trends.'
      };
    });

  } catch (error) {
    console.error('Error generating batch AI context with OpenRouter:', error);
    // Fallback to simpler generated text if API rate limits hit
    const fallbackPersonas = {
      student: `A great case study for understanding ${category} trends. Key takeaway: Watch how market dynamics shape outcomes here.`,
      investor: `Potential market signal. If this scales, expect ripple effects across the ${category} sector.`,
      founder: `Interesting pivot point. Competitors might adapt similar strategies to gain traction.`
    };
    
    const personas = ['student', 'investor', 'founder'];
    return titles.map(() => {
      const randomPersona = personas[Math.floor(Math.random() * personas.length)];
      return {
        persona: randomPersona,
        insight: fallbackPersonas[randomPersona]
      };
    });
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
          
          // Batch generate AI contexts for all items in this category (1 API call instead of 10)
          const titles = items.map(item => item.title);
          const aiContexts = await generateBatchAiContexts(titles, interest);
          
          const articlesWithContext = items.map((item, index) => ({
            ...item,
            id: item.guid || item.link,
            category: interest,
            aiInsight: aiContexts[index],
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

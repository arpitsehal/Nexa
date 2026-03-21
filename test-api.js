import axios from 'axios';

const CATEGORY_FEEDS = {
  startup: 'https://news.ycombinator.com/rss',
  finance: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664',
  tech: 'https://www.wired.com/feed/category/gear/latest/rss',
  politics: 'http://feeds.bbci.co.uk/news/politics/rss.xml',
  gaming: 'https://kotaku.com/rss',
  business: 'http://feeds.bbci.co.uk/news/business/rss.xml',
  health: 'http://feeds.bbci.co.uk/news/health/rss.xml',
  entertainment: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
  innovation: 'https://www.technologyreview.com/feed/',
  world: 'http://feeds.bbci.co.uk/news/world/rss.xml',
};

async function testAll() {
  for (const [key, url] of Object.entries(CATEGORY_FEEDS)) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    try {
      const response = await axios.get(apiUrl);
      console.log(`[${key}] ${response.data.status} - ${response.data.items ? response.data.items.length : 0} items`);
    } catch (e) {
      console.log(`[${key}] Error:`, e.response?.data?.message || e.message);
    }
  }
}

testAll();

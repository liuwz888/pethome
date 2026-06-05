const API_BASE = '/api';

export interface ChatResponse {
  response: string;
  type: string;
}

export interface ProductRecommendation {
  productIds: string[];
  reasons: string[];
}

export interface CommunityInsights {
  topics: string[];
  sentimentTrend: string;
  popularProducts: string[];
}

export const chatWithAI = async (message: string, context?: string): Promise<ChatResponse> => {
  try {
    if (context) {
      const response = await fetch(`${API_BASE}/ai/chat/contextual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      });
      return await response.json();
    } else {
      const response = await fetch(`${API_BASE}/ai/chat/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      return await response.json();
    }
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('Failed to get AI response');
  }
};

export const getPersonalizedRecommendations = async (
  userPreferences?: string,
  recentActivity?: string
): Promise<ProductRecommendation> => {
  try {
    const url = `${API_BASE}/recommendations/personalized?${new URLSearchParams({
      ...(userPreferences && { userPreferences }),
      ...(recentActivity && { recentActivity })
    }).toString()}`;

    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Recommendations API error:', error);
    throw new Error('Failed to get recommendations');
  }
};

export const getCommunityInsights = async (posts: string[]): Promise<CommunityInsights> => {
  try {
    const response = await fetch(`${API_BASE}/community/analyze-trends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts })
    });
    const data = await response.json();
    return data.insights || data;
  } catch (error) {
    console.error('Community insights API error:', error);
    throw new Error('Failed to analyze community trends');
  }
};

export const analyzeContentSentiment = async (content: string) => {
  try {
    const response = await fetch(`${API_BASE}/community/sentiment-analysis?content=${encodeURIComponent(content)}`);
    return await response.json();
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw new Error('Failed to analyze content sentiment');
  }
};
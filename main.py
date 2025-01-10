from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from nltk.sentiment import SentimentIntensityAnalyzer
from langdetect import detect
import nltk
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Download the VADER lexicon for sentiment analysis
nltk.download("vader_lexicon")

# Initialize Sentiment Analyzer
sia = SentimentIntensityAnalyzer()

# Define the schema for input data
class Tweet(BaseModel):
    translated_content: str = None
    tweet_rawcontent: str = None


class InputData(BaseModel):
    tweets: List[Tweet]


@app.post("/analyze_sentiment")
async def analyze_sentiment(data: InputData):
    try:
        tweets = data.tweets
        scores_final = []
        running_avg = []
        cnt = 1
        sum_score = 0.0

        for tweet in tweets:
            text = tweet.translated_content or tweet.tweet_rawcontent or ""

            try:
                # Detect language; skip non-English tweets
                language = detect(text)
                if language != "en":
                    continue
                score = sia.polarity_scores(text)["compound"]
                scores_final.append(score)
            except Exception as e:
                # Skip this tweet if an error occurs
                continue

        # Calculate running average sentiment
        for sc in scores_final:
            sum_score += sc
            cur_avg = sum_score / cnt
            cnt += 1
            running_avg.append(cur_avg)

        # Count positive, neutral, and negative tweets
        neutral_cnt = len([sc for sc in scores_final if sc == 0])
        pos_cnt = len([sc for sc in scores_final if sc > 0])
        neg_cnt = len([sc for sc in scores_final if sc < 0])

        return {
            "positive_count": pos_cnt,
            "neutral_count": neutral_cnt,
            "negative_count": neg_cnt,
            "running_avg": running_avg,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

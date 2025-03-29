from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

labels = ["Negative", "Neutral", "Positive"]

class TextInput(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_sentiment(input: TextInput):
    # Tokenize input text
    inputs = tokenizer(input.text, return_tensors="pt", truncation=True, padding=True, max_length=512)

    # Run inference
    with torch.no_grad():
        outputs = model(**inputs)

    # Convert logits to probabilities
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0].tolist()

    # Create a dictionary with labels and their respective probabilities
    sentiment_scores = {labels[i]: round(probs[i], 4) for i in range(len(labels))}

    # Get sentiment with highest probability
    sentiment_index = torch.argmax(outputs.logits).item()
    sentiment = labels[sentiment_index]

    return {
        "text": input.text,
        "sentiment": sentiment,
        "scores": sentiment_scores
    }

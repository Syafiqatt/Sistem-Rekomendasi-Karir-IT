import os
import sys
from dotenv import load_dotenv

load_dotenv()

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ai_service import get_career_recommendation, recsys_model

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Payload(BaseModel):
    years_code: float = 0.0
    education_level: int = 0
    all_skills: str = "none"
    tools: str = "none"
    databases: str = "none"

@app.post("/predict")
def predict(payload: Payload):
    return get_career_recommendation(payload.dict())

@app.get("/vocabulary")
def get_vocabulary():
    vocab = {}
    for layer in recsys_model.layers:
        if hasattr(layer, 'get_vocabulary'):
            name = layer.name
            words = [w for w in layer.get_vocabulary() if w not in ['', '[UNK]']]
            vocab[name] = words
    return vocab

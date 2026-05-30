# =====================================================================
# FILE: ai_service.py (VERSI REVISI INTEGRASI SUBPROCESS)
# =====================================================================
import os
import sys
import json
import numpy as np

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from google import genai

# 1. CLASS BYPASS DESERIALIZATION (Wajib Tetap Ada)
class SafeEmbedding(tf.keras.layers.Embedding):
    def __init__(self, *args, **kwargs):
        kwargs.pop('quantization_config', None)
        super().__init__(*args, **kwargs)

MODEL_PATH = 'career_recsys_model_custom.keras'
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

try:
    recsys_model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={'Embedding': SafeEmbedding},
        compile=False
    )
    print(f"[OK] Model loaded from {MODEL_PATH}")
except Exception as e:
    raise RuntimeError(
        f"[ERROR] Gagal load model dari '{MODEL_PATH}'. "
        f"Pastikan file ada dan tidak corrupt.\nDetail: {e}"
    )

CAREER_LABELS = [
    'Backend Developer', 'Cloud Engineer', 'Cybersecurity Analyst',
    'Data Analyst', 'Data Engineer', 'Data Scientist',
    'Database Administrator (DBA)', 'DevOps Engineer', 'Frontend Developer',
    'Full Stack Developer', 'Game Developer', 'IT Support Specialist',
    'Machine Learning Engineer', 'Mobile App Developer',
    'Product Manager (Teknologi)', 'QA Engineer', 'System Administrator',
    'UX Designer'
]

def get_career_recommendation(payload):
    sanitized_payload = payload.copy()
    for field in ['all_skills', 'tools', 'databases']:
        if not sanitized_payload.get(field) or str(sanitized_payload[field]).strip() == "":
            sanitized_payload[field] = "none"

    years_code = float(sanitized_payload.get('years_code', 0.0))
    education_level = float(sanitized_payload.get('education_level', 0.0))

    input_data = {
        'years_code': np.array([[years_code]], dtype=np.float32),
        'education_level': np.array([[education_level]], dtype=np.float32),
        'all_skills': np.array([sanitized_payload['all_skills']], dtype=object),
        'tools': np.array([sanitized_payload['tools']], dtype=object),
        'databases': np.array([sanitized_payload['databases']], dtype=object),
    }

    predictions = recsys_model.predict(input_data, verbose=0)[0]
    top_3_indices = predictions.argsort()[-3:][::-1]
    
    recommendations_list = []
    for idx in top_3_indices:
        recommendations_list.append({
            "career": CAREER_LABELS[idx],
            "score": round(float(predictions[idx]) * 100, 1)
        })

    # Mengaktifkan Gemini API secara dinamis jika ada Key
    ai_roadmap_text = "Fitur Roadmap AI dinonaktifkan."
    if GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            prompt = f"Berikan 3 poin roadmap singkat untuk karir: {recommendations_list[0]['career']}. Skill saat ini: {sanitized_payload['all_skills']}"
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            ai_roadmap_text = response.text
        except Exception as gemini_err:
            ai_roadmap_text = f"Gagal menghasilkan roadmap: {str(gemini_err)}"

    return {
        "top_recommendations": recommendations_list,
        "ai_roadmap": ai_roadmap_text
    }

# =====================================================================
# DRIVER UNTUK MENERIMA PANGGILAN SUBPROCESS (EXECUTION GATEWAY)
# =====================================================================
if __name__ == "__main__":
    # Membaca argument string JSON dari terminal sys.argv[1]
    if len(sys.argv) > 1:
        try:
            input_payload = json.loads(sys.argv[1])
            output_result = get_career_recommendation(input_payload)
            # Cetak hasil mentah ke stdout agar bisa ditangkap oleh test.py
            print(json.dumps(output_result))
        except Exception as err:
            print(json.dumps({"error": f"Gagal di level runner: {str(err)}"}))
import subprocess
import json

payload = {
    "years_code": 4.5,
    "education_level": 2,
    "all_skills": "python java spring boot go sql bash/shell docker kubernetes aws terraform",
    "tools": "visual studio code intellij idea",
    "databases": "postgresql redis"
}

payload_str = json.dumps(payload)
result = subprocess.run(
    ['python', 'ai_service.py', payload_str],
    capture_output=True, text=True
)

data = json.loads(result.stdout)
print("Top Recommendations:")
for rec in data.get('top_recommendations', []):
    print(f"  {rec['career']}: {rec['score']}%")
print(f"Roadmap: {data.get('ai_roadmap', '-')}")
import os 
from google import generativeai as genai

Google_API = os.getenv('GEMINI_API_KEY')

#from google import genai
genai.configure(api_key=str(Google_API))
model=genai.GenerativeModel("gemini-1.5-flash")

response = model.generate_content("Explain how AI works in a few words")

#Print Response
print(response.text)
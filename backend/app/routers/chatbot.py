# main.py
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
from datetime import datetime
import json

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

# Pydantic models
class ChatMessage(BaseModel):
    id: int
    type: str
    content: str
    timestamp: datetime

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

def load_application_data():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    json_path = os.path.join(base_dir, "applications.json")
    with open(json_path, 'r') as f:
        data = json.load(f)
        return data

DASHBOARD_DATA = json.dumps(load_application_data(), indent=2)

def create_system_prompt():
    """Create the system prompt with dashboard context"""
    application_data = load_application_data()
    dashboard_json = json.dumps(application_data, indent=2)
    
    return f"""You are BPAi, a dashboard assistant for a risk assessment system. You help users understand their dashboard data, risk scoring, and application statuses.

DASHBOARD DATA:
{dashboard_json}

RISK SCORING MODEL:
- 0-30: Secure (Low Risk) - Green status
- 31-70: Risky (Medium Risk) - Yellow status  
- 71-100: Critical/Default (High Risk) - Red status

KEY CAPABILITIES:
1. Search applications by ID (e.g., APP-2024-001)
2. Find clients by name
3. Explain risk scoring methodology
4. Provide status overviews and statistics
5. Identify high-risk applications
6. Answer questions about specific cases

RESPONSE GUIDELINES:
- Be helpful and professional
- Use the dashboard data to provide accurate information
- Format responses clearly with emojis and structure
- If asked about applications not in the data, say they're not found
- Always base responses on the actual dashboard data provided
- Use markdown formatting for better readability

Keep responses concise but informative. Always be helpful in explaining the risk assessment model and dashboard features."""

async def get_gemini_response(user_message: str, conversation_history: List[ChatMessage] = None) -> str:
    """Get response from Gemini API"""
    try:
        # Create conversation context
        conversation_context = []
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                role = "user" if msg.type == "user" else "model"
                conversation_context.append({
                    "role": role,
                    "parts": [msg.content]
                })
        
        # Add current user message
        conversation_context.append({
            "role": "user", 
            "parts": [user_message]
        })
        
        # Create chat with system instruction
        chat = model.start_chat(history=conversation_context[:-1])
        
        # Send message with system context
        system_prompt = create_system_prompt()
        full_prompt = f"{system_prompt}\n\nUser Question: {user_message}"
        
        response = chat.send_message(full_prompt)
        return response.text
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "I'm sorry, I'm having trouble processing your request right now. Please try again."

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


@router.get("/")
async def root():
    return {"message": "BPAi Chatbot API is running"}

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint"""
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Get response from Gemini
        response_text = await get_gemini_response(
            request.message, 
            request.conversation_history
        )
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/dashboard/data")
async def get_dashboard_data():
    """Get dashboard data"""
    return {"data": DASHBOARD_DATA}

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_apps = len(DASHBOARD_DATA)
    avg_risk = sum(app["riskScore"] for app in DASHBOARD_DATA) / total_apps
    
    status_counts = {}
    for app in DASHBOARD_DATA:
        status = app["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "total_applications": total_apps,
        "average_risk_score": round(avg_risk, 1),
        "status_distribution": status_counts
    }

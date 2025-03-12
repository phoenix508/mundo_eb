import uuid
from util import invoke_agent

# Sample input
input_text = "What are some travel tips for visiting Paris?"
session_id = str(uuid.uuid4())  # Generate a unique session ID

try:
    invoke_agent(inputText=input_text, sessionId=session_id)
except Exception as e:
    print(f"An error occurred: {e}") 
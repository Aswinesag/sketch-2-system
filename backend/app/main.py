import os
import json
import re
import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sketch2system")

app = FastAPI(
    title="Sketch2System API",
    description="Multimodal AI Backend for Synthesizing System Architectures and Boilerplates",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the official Google GenAI client
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


def repair_and_parse_json(text: str) -> dict:
    """
    Attempts to parse text as JSON. If truncated or cut off mid-stream,
    repairs unclosed strings, strips trailing incomplete keys,
    and closes open braces and brackets to recover valid JSON.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    logger.warning("Detected malformed or truncated JSON response. Initiating structural repair...")

    in_string = False
    escape = False
    stack = []
    trimmed = text.strip()

    # Track open quotes and container brackets
    for char in trimmed:
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if not in_string:
            if char in "{[":
                stack.append(char)
            elif char in "}]":
                if stack:
                    if (char == "}" and stack[-1] == "{") or (char == "]" and stack[-1] == "["):
                        stack.pop()

    repaired = trimmed
    
    # 1. Close unclosed string if cut off mid-word
    if in_string:
        repaired += '"'

    # 2. Clean up trailing commas, colons, or incomplete key fragments
    repaired = re.sub(r',\s*$', '', repaired)
    repaired = re.sub(r':\s*$', ': null', repaired)
    repaired = re.sub(r',\s*([}\]])', r'\1', repaired)

    # 3. Close open containers in LIFO order
    while stack:
        opener = stack.pop()
        if opener == "{":
            repaired += "}"
        elif opener == "[":
            repaired += "]"

    try:
        return json.loads(repaired)
    except json.JSONDecodeError as err:
        logger.error(f"Failed to auto-repair JSON: {err} | Repaired preview: {repaired[:300]}")
        raise ValueError(f"Model generated invalid JSON format: {err}")


def clean_and_parse_json(raw_text: str) -> dict:
    """
    Cleans and parses the Gemini multimodal response.
    Handles raw JSON, markdown-wrapped JSON (```json ... ```), 
    truncated streaming fragments, and normalizes all expected schema fields.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Multimodal model returned an empty response.")

    text = raw_text.strip()

    # 1. Strip markdown fences if wrapped in ```json ... ``` or ``` ... ```
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()
    else:
        # Check if JSON is enclosed within markdown fences inside text
        fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
        if fence_match:
            text = fence_match.group(1).strip()

    # 2. Extract substring between outermost braces if extra commentary is present
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace >= first_brace:
        text = text[first_brace : last_brace + 1]

    # 3. Parse with automatic truncation repair
    data = repair_and_parse_json(text)

    if not isinstance(data, dict):
        raise ValueError(f"Expected a JSON object, but received {type(data).__name__}")

    # 4. Strict Schema Normalization & Fallbacks
    if "architectureSummary" not in data or not data["architectureSummary"]:
        data["architectureSummary"] = "System architecture diagram topology analyzed and synthesized."

    # Normalize "services" array
    if "services" not in data or not isinstance(data["services"], list):
        data["services"] = []
    else:
        normalized_services = []
        for svc in data["services"]:
            if isinstance(svc, dict):
                normalized_services.append({
                    "name": svc.get("name", "Unnamed Service"),
                    "role": svc.get("role", "Core microservice component")
                })
            elif isinstance(svc, str):
                normalized_services.append({
                    "name": svc,
                    "role": "Identified system component"
                })
        data["services"] = normalized_services

    # Normalize "databaseSchema"
    if "databaseSchema" not in data:
        data["databaseSchema"] = {"definitions": []}
    elif isinstance(data["databaseSchema"], list):
        data["databaseSchema"] = {"definitions": [str(d) for d in data["databaseSchema"]]}
    elif isinstance(data["databaseSchema"], str):
        data["databaseSchema"] = {"definitions": [data["databaseSchema"]]}
    elif isinstance(data["databaseSchema"], dict):
        if "definitions" not in data["databaseSchema"] or not isinstance(data["databaseSchema"]["definitions"], list):
            defs = data["databaseSchema"].get("definitions")
            if isinstance(defs, str):
                data["databaseSchema"]["definitions"] = [defs]
            else:
                data["databaseSchema"]["definitions"] = [json.dumps(data["databaseSchema"])]

    # Normalize "starterCode"
    if "starterCode" not in data:
        data["starterCode"] = {"files": {"main.py": "# Core application boilerplate\n"}}
    elif isinstance(data["starterCode"], str):
        data["starterCode"] = {"files": {"main.py": data["starterCode"]}}
    elif isinstance(data["starterCode"], dict):
        if "files" not in data["starterCode"] or not isinstance(data["starterCode"]["files"], dict):
            file_entries = {
                k: v for k, v in data["starterCode"].items() 
                if isinstance(v, str) and any(k.endswith(ext) for ext in [".py", ".sql", ".txt", ".json", ".ts", ".js"])
            }
            if file_entries:
                data["starterCode"] = {"files": file_entries}
            else:
                data["starterCode"] = {"files": {"main.py": json.dumps(data["starterCode"], indent=2)}}

    return data


@app.post("/api/generate")
async def generate_system(
    file: UploadFile = File(...),
    requirements: str = Form(...)
):
    if not client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured on the backend. Please add it to your environment or backend/.env file."
        )

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty. Please provide a valid image file."
            )
        
        prompt = f"""
You are an expert Principal Distributed Systems Architect and Senior Full-Stack Engineer.
Analyze this architecture diagram / whiteboard sketch alongside the engineering constraints:
"{requirements}"

TASK:
1. Deconstruct all architectural components, compute nodes, ingress layers, cache stores, databases, and message queues.
2. Formulate comprehensive, production-grade PostgreSQL DDL statements for all entities and relationships.
3. Write clean, complete, production-ready FastAPI starter code implementing the endpoints, Pydantic schemas, and database session bindings.

OUTPUT REQUIREMENTS:
- You MUST return a single, valid JSON object conforming strictly to the requested schema.
- Keep "architectureSummary" concise (2-3 focused paragraphs, under 200 words) so maximum token budget is reserved for complete DDL and full code implementation.
- DO NOT truncate code, and DO NOT use placeholder comments such as "// implement here" or "...". 

JSON SCHEMA REQUIREMENT:
{{
  "architectureSummary": "Concise architectural overview of topology, data flows, and caching strategy.",
  "services": [
    {{
      "name": "Descriptive Service Name",
      "role": "Single responsibility and communication protocols (e.g. REST/gRPC/Kafka)"
    }}
  ],
  "databaseSchema": {{
    "definitions": [
      "CREATE TABLE urls (\\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\\n    original_url TEXT NOT NULL,\\n    short_code VARCHAR(16) UNIQUE NOT NULL,\\n    created_at TIMESTAMPTZ DEFAULT NOW()\\n);",
      "CREATE TABLE clicks (\\n    id BIGSERIAL PRIMARY KEY,\\n    url_id UUID REFERENCES urls(id),\\n    clicked_at TIMESTAMPTZ DEFAULT NOW()\\n);"
    ]
  }},
  "starterCode": {{
    "files": {{
      "main.py": "from fastapi import FastAPI, Depends, HTTPException\\nfrom pydantic import BaseModel\\n...",
      "models.py": "from pydantic import BaseModel, Field\\nfrom typing import Optional\\n...",
      "requirements.txt": "fastapi>=0.115.0\\nuvicorn>=0.30.0\\npydantic>=2.0.0\\n"
    }}
  }}
}}
"""

        # Enforce application/json, allocate maximum 8192 tokens, and explicitly set
        # thinking_budget=0 to prevent Gemini 2.5 Flash from exhausting the token limit
        # on internal reasoning thoughts before generating the output JSON.
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            max_output_tokens=8192,
            temperature=0.2,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
            system_instruction=(
                "You are an expert Principal Systems Architect. Always output strictly valid JSON "
                "conforming to the requested schema. Provide concise architecture summaries, complete "
                "SQL statements, and production-ready boilerplate code files with zero omissions."
            ),
        )

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=file.content_type or "image/jpeg",
                ),
                prompt
            ],
            config=config,
        )

        # Inspect finish_reason for debugging
        if response.candidates:
            candidate = response.candidates[0]
            finish_reason = getattr(candidate, "finish_reason", None)
            logger.info(f"Gemini generation finish_reason: {finish_reason}")
            if finish_reason == "MAX_TOKENS":
                logger.warning("Gemini generation hit MAX_TOKENS limit! Salvaging partial response.")

        raw_response_text = response.text or ""
        
        # Robust fallback parsing, truncation repair & schema validation
        parsed_analysis = clean_and_parse_json(raw_response_text)

        return {"success": True, "analysis": parsed_analysis}

    except HTTPException:
        raise
    except ValueError as val_err:
        logger.error(f"Validation/Parsing error: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, 
            detail=f"Schema compliance error: {str(val_err)}"
        )
    except Exception as e:
        logger.error(f"Unhandled generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Generation failed: {str(e)}"
        )


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_configured": client is not None
    }

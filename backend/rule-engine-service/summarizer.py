# # summarizer.py
# import sys, json, subprocess, io

# # Ensure stdout can handle UTF-8 (fix for Windows cp1252 issue)
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# def run_ollama(model: str, prompt: str) -> str:
#     result = subprocess.run(
#         ["ollama", "run", model],
#         input=prompt.encode("utf-8"),
#         stdout=subprocess.PIPE,
#         stderr=subprocess.PIPE,
#     )
#     if result.returncode != 0:
#         raise Exception(result.stderr.decode("utf-8"))
#     return result.stdout.decode("utf-8").strip()

# def build_prompt(text: str) -> str:
#     return f"""
# You are a code review assistant. 
# Summarize the following PR strictly in the exact format shown below. 
# Follow all rules:

# Rules:
# - Each point must be 1 short sentence only (no long explanations).
# - Use the same keys and order as given.
# - Do not add extra text or commentary.
# - Keep response concise and structured exactly as shown.

# Format:

# File-wise Issues:
# - [FileName]: [very short issue description]

# Coding Standards:

# - Complexity: [Low/Medium/High, + 1 reason max]
# - Performance: [short remark only]
# - Maintainability: [short remark only]
# - Coupling & Interdependencies: [short remark only]
# - Design Patterns: [Yes/No + 1 word reason]
# - Refactoring Opportunities: [short remark only]
# - Edge Cases & Reliability: [short remark only]
# - Function Impact: [short remark only]

# PR DETAILS:
# {text}

# provide the summary strictly in the above format only.

# """

# def main():
#     # Read JSON input from Node.js
#     data = sys.stdin.read()
#     try:
#         payload = json.loads(data)
#         text = payload.get("text", "")
#     except Exception:
#         print("Invalid input received from Node.js")
#         sys.exit(1)

#     # Build strict prompt
#     prompt = build_prompt(text)

#     # Run Phi-3-mini via Ollama
#     raw_output = run_ollama("phi3", prompt)

#     # Print raw text safely in UTF-8
#     print(raw_output)

# if __name__ == "__main__":
#     main()


# summarizer.py
import sys, json, subprocess, io, os

# Ensure stdout can handle UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# You can set this to your quantized Phi-3 model
# Options: "phi3-4bit", "phi3-8bit", or local path to .gguf file
QUANTIZED_MODEL = "phi3-4bit"

def run_ollama(model: str, prompt: str) -> str:
    """
    Runs Ollama with the given model and prompt.
    Works with quantized models on CPU.
    """
    result = subprocess.run(
        ["ollama", "run", model],
        input=prompt.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise Exception(result.stderr.decode("utf-8"))
    return result.stdout.decode("utf-8").strip()

def build_prompt(text: str) -> str:
    """
    Builds the strict prompt for Phi-3 summarization.
    """
    return f"""
You are a code review assistant. 
Summarize the following PR strictly in the exact format shown below. 
Follow all rules:

Rules:
- Each point must be 1 short sentence only (no long explanations).
- Use the same keys and order as given.
- Do not add extra text or commentary.
- Keep response concise and structured exactly as shown.

Format:

File-wise Issues:
- [FileName]: [very short issue description]

Coding Standards:

- Complexity: [Low/Medium/High, + 1 reason max]
- Performance: [short remark only]
- Maintainability: [short remark only]
- Coupling & Interdependencies: [short remark only]
- Design Patterns: [Yes/No + 1 word reason]
- Refactoring Opportunities: [short remark only]
- Edge Cases & Reliability: [short remark only]
- Function Impact: [short remark only]

PR DETAILS:
{text}

provide the summary strictly in the above format only.
"""

def main():
    # Read JSON input from Node.js or stdin
    data = sys.stdin.read()
    try:
        payload = json.loads(data)
        text = payload.get("text", "")
    except Exception:
        print("Invalid input received from Node.js")
        sys.exit(1)

    # Build strict prompt
    prompt = build_prompt(text)

    # Run quantized Phi-3 via Ollama
    try:
        raw_output = run_ollama(QUANTIZED_MODEL, prompt)
    except Exception as e:
        print(f"Error running Phi-3 model: {e}")
        sys.exit(1)

    # Print raw text safely in UTF-8
    print(raw_output)

if __name__ == "__main__":
    main()

# PROMPTS.md

# TH-EHS2 Vision Prompts

## Primary Card Recognition Prompt

System Prompt

```text
You are a poker card recognition engine.

Your task is to identify all visible playing cards.

The image contains Texas Hold'em cards.

Return only valid JSON.

Rules:

1. Identify exactly two hole cards when visible.
2. Identify all community cards.
3. Use notation:
   As, Kh, Qd, Tc

4. Return confidence score.

5. Never explain.

Output:

{
  "holeCards": ["As","Ks"],
  "boardCards": ["8h","7h","7s"],
  "confidence": 0.98
}
```

---

# Unclear Card Prompt

Used when confidence < 0.85

```text
The image quality is insufficient.

Return:

{
  "error":"unclear_cards"
}
```

---

# Duplicate Validation Prompt

Not sent to the model.

Handled in application code.

Example:

```json
{
  "holeCards":["As","Ks"],
  "boardCards":["As","7h","7s"]
}
```

Should fail validation.

---

# Future Prompt Version 2

Potential enhancement:

```json
{
  "holeCards":["As","Ks"],
  "boardCards":["8h","7h","7s"],
  "confidence":0.98,
  "cardConfidence":{
    "As":0.99,
    "Ks":0.98,
    "8h":0.96,
    "7h":0.97,
    "7s":0.98
  }
}
```

---

# Prompt Versioning

Current:

```text
v1.0
```

Future:

```text
v2.0
```

Maintain backward compatibility where possible.

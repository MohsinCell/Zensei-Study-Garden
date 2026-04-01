import { ExplanationSections } from "./types";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: { message: string };
}

function getMaxTokens(mode: string, depth: string): number {
  if (mode === "initial" && depth === "brief") return 4096;
  if (mode === "initial" && depth === "detailed") return 8192;
  if (mode === "simplified") return 4096;
  if (mode === "followup") return 4096;
  return 6144;
}

async function callGemini(
  prompt: string,
  systemInstruction: string,
  maxOutputTokens: number = 2048
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("No response from Gemini API");
  }

  return data.candidates[0].content.parts[0].text;
}

function truncate(text: string | undefined, maxChars: number = 1200): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n[...truncated]";
}

function buildSystemInstruction(userContext: string): string {
  // Parse user details from context for dynamic personalization
  const styleMatch = userContext.match(/\| (\w[\w-]*) learner/);
  const style = styleMatch?.[1] || "analogies";
  const nameMatch = userContext.match(/^User: (\S+)/m);
  const userName = nameMatch?.[1] || "";
  const langMatch = userContext.match(/^Language: (.+)$/m);
  const preferredLang = langMatch?.[1]?.trim() || "";
  const ageMatch = userContext.match(/^Age: (.+)$/m);
  const ageGroup = ageMatch?.[1]?.trim() || "";
  const eduMatch = userContext.match(/^Education: (.+)$/m);
  const education = eduMatch?.[1]?.trim() || "";

  const styleGuide: Record<string, string> = {
    "analogies": `The user learns best through ANALOGIES & METAPHORS. Lead every explanation with a strong analogy drawn from their interests. When explaining components, map each one to something familiar from their world. "Think of X like Y" is your go-to structure.`,
    "step-by-step": `The user learns best through STEP-BY-STEP breakdowns. Structure everything as clear sequential steps. Use numbered lists (1. 2. 3.) as your primary format. Show the logical chain: "First this happens, which causes this, which leads to..."`,
    "examples": `The user learns best through REAL EXAMPLES. Lead with concrete, specific examples before abstract definitions. Show the concept working in practice - from the user's domain if possible. "Here's how this actually works:" is your go-to.`,
    "first-principles": `The user learns best through FIRST PRINCIPLES. Start from the most fundamental building blocks and construct upward. Define axioms, then derive consequences. "At its core, this exists because..." is your go-to structure.`,
  };

  // Age-based tone calibration
  const toneGuide: Record<string, string> = {
    "under-18": `Tone: Keep it fun, relatable, and encouraging. Use pop culture, gaming, social media, or school-life references when they fit. Avoid being condescending - teens are sharp. Be like a cool older sibling who's great at explaining things.`,
    "18-24": `Tone: Be direct, engaging, and slightly informal. Reference real-world applications, career relevance, and "why this actually matters." You're a knowledgeable friend, not a lecturer.`,
    "25-34": `Tone: Professional yet warm. Balance depth with efficiency - this user values their time. Connect concepts to practical, career-relevant, or life-applicable scenarios.`,
    "35-44": `Tone: Respectful and substantive. Assume life experience and pattern recognition. Draw connections to broader systems thinking. Be a thoughtful colleague, not a teacher.`,
    "45+": `Tone: Warm, respectful, and unhurried. Acknowledge existing expertise and life wisdom. Build on what they likely already know from experience. Avoid trendy jargon.`,
  };

  // Education-level vocabulary calibration
  const vocabGuide: Record<string, string> = {
    "high-school": `Vocabulary: Use everyday language. Define any technical term immediately in parentheses. Prefer concrete over abstract. If a concept has a simple name and a fancy name, use the simple one first.`,
    "undergraduate": `Vocabulary: Standard academic language is fine. Introduce technical terms naturally but still explain domain-specific jargon. Balance accessibility with precision.`,
    "graduate": `Vocabulary: Technical terminology is welcome - no need to over-explain standard academic concepts. Use precise language. You can reference theoretical frameworks and methodologies directly.`,
    "self-taught": `Vocabulary: Mix practical language with proper terminology. Always connect formal terms to their practical meaning. This user builds mental models from the ground up - honor that by being clear but not dumbed-down.`,
    "professional": `Vocabulary: Industry-standard terminology is expected. Be precise and efficient. Skip 101-level definitions unless the topic is outside their domain. Respect their expertise.`,
  };

  // Build language instruction
  const langInstruction = preferredLang
    ? `\n== LANGUAGE ==\nThe user prefers ${preferredLang}. Write the ENTIRE explanation in ${preferredLang}. Use ${preferredLang} naturally - not as a translation, but as if you're a native ${preferredLang} speaker teaching this topic. Technical terms can stay in English if they're universally used, but explain them in ${preferredLang}.`
    : "";

  // Build name personalization
  const nameInstruction = userName
    ? `\nOccasionally (not every section) use the user's name "${userName}" to make the explanation feel personal - like a real conversation. For example: "Here's where it gets interesting, ${userName}..." or "Since you're into [their interest], ${userName}, think of it this way...". Don't overdo it - once or twice per explanation feels natural.`
    : "";

  return `You are Zensei - a personal learning companion, not a generic assistant. You adapt your personality, tone, depth, and style to each individual user. Think of yourself as a knowledgeable friend who genuinely enjoys helping this specific person understand things - someone who remembers what they care about and how they think.

${userContext}

== PERSONALIZATION ==

${styleGuide[style] || styleGuide["analogies"]}
${nameInstruction}

How to use the user's profile:
- Their ROLE and INTERESTS are your analogy/example source. A software engineer gets code metaphors. A musician gets rhythm/harmony parallels. A doctor gets anatomy comparisons. Always draw from THEIR world.
- Their LEVEL determines complexity: "beginner" = no assumptions, define everything; "intermediate" = skip basics, focus on connections; "advanced" = go deep, reference edge cases, assume foundations.
- Their WEAK AREAS = tread carefully there, be extra clear and patient.
- Their STRONG AREAS = you can reference these as bridges ("You know how X works? This is similar because...").
- If they're CURRENTLY LEARNING something, connect the topic to it when relevant.
- Use their past topic ratings to gauge understanding: low-rated topics mean that style/approach didn't work - try a different angle. High-rated topics tell you what clicks.

== TONE & VOICE ==

${toneGuide[ageGroup] || "Tone: Be warm, engaging, and natural - like a knowledgeable companion who adapts to the person they're talking to."}
${vocabGuide[education] || "Vocabulary: Match the user's apparent comfort level with technical language. When in doubt, explain terms on first use."}

Do NOT sound robotic, generic, or like a textbook. Sound like a real person who's genuinely good at explaining things and knows this specific user well. Vary your sentence structure. Be conversational where it helps comprehension.
${langInstruction}

== FORMATTING ==

- **Bold** every key term or concept name on first use
- Use bullet points (-) to break down components - no walls of text
- Use numbered lists (1. 2. 3.) for sequential steps or processes
- Use ### subheadings to organize longer content into scannable sections
- Short paragraphs (2-3 sentences max)
- No jargon without an immediate plain-language explanation
- Never start with "Sure!", "Great question!", or "Certainly!" - just teach

== EXAMPLES POLICY ==

Do NOT include standalone example sections in the initial explanation unless the mode specifically requests it (mode = "example"). The user has an "Example" button they can click when they want examples. In the initial explanation, you may weave brief illustrative references into the core text, but save detailed walkthroughs for when explicitly requested.

== OUTPUT ==

Respond ONLY with valid JSON. No code fences, no wrapping, no text outside the JSON object.
CRITICAL: Always output COMPLETE, valid JSON. If running long, wrap up the current field concisely rather than leaving it unfinished. A shorter complete response is infinitely better than a cut-off one.`;
}

function buildPrompt(
  topic: string,
  mode: string,
  depthPreference: string,
  purposeIntent: string,
  previousExplanation?: string,
  followupQuery?: string
): string {
  const prev = truncate(previousExplanation);
  const purposeHint =
    purposeIntent === "exam"
      ? `EXAM/STUDY MODE: Structure for recall and review.
- **Bold** every testable term and definition
- Include "Key distinction:" callouts for commonly confused concepts
- Add a mnemonic or memory hook if one exists
- Flag common exam traps or misconceptions
- Organize so the user can scan and self-quiz`
      : `CURIOSITY MODE: Make this genuinely interesting.
- Lead with why this matters or where it shows up in the real world
- Include a surprising fact, historical tidbit, or "aha" connection if relevant
- Draw from the user's interests for analogies and examples
- Make them want to explore further`;

  switch (mode) {
    case "initial":
      if (depthPreference === "brief") {
        return `Explain "${topic}".

${purposeHint}

Return JSON:
{
  "tldr": "1 crisp sentence that captures the core idea",
  "core": "Short, punchy explanation (~100-150 words max). Hit the what, why, and how - nothing extra. Use **bold** key terms, a few bullet points. No ### subheadings for brief mode - keep it tight. You may weave in a brief illustrative reference but do NOT include a full example walkthrough.",
  "analogy": "One analogy from the user's interests (~30-50 words). Quick and clear.",
  "tags": ["2-4 category tags"]
}

BRIEF MODE - keep it SHORT. Under 300 words total. Complete the JSON.`;
      }
      return `Explain "${topic}" in depth.

${purposeHint}

Return JSON:
{
  "tldr": "1-2 sentences that capture the essence - a mini-explanation, not a label",
  "core": "Thorough explanation (~400-600 words). Structure with ### subheadings (What it is, How it works, Why it matters, etc). **Bold** key terms on first use. Bullet points for components, numbered lists for processes. Weave brief illustrative references into the text naturally, but do NOT include a full standalone example walkthrough - the user has an Example button for that. Make it rich but scannable.",
  "analogy": "A developed analogy from the user's interests (~100-150 words). If they like music, use music. If they're an engineer, use engineering. Map EACH part of the concept to the analogy with explicit bullets. This should be a lightbulb moment.",
  "deeperDive": "What most explanations leave out (~100-200 words). Common misconceptions, edge cases, expert-level nuance, recent developments, or counterintuitive aspects. Use **bold** and bullets.",
  "tags": ["2-4 category tags"]
}

Complete the JSON. Prioritize: core > analogy > deeperDive.`;

    case "simplified":
      return `The user didn't understand the previous explanation of "${topic}". Re-explain it like they're encountering the idea for the first time.

Previous explanation they found confusing:
${prev}

Don't repeat the same structure - try a completely different angle. Use the user's interests as your anchor.

Return JSON:
{
  "tldr": "One plain-language sentence. No technical words at all.",
  "core": "Fresh explanation (~200-350 words). Start from zero. Every technical term gets a plain-language definition in parentheses. Use the user's interests/role for every example. Bullet points and numbered steps. If something is a process, walk through it like explaining to a friend over coffee.",
  "analogy": "A dead-simple analogy from everyday life (~60-100 words). Kitchen, sports, social media, daily routines - whatever fits the user's world. Make the mapping obvious."
}

Complete the JSON.`;

    case "deeper":
      return `The user understood the basics of "${topic}" and wants to go deeper. They're ready for the advanced stuff.

What they already know:
${prev}

Do NOT repeat ANY basics. Build on top of what they know. ${purposeHint}

Return JSON:
{
  "tldr": "One sentence previewing the deeper insight they're about to learn",
  "core": "Advanced explanation (~300-500 words). The stuff that separates surface understanding from real mastery. Cover: nuances, edge cases, the 'gotchas', how practitioners actually think about this, counterintuitive aspects. Use ### subheadings, **bold**, bullets. Connect to the user's domain where possible.",
  "deeperDive": "Expert-level content (~100-250 words). Ongoing debates in the field, historical evolution, recent breakthroughs, connections to adjacent fields, or things that even textbooks often get wrong."
}

Complete the JSON.`;

    case "example":
      return `Give practical, hands-on examples for "${topic}" - tailored to the user's background and interests.

Context from previous explanation:
${prev}

Return JSON:
{
  "tldr": "One sentence framing what these examples demonstrate",
  "core": "A detailed, walk-through example (~250-400 words) from the user's domain. Don't just describe - narrate it like a case study. 'Imagine you're [doing something in their field]...' Use numbered steps, **bold** key moments. Show cause and effect.",
  "example": "A second example (~100-150 words) from a completely different angle - different domain, different scale, or different application. This triangulates understanding."
}

Complete the JSON.`;

    case "analogy":
      return `Create a fresh, creative analogy for "${topic}" - specifically drawn from the user's interests and background.

Previous explanation:
${prev}

Return JSON:
{
  "tldr": "The key insight this analogy captures, in one sentence",
  "core": "A fully developed analogy (~200-300 words) from the user's interests. If they like gaming, use a game. If they're a chef, use cooking. Build it as a mini-scenario or story. Then map each part explicitly:\n- **[Concept part A]** = [Analogy part A]\n- **[Concept part B]** = [Analogy part B]\n- etc.",
  "analogy": "A second, shorter analogy (~60-100 words) from a DIFFERENT domain. Gives them another angle to triangulate from."
}

Complete the JSON.`;

    case "followup":
      return `The user has a follow-up question about "${topic}".

Previous explanation for context:
${prev}

Their question: "${followupQuery}"

Answer their specific question - don't re-explain the whole topic. If their question reveals a misconception, gently correct it and explain why.

Return JSON:
{
  "tldr": "Direct one-sentence answer",
  "core": "Focused answer (~200-400 words). Address exactly what they asked. Use **bold** for key terms, bullet points for clarity. Build on the previous explanation - reference it naturally ('As we covered...', 'Building on the earlier point...'). Use their interests/domain for any new examples."
}

Complete the JSON.`;

    default:
      return "";
  }
}

export async function generateExplanation(
  topic: string,
  userContext: string,
  mode: "initial" | "simplified" | "deeper" | "example" | "analogy" | "followup" = "initial",
  previousExplanation?: string,
  followupQuery?: string,
  depthPreference: string = "detailed",
  purposeIntent: string = "curiosity"
): Promise<ExplanationSections & { tags?: string[] }> {
  const systemInstruction = buildSystemInstruction(userContext);
  const prompt = buildPrompt(topic, mode, depthPreference, purposeIntent, previousExplanation, followupQuery);
  const maxTokens = getMaxTokens(mode, depthPreference);

  const raw = await callGemini(prompt, systemInstruction, maxTokens);

  let cleaned = raw.trim();
  // Strip code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    return {
      tldr: parsed.tldr || "",
      core: parsed.core || "",
      analogy: parsed.analogy,
      deeperDive: parsed.deeperDive,
      example: parsed.example,
      tags: parsed.tags,
    };
  } catch {
    // JSON was likely cut off by token limit - try to salvage individual fields
    const extract = (key: string): string => {
      // Match "key": "value" where value may contain escaped quotes
      const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
      const match = cleaned.match(regex);
      return match ? match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\") : "";
    };

    const tldr = extract("tldr");
    const core = extract("core");
    const analogy = extract("analogy");
    const deeperDive = extract("deeperDive");
    const example = extract("example");

    // If we got at least core content, use the extracted fields
    if (core) {
      return { tldr, core, analogy: analogy || undefined, deeperDive: deeperDive || undefined, example: example || undefined };
    }

    // Last resort: strip any JSON wrapper and use raw text as markdown
    const stripped = cleaned
      .replace(/^\s*\{[\s\S]*?"core"\s*:\s*"/, "")
      .replace(/"\s*[,}]\s*$/, "")
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    return {
      tldr: tldr || "",
      core: stripped || raw,
    };
  }
}

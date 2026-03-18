import { ai } from "@workspace/integrations-gemini-ai";

export interface LessonSection {
  heading: string;
  content: string;
}

export interface Lesson {
  title: string;
  overview: string;
  sections: LessonSection[];
  keyFacts: string[];
  funFact: string;
  topic: string;
  level: string;
}

export interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  topic: string;
  level: string;
}

export async function generateLesson(topic: string, level: string): Promise<Lesson> {
  const prompt = `You are a brilliant history teacher. Generate a structured lesson about: '${topic}'
Target level: ${level}

Respond ONLY in this exact format with no extra text:
TITLE: [lesson title]
OVERVIEW: [2-3 sentence overview]
SECTION1_HEADING: [first section heading]
SECTION1_CONTENT: [3-4 sentences]
SECTION2_HEADING: [second section heading]
SECTION2_CONTENT: [3-4 sentences]
SECTION3_HEADING: [third section heading]
SECTION3_CONTENT: [3-4 sentences]
KEY_FACTS: [fact1|fact2|fact3|fact4|fact5]
FUN_FACT: [one surprising fun fact]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "";
    return parseLesson(text, topic, level);
  } catch (err) {
    console.error("Gemini lesson generation error:", err);
    return getFallbackLesson(topic, level);
  }
}

function parseLesson(text: string, topic: string, level: string): Lesson {
  const lines = text.split("\n");
  const data: Record<string, string> = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.substring(0, colonIdx).trim();
    const value = line.substring(colonIdx + 1).trim();
    if (key && value) {
      data[key] = value;
    }
  }

  const sections: LessonSection[] = [];
  for (let i = 1; i <= 3; i++) {
    const heading = data[`SECTION${i}_HEADING`] || `Section ${i}`;
    const content = data[`SECTION${i}_CONTENT`] || `Content for section ${i} about ${topic}.`;
    sections.push({ heading, content });
  }

  const keyFactsRaw = data["KEY_FACTS"] || "";
  const keyFacts = keyFactsRaw
    ? keyFactsRaw.split("|").map((f) => f.trim()).filter((f) => f.length > 0)
    : [`${topic} is a fascinating historical subject.`];

  return {
    title: data["TITLE"] || `The History of ${topic}`,
    overview: data["OVERVIEW"] || `An exploration of ${topic} at the ${level} level.`,
    sections,
    keyFacts: keyFacts.length > 0 ? keyFacts : [`${topic} shaped history in important ways.`],
    funFact: data["FUN_FACT"] || `${topic} has many surprising aspects that historians continue to study.`,
    topic,
    level,
  };
}

function getFallbackLesson(topic: string, level: string): Lesson {
  return {
    title: `The History of ${topic}`,
    overview: `An introduction to ${topic} designed for ${level} learners. This lesson covers the key events, people, and impacts of this important historical subject.`,
    sections: [
      {
        heading: "Origins and Background",
        content: `The story of ${topic} begins with the historical context that shaped its development. Understanding these origins helps us appreciate the significance of what followed.`,
      },
      {
        heading: "Key Events and Developments",
        content: `The most important events surrounding ${topic} unfolded over time and had far-reaching consequences. These developments changed the course of history in meaningful ways.`,
      },
      {
        heading: "Legacy and Impact",
        content: `The legacy of ${topic} continues to influence our world today. Historians study its impact across political, cultural, and social dimensions.`,
      },
    ],
    keyFacts: [
      `${topic} is an important historical subject`,
      "Historical context shaped its development",
      "Key figures played crucial roles",
      "The impact was felt across generations",
      "Modern historians continue to study it",
    ],
    funFact: `Many surprising details about ${topic} have only recently been discovered by historians using new research methods.`,
    topic,
    level,
  };
}

export async function generateQuiz(lessonContent: string, topic: string, level: string): Promise<Quiz> {
  const prompt = `Based on this history lesson content: '${lessonContent}'

Generate exactly 5 multiple choice questions. Respond ONLY in this format:
Q1: [question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANSWER: [correct letter A/B/C/D]

Q2: [question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANSWER: [correct letter A/B/C/D]

Q3: [question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANSWER: [correct letter A/B/C/D]

Q4: [question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANSWER: [correct letter A/B/C/D]

Q5: [question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANSWER: [correct letter A/B/C/D]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "";
    return parseQuiz(text, topic, level);
  } catch (err) {
    console.error("Gemini quiz generation error:", err);
    return getFallbackQuiz(topic, level);
  }
}

function parseQuiz(text: string, topic: string, level: string): Quiz {
  const questionBlocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  const questions: QuizQuestion[] = [];

  for (const block of questionBlocks) {
    if (questions.length >= 5) break;
    const lines = block.split("\n").map((l) => l.trim()).filter((l) => l);

    let question = "";
    let optA = "";
    let optB = "";
    let optC = "";
    let optD = "";
    let answer = "A";

    for (const line of lines) {
      if (line.match(/^Q\d+:/)) {
        question = line.replace(/^Q\d+:\s*/, "");
      } else if (line.startsWith("A:")) {
        optA = line.replace(/^A:\s*/, "");
      } else if (line.startsWith("B:")) {
        optB = line.replace(/^B:\s*/, "");
      } else if (line.startsWith("C:")) {
        optC = line.replace(/^C:\s*/, "");
      } else if (line.startsWith("D:")) {
        optD = line.replace(/^D:\s*/, "");
      } else if (line.startsWith("ANSWER:")) {
        answer = line.replace(/^ANSWER:\s*/, "").trim().charAt(0).toUpperCase();
      }
    }

    if (question && optA && optB && optC && optD) {
      questions.push({
        question,
        options: { A: optA, B: optB, C: optC, D: optD },
        answer: ["A", "B", "C", "D"].includes(answer) ? answer : "A",
      });
    }
  }

  while (questions.length < 5) {
    const idx = questions.length + 1;
    questions.push({
      question: `What is an important aspect of ${topic}? (Question ${idx})`,
      options: {
        A: "Its historical significance",
        B: "Its geographic location",
        C: "Its cultural impact",
        D: "Its economic effects",
      },
      answer: "A",
    });
  }

  return { questions: questions.slice(0, 5), topic, level };
}

function getFallbackQuiz(topic: string, level: string): Quiz {
  const questions: QuizQuestion[] = [];
  for (let i = 1; i <= 5; i++) {
    questions.push({
      question: `What is a key aspect of ${topic}? (Question ${i})`,
      options: {
        A: "Its historical significance",
        B: "Its geographic location",
        C: "Its cultural impact",
        D: "Its economic effects",
      },
      answer: "A",
    });
  }
  return { questions, topic, level };
}

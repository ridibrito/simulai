import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GeneratedQuestion {
    content: string;
    type: "objective" | "essay";
    difficulty: "easy" | "medium" | "hard";
    options?: { letter: string; text: string }[];
    correctAnswer?: string;
    explanation: string;
}

export interface StudyRecommendation {
    type: "study_focus" | "material" | "exam";
    title: string;
    description: string;
    priority: number;
}

export async function generateQuestionsFromContent(
    content: string,
    subjectName: string,
    questionCount: number = 5,
    difficulty: string = "medium"
): Promise<GeneratedQuestion[]> {
    const prompt = `Você é um especialista em concursos públicos brasileiros. Baseado no seguinte conteúdo de estudo, gere ${questionCount} questões de nível ${difficulty} sobre o tema "${subjectName}".

Conteúdo:
${content}

Para cada questão, forneça no formato JSON:
- content: texto da questão
- type: "objective" para múltipla escolha ou "essay" para discursiva
- difficulty: "${difficulty}"
- options: array de objetos {letter: "A/B/C/D/E", text: "texto da alternativa"} (apenas para objective)
- correctAnswer: letra da resposta correta (apenas para objective)
- explanation: explicação detalhada da resposta

Gere ${Math.ceil(questionCount * 0.8)} questões objetivas e ${Math.floor(questionCount * 0.2)} questões discursivas.
Responda APENAS com um array JSON válido.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text || "[]";
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating questions:", error);
        return [];
    }
}

export async function evaluateEssayAnswer(
    question: string,
    userAnswer: string,
    subjectName: string
): Promise<{ score: number; evaluation: string }> {
    const prompt = `Você é um examinador de concursos públicos brasileiros especializado em "${subjectName}".

Avalie a seguinte resposta discursiva:

QUESTÃO:
${question}

RESPOSTA DO CANDIDATO:
${userAnswer}

Forneça uma avaliação detalhada no formato JSON:
{
  "score": (número de 0 a 10, com uma casa decimal),
  "evaluation": "avaliação detalhada com pontos positivos, pontos a melhorar e sugestões de estudo"
}

Seja justo mas rigoroso como um examinador real de concurso.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        score: { type: "number" },
                        evaluation: { type: "string" },
                    },
                    required: ["score", "evaluation"],
                },
            },
        });

        const text = response.text || '{"score": 0, "evaluation": "Erro na avaliação"}';
        return JSON.parse(text);
    } catch (error) {
        console.error("Error evaluating essay:", error);
        return { score: 0, evaluation: "Erro ao avaliar a resposta." };
    }
}

export async function generateStudyRecommendations(
    performanceData: { subjectName: string; averageScore: number; strengthLevel: string }[],
    targetExam: string
): Promise<StudyRecommendation[]> {
    const prompt = `Você é um coach de estudos especializado em concursos públicos brasileiros.

O aluno está se preparando para: ${targetExam}

Dados de desempenho por matéria:
${performanceData.map(p => `- ${p.subjectName}: média ${p.averageScore.toFixed(1)}, nível ${p.strengthLevel}`).join("\n")}

Com base nesses dados, gere 5 recomendações personalizadas de estudo no formato JSON:
[
  {
    "type": "study_focus" | "material" | "exam",
    "title": "título curto da recomendação",
    "description": "descrição detalhada com ações específicas",
    "priority": 1-5 (1 = mais urgente)
  }
]

Priorize as matérias com pior desempenho e sugira estratégias práticas.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text || "[]";
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return [];
    }
}

export async function summarizeMaterial(content: string, title: string): Promise<string> {
    const prompt = `Você é um especialista em concursos públicos brasileiros. Resuma o seguinte material de estudo de forma clara e objetiva, destacando os pontos mais importantes para provas de concurso.

Título: ${title}

Conteúdo:
${content}

Forneça um resumo estruturado com:
1. Pontos principais
2. Conceitos-chave
3. O que mais cai em provas sobre esse tema`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Não foi possível gerar o resumo.";
    } catch (error) {
        console.error("Error summarizing material:", error);
        return "Erro ao gerar resumo do material.";
    }
}

export async function explainQuestion(
    question: string,
    options: { letter: string; text: string }[] | null,
    correctAnswer: string | null
): Promise<string> {
    const optionsText = options
        ? options.map(o => `${o.letter}) ${o.text}`).join("\n")
        : "";

    const prompt = `Você é um professor de cursinho preparatório para concursos públicos. Explique detalhadamente a seguinte questão:

QUESTÃO:
${question}

${optionsText ? `ALTERNATIVAS:\n${optionsText}` : ""}

${correctAnswer ? `RESPOSTA CORRETA: ${correctAnswer}` : ""}

Forneça uma explicação didática que inclua:
1. Por que a resposta correta está certa
2. Por que as outras alternativas estão erradas (se aplicável)
3. Conceitos fundamentais relacionados
4. Dicas para resolver questões similares`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Não foi possível gerar a explicação.";
    } catch (error) {
        console.error("Error explaining question:", error);
        return "Erro ao gerar explicação.";
    }
}

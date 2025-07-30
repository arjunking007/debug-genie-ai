import { Language } from "@/components/CodeEditor";
import { ErrorAnalysis } from "@/components/AnalysisPanel";

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeCode(code: string, language: Language): Promise<ErrorAnalysis> {
    const prompt = `
You are an expert code analyzer. Analyze the following ${language} code for errors, potential issues, and improvements.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis in the following JSON format:
{
  "hasErrors": boolean,
  "errors": [
    {
      "line": number,
      "column": number (optional),
      "type": "error" | "warning" | "info",
      "message": "Brief description of the issue",
      "suggestion": "How to fix this issue",
      "impact": "What will happen if this issue is not resolved"
    }
  ],
  "summary": "Overall summary of the code quality and main issues",
  "suggestions": ["General improvement suggestions"]
}

Important guidelines:
1. Be very specific about line numbers (count from 1)
2. Identify syntax errors, logical errors, performance issues, and best practice violations
3. Provide actionable suggestions for each issue
4. Explain the impact of each issue
5. Keep messages clear and beginner-friendly
6. Only return valid JSON, no additional text
`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = `API Error (${response.status})`;
        
        if (response.status === 503) {
          errorMessage = "Gemini API is currently overloaded. Please try again in a few moments.";
        } else if (response.status === 401) {
          errorMessage = "Invalid API key. Please check your Gemini API key.";
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please wait before trying again.";
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      // Clean up the response to extract JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini API');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw error instanceof Error ? error : new Error('Failed to analyze code. Please try again.');
    }
  }

  async generateCode(prompt: string, language: Language): Promise<string> {
    const codePrompt = `
You are an expert ${language} developer. Generate clean, well-commented, and production-ready ${language} code based on the following request:

Request: ${prompt}

Guidelines:
1. Write clean, readable code with proper formatting
2. Include helpful comments explaining the logic
3. Follow ${language} best practices and conventions
4. Make the code production-ready and robust
5. Include error handling where appropriate
6. Only return the code, no additional explanations

Generate ${language} code:
`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: codePrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = `API Error (${response.status})`;
        
        if (response.status === 503) {
          errorMessage = "Gemini API is currently overloaded. Please try again in a few moments.";
        } else if (response.status === 401) {
          errorMessage = "Invalid API key. Please check your Gemini API key.";
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please wait before trying again.";
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      let result = data.candidates[0].content.parts[0].text;
      
      // Clean up the response to extract just the code
      result = result.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
      
      return result;
    } catch (error) {
      console.error('Error generating code:', error);
      throw error instanceof Error ? error : new Error('Failed to generate code. Please try again.');
    }
  }
}
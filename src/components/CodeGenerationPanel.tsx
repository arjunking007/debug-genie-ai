import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Copy, Download } from "lucide-react";
import { Language } from "./CodeEditor";
import { LanguageSelector } from "./LanguageSelector";
import { CodeEditor } from "./CodeEditor";
import { useToast } from "@/hooks/use-toast";

interface CodeGenerationPanelProps {
  onGenerate: (prompt: string, language: Language) => Promise<void>;
  generatedCode: string;
  isGenerating: boolean;
}

export const CodeGenerationPanel = ({ 
  onGenerate, 
  generatedCode, 
  isGenerating 
}: CodeGenerationPanelProps) => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<Language>('python');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the code you want to generate",
        variant: "destructive"
      });
      return;
    }
    
    await onGenerate(prompt, language);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive"
      });
    }
  };

  const downloadCode = () => {
    const extensions: Record<Language, string> = {
      python: 'py',
      javascript: 'js',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css'
    };

    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_code.${extensions[language]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span>AI Code Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe what you want to build:</label>
            <Textarea
              placeholder="e.g., Create a function that calculates the factorial of a number, Create a responsive login form, Build a simple calculator..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Language:</label>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Code</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCode}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={generatedCode}
              onChange={() => {}} // Read-only for generated code
              language={language}
              height="300px"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
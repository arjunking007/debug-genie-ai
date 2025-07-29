import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CodeEditor, Language } from "@/components/CodeEditor";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AnalysisPanel, ErrorAnalysis } from "@/components/AnalysisPanel";
import { CodeGenerationPanel } from "@/components/CodeGenerationPanel";
import { GeminiService } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";
import { Bug, Sparkles, Settings, Key } from "lucide-react";

const Index = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>('python');
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const { toast } = useToast();

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Gemini API key",
        variant: "destructive"
      });
      return;
    }
    
    setGeminiService(new GeminiService(apiKey));
    toast({
      title: "Success",
      description: "Gemini API key configured successfully!"
    });
  };

  const analyzeCode = async () => {
    if (!geminiService) {
      toast({
        title: "Error",
        description: "Please configure your Gemini API key first",
        variant: "destructive"
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await geminiService.analyzeCode(code, language);
      setAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: result.hasErrors 
          ? `Found ${result.errors.length} issue${result.errors.length > 1 ? 's' : ''}`
          : "Code looks good!"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCode = async (prompt: string, targetLanguage: Language) => {
    if (!geminiService) {
      toast({
        title: "Error", 
        description: "Please configure your Gemini API key first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await geminiService.generateCode(prompt, targetLanguage);
      setGeneratedCode(result);
      toast({
        title: "Code Generated",
        description: "Your code has been generated successfully!"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-subtle">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bug className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Code Analyzer Pro
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered code debugging and generation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-accent text-accent">
                Multi-Language Support
              </Badge>
              <Badge variant="outline" className="border-primary text-primary">
                Powered by Gemini AI
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* API Key Configuration */}
        {!geminiService && (
          <Card className="mb-6 border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-warning">
                <Key className="h-5 w-5" />
                <span>Configure Gemini API Key</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To use the code analysis and generation features, please provide your Gemini API key.
                You can get one from the Google AI Studio.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleApiKeySubmit} className="bg-gradient-primary">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="analyzer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="analyzer" className="flex items-center space-x-2">
              <Bug className="h-4 w-4" />
              <span>Code Analyzer</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Code Generator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code Input Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Code Input</CardTitle>
                      <LanguageSelector value={language} onChange={setLanguage} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CodeEditor
                      value={code}
                      onChange={setCode}
                      language={language}
                      height="500px"
                    />
                  </CardContent>
                </Card>

                <Button 
                  onClick={analyzeCode}
                  disabled={isAnalyzing || !geminiService}
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bug className="h-4 w-4 mr-2" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </div>

              {/* Analysis Results Panel */}
              <div className="space-y-4">
                <AnalysisPanel analysis={analysis} isLoading={isAnalyzing} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <CodeGenerationPanel
                onGenerate={generateCode}
                generatedCode={generatedCode}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
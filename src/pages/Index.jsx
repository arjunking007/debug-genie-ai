import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/CodeEditor";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { CodeGenerationPanel } from "@/components/CodeGenerationPanel";
import { GeminiService } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";
import { Bug, Sparkles, Settings, Key, Play } from "lucide-react";

const Index = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState('python');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [geminiService, setGeminiService] = useState(null);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setGeminiService(new GeminiService(savedApiKey));
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Gemini API key",
        variant: "destructive"
      });
      return;
    }
    
    // Save API key to localStorage
    localStorage.setItem('gemini_api_key', apiKey);
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

  const generateCode = async (prompt, targetLanguage) => {
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

  const runCode = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to run",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setOutput("");

    try {
      if (language === 'javascript') {
        // Capture console.log output
        const originalLog = console.log;
        let capturedOutput = [];
        
        console.log = (...args) => {
          capturedOutput.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };

        // Execute the code
        eval(code);
        
        // Restore original console.log
        console.log = originalLog;
        
        setOutput(capturedOutput.join('\n') || 'Code executed successfully (no output)');
      } else {
        setOutput(`Code execution is currently only supported for JavaScript. 
For ${language}, please use an appropriate compiler/interpreter.`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
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

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={analyzeCode}
                    disabled={isAnalyzing || !geminiService}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
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
                  
                  <Button 
                    onClick={runCode}
                    disabled={isRunning}
                    variant="outline"
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                </div>

                {/* Output Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="h-5 w-5 text-accent" />
                      <span>Output</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto font-mono text-sm">
                      {output ? (
                        <pre className="whitespace-pre-wrap">{output}</pre>
                      ) : (
                        <div className="text-muted-foreground italic">
                          Click "Run Code" to see output here...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
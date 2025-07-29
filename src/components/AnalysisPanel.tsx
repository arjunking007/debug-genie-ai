import { AlertCircle, CheckCircle, Info, Lightbulb, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface ErrorAnalysis {
  hasErrors: boolean;
  errors: Array<{
    line: number;
    column?: number;
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestion: string;
    impact: string;
  }>;
  summary: string;
  suggestions: string[];
}

interface AnalysisPanelProps {
  analysis: ErrorAnalysis | null;
  isLoading: boolean;
}

export const AnalysisPanel = ({ analysis, isLoading }: AnalysisPanelProps) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            <span>Analyzing Code...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <span>Code Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Paste your code and click "Analyze Code" to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-info" />;
    }
  };

  const getErrorBadgeVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {analysis.hasErrors ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 text-success" />
          )}
          <span>
            {analysis.hasErrors 
              ? `Found ${analysis.errors.length} issue${analysis.errors.length > 1 ? 's' : ''}` 
              : 'Code looks good!'
            }
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">{analysis.summary}</p>
        </div>

        {/* Errors */}
        {analysis.errors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Issues Found:</h4>
            {analysis.errors.map((error, index) => (
              <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getErrorIcon(error.type)}
                    <Badge variant={getErrorBadgeVariant(error.type)}>
                      {error.type.toUpperCase()}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Line {error.line}</span>
                      {error.column && <span>, Column {error.column}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">{error.message}</p>
                  <div className="bg-accent/10 border border-accent/20 rounded p-2">
                    <p className="text-xs text-accent-foreground font-medium mb-1">Impact:</p>
                    <p className="text-xs">{error.impact}</p>
                  </div>
                  <div className="bg-success/10 border border-success/20 rounded p-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <Lightbulb className="h-3 w-3 text-success" />
                      <p className="text-xs text-success font-medium">Suggestion:</p>
                    </div>
                    <p className="text-xs">{error.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Suggestions */}
        {analysis.suggestions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-success" />
                <span>General Suggestions:</span>
              </h4>
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
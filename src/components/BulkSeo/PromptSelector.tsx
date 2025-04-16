
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SavedPrompt, usePrompts } from "@/hooks/usePrompts";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Bookmark, Clock, Edit, ExternalLink, Tag } from "lucide-react";

interface PromptSelectorProps {
  onPromptSelect: (prompt: SavedPrompt) => void;
}

const PromptSelector = ({ onPromptSelect }: PromptSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { prompts, isLoading } = usePrompts();

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Bookmark className="h-4 w-4" />
        Load Saved Prompt
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select a Saved Prompt</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {prompts.length} saved prompts available
            </p>
            <Link to="/prompts" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Manage Prompts
            </Link>
          </div>
          
          <ScrollArea className="h-[60vh]">
            <div className="grid gap-4">
              {isLoading ? (
                <p>Loading saved prompts...</p>
              ) : prompts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No saved prompts found</p>
                  <Link to="/prompts" className="text-blue-600 hover:underline">
                    Go to Prompt Manager to create some
                  </Link>
                </div>
              ) : (
                prompts.map((prompt) => (
                  <Card key={prompt.id} className="hover:bg-muted/30 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{prompt.title}</CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <CardDescription>{prompt.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {prompt.productType} • {prompt.aiRole}
                        </span>
                      </div>
                      <div className="text-sm line-clamp-2 text-muted-foreground">
                        {prompt.promptText.substring(0, 150)}...
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="default" 
                        className="w-full gap-2"
                        onClick={() => {
                          onPromptSelect(prompt);
                          setOpen(false);
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                        Use This Prompt
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PromptSelector;

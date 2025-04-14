import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateContent } from '@/utils/aiService';

const ProductsPage = () => {
  const [generatedContent, setGeneratedContent] = useState('');

  const testClaudeGeneration = async () => {
    try {
      const result = await generateContent(
        'Generate a creative product description for a cutting-edge smartphone', 
        'claude35_sonnet'
      );
      setGeneratedContent(result);
      toast.success('Content generated successfully with Claude!');
    } catch (error) {
      console.error('Claude generation error:', error);
      toast.error(`Failed to generate content: ${error.message}`);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>
      
      {/* Claude API Test Section */}
      <div className="border p-4 rounded-lg bg-muted/50">
        <h2 className="text-lg font-semibold mb-2">Claude API Test</h2>
        <Button onClick={testClaudeGeneration} className="mb-4">
          Generate Sample Content with Claude
        </Button>
        {generatedContent && (
          <div className="mt-4 p-3 bg-background border rounded">
            <h3 className="font-medium mb-2">Generated Content:</h3>
            <p>{generatedContent}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

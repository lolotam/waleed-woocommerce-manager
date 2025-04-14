
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GoToPageControlProps {
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const GoToPageControl: React.FC<GoToPageControlProps> = ({
  totalPages,
  setCurrentPage
}) => {
  const [goToPage, setGoToPage] = useState<string>('');

  const handleGoToPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoToPage(e.target.value);
  };

  const handleGoToPageSubmit = () => {
    const pageNum = parseInt(goToPage);
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage('');
      toast.success(`Navigated to page ${pageNum}`);
    } else {
      toast.error(`Please enter a valid page number between 1 and ${totalPages}`);
    }
  };

  const handleGoToPageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPageSubmit();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number" 
        placeholder="Go to page"
        className="w-32"
        value={goToPage}
        onChange={handleGoToPageChange}
        onKeyDown={handleGoToPageKeyDown}
        min={1}
        max={totalPages}
      />
      <Button variant="outline" size="sm" onClick={handleGoToPageSubmit}>
        Go
      </Button>
    </div>
  );
};

export default GoToPageControl;

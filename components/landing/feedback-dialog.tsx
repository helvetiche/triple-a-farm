'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { EnhancedDropzone } from '@/components/ui/enhanced-dropzone';

interface FeedbackDialogProps {
  children: React.ReactNode;
}

export function FeedbackDialog({ children }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [breeds, setBreeds] = useState<Array<{breedId: string, name: string}>>([]);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    breedId: '',
    breed: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch breeds on component mount
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch('/api/public/breeds');
        const result = await response.json();
        
        if (result.success && result.data) {
          setBreeds(result.data);
        }
      } catch (error) {
        console.error('Error fetching breeds:', error);
      } finally {
        setIsLoadingBreeds(false);
      }
    };
    
    fetchBreeds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || !formData.breedId || !formData.message || rating === 0) {
      toast.error('Please fill in all fields and select a rating', {
        description: 'All fields including breed selection are required to submit feedback.'
      });
      setIsSubmitting(false);
      return;
    }

    if (proofFiles.length === 0) {
      toast.error('Please upload proof of purchase', {
        description: 'Add at least one file before submitting feedback.'
      });
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email address', {
        description: 'Please enter a valid email address.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/public/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: formData.name,
          rating: rating,
          rooster: formData.breed,
          roosterBreedId: formData.breedId,
          comment: formData.message,
          // Note: customerId and transactionId would need to be handled in a real scenario
          customerId: null,
          transactionId: null,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      
      toast.success('Feedback submitted successfully!', {
        description: `Thank you ${formData.name}! We appreciate your ${rating}-star feedback. Your review ID is ${data.data.id}.`
      });
      
      // Reset form
      setFormData({ name: '', email: '', breedId: '', breed: '', message: '' });
      setRating(0);
      setProofFiles([]);
      
      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback', {
        description: 'Something went wrong. Please try again later.'
      });
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBreedChange = (breedId: string, breedName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      breedId: breedId,
      breed: breedName 
    }));
  };

  const handleCancel = () => {
    // Reset form
    setFormData({ name: '', email: '', breedId: '', breed: '', message: '' });
    setRating(0);
    setProofFiles([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#3d6c58]">Share Your Feedback</DialogTitle>
          <DialogDescription>
            We'd love to hear your thoughts about Triple A Gamefarm. Your feedback helps us improve!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Row: Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#3d6c58]">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#3d6c58]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
                required
              />
            </div>
          </div>

          {/* Second Row: Breed and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breed Field */}
            <div className="space-y-2">
              <Label htmlFor="breed" className="text-[#3d6c58]">Which breed did you order?</Label>
              <Select 
                value={formData.breedId} 
                onValueChange={(value) => {
                  const selectedBreed = breeds.find(b => b.breedId === value);
                  if (selectedBreed) {
                    handleBreedChange(selectedBreed.breedId, selectedBreed.name);
                  }
                }} 
                disabled={isLoadingBreeds}
                required
              >
                <SelectTrigger className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors">
                  <SelectValue placeholder={isLoadingBreeds ? "Loading breeds..." : "Select a breed"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingBreeds ? (
                    <SelectItem value="loading" disabled>
                      Loading breeds...
                    </SelectItem>
                  ) : (
                    breeds.map((breed) => (
                      <SelectItem key={breed.breedId} value={breed.breedId}>
                        {breed.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Field */}
            <div className="space-y-2">
              <Label className="text-[#3d6c58]">Rating</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none cursor-pointer"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-[#3d6c58] text-[#3d6c58]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message Field - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[#3d6c58]">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your experience..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] min-h-[120px] transition-colors"
              required
            />
          </div>

          {/* Proof of Purchase - Full Width */}
          <div className="space-y-2">
            <Label className="text-[#3d6c58]">Proof of Purchase</Label>
            <EnhancedDropzone
              value={proofFiles}
              onValueChange={setProofFiles}
              accept="image/*,.pdf"
              multiple
              maxFiles={3}
              maxSize={5}
              disabled={isSubmitting}
            />
            <p className="text-xs text-[#4a6741]">
              Upload a screenshot/photo or PDF receipt. Max 5MB per file.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleCancel}
              className="w-full sm:w-auto border-[#3d6c58] text-[#3d6c58] hover:bg-[#3d6c58] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-[#3d6c58] hover:bg-[#4e816b] text-white ${isSubmitting ? 'pointer-events-none' : ''}`}
            >
              <span>Submit Feedback</span>
              {isSubmitting ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

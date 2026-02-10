import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyGalleryProps {
  coverUrl: string | null;
  galleryUrls: string[];
  noPhotosLabel?: string;
}

export const PropertyGallery = ({ coverUrl, galleryUrls, noPhotosLabel = 'No photos available' }: PropertyGalleryProps) => {
  const allImages = [coverUrl, ...galleryUrls].filter(Boolean) as string[];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (allImages.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground">{noPhotosLabel}</p>
      </div>
    );
  }

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((i) => (i !== null ? (i - 1 + allImages.length) % allImages.length : null));
  const nextImage = () => setLightboxIndex((i) => (i !== null ? (i + 1) % allImages.length : null));

  return (
    <>
      {allImages.length === 1 ? (
        <div className="aspect-video rounded-2xl overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
          <img src={allImages[0]} alt="Property" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[300px] sm:h-[400px] lg:h-[480px]">
          <div className="col-span-2 row-span-2 cursor-pointer relative group" onClick={() => openLightbox(0)}>
            <img src={allImages[0]} alt="Property" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
          </div>
          {allImages.slice(1, 5).map((url, i) => (
            <div key={i} className="cursor-pointer relative group" onClick={() => openLightbox(i + 1)}>
              <img src={url} alt={`Property ${i + 2}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
              {i === 3 && allImages.length > 5 && (
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-lg">+{allImages.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center" onClick={closeLightbox}>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/20" onClick={closeLightbox}>
            <X className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <img src={allImages[lightboxIndex]} alt="Property" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight className="w-8 h-8" />
          </Button>
          <div className="absolute bottom-4 text-primary-foreground text-sm">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
};

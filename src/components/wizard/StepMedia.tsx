import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWizardLabels } from './wizardLabels';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Listing = Partial<Tables<'listings'>>;

interface StepMediaProps {
  data: Listing;
  listingId: string | null;
  onChange: (patch: Listing) => void;
}

export const StepMedia = ({ data, listingId, onChange }: StepMediaProps) => {
  const t = useWizardLabels();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, path: string) => {
    const { data: uploadData, error } = await supabase.storage
      .from('listing-media')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from('listing-media')
      .getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !listingId) return;
    setUploading(true);
    try {
      // First file becomes cover
      const coverFile = files[0];
      const coverExt = coverFile.name.split('.').pop();
      const coverUrl = await uploadFile(coverFile, `${listingId}/cover.${coverExt}`);
      onChange({ cover_image_url: coverUrl });

      // Remaining files go to gallery
      if (files.length > 1) {
        const currentUrls = (data.gallery_urls as string[]) || [];
        const newUrls: string[] = [];
        for (let i = 1; i < files.length && currentUrls.length + newUrls.length < 30; i++) {
          const file = files[i];
          const ext = file.name.split('.').pop();
          const url = await uploadFile(file, `${listingId}/gallery/${Date.now()}-${i}.${ext}`);
          newUrls.push(url);
        }
        if (newUrls.length > 0) {
          onChange({ gallery_urls: [...currentUrls, ...newUrls] as any });
        }
      }
    } catch (err) {
      console.error('Cover upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !listingId) return;
    setUploading(true);
    try {
      const currentUrls = (data.gallery_urls as string[]) || [];
      const newUrls: string[] = [];
      for (let i = 0; i < files.length && currentUrls.length + newUrls.length < 30; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const url = await uploadFile(file, `${listingId}/gallery/${Date.now()}-${i}.${ext}`);
        newUrls.push(url);
      }
      onChange({ gallery_urls: [...currentUrls, ...newUrls] as any });
    } catch (err) {
      console.error('Gallery upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const urls = [...((data.gallery_urls as string[]) || [])];
    urls.splice(index, 1);
    onChange({ gallery_urls: urls as any });
  };

  return (
    <div className="space-y-8">
      {/* Cover image */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">{t('coverImage')}</Label>
        <input ref={coverInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCoverUpload} />
        {data.cover_image_url ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
            <img src={data.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange({ cover_image_url: null })}
              className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 hover:bg-background"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={!listingId || uploading}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
            <span className="text-sm">{uploading ? t('uploading') : t('dropzone')}</span>
          </button>
        )}
      </div>

      {/* Gallery */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">{t('gallery')}</Label>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {((data.gallery_urls as string[]) || []).map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryImage(i)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-background"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {((data.gallery_urls as string[]) || []).length < 30 && (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={!listingId || uploading}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span className="text-xs">{uploading ? t('uploading') : '+'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="videoUrl" className="text-sm font-semibold">{t('videoUrl')}</Label>
        <Input
          id="videoUrl"
          type="url"
          value={data.video_url || ''}
          onChange={(e) => onChange({ video_url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

interface LeadFormProps {
  listingId: string;
  signId: string | null;
}

export const LeadForm = ({ listingId, signId }: LeadFormProps) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any).from('leads').insert({
        listing_id: listingId,
        sign_id: signId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim() || null,
        consent: form.consent,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">Message sent!</h3>
        <p className="text-sm text-muted-foreground">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead-name">Name *</Label>
          <Input
            id="lead-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lead-email">Email *</Label>
          <Input
            id="lead-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="lead-phone">Phone</Label>
        <Input
          id="lead-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="lead-message">Message</Label>
        <Textarea
          id="lead-message"
          rows={3}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="I'm interested in this property..."
        />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="lead-consent"
          checked={form.consent}
          onCheckedChange={(v) => setForm((f) => ({ ...f, consent: !!v }))}
        />
        <Label htmlFor="lead-consent" className="text-xs text-muted-foreground leading-tight">
          I agree to be contacted regarding this property
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={loading || !form.name.trim() || !form.email.trim()}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        Send message
      </Button>
    </form>
  );
};

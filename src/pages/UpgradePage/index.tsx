import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vipRequestApi } from '@/services/user/vipRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Crown, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function UpgradePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vipRequestApi.createRequest({ message: reason, requestedMonths: 1 });
      toast.success('VIP request submitted successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to submit VIP request', error);
      toast.error('Failed to submit VIP request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4'>
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <CardTitle className='flex items-center gap-2 text-2xl'>
                    <Crown className='h-6 w-6 text-yellow-500' />
                    Upgrade to VIP
                </CardTitle>
                <CardDescription>
                    Unlock the full potential of our platform with a VIP membership.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <h3 className='font-semibold'>VIP Benefits</h3>
            <ul className='space-y-3'>
              <li className='flex items-center gap-2 text-sm'>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
                Full AI Reasoning & Analysis
              </li>
              <li className='flex items-center gap-2 text-sm'>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
                Real-time Premium Signals
              </li>
              <li className='flex items-center gap-2 text-sm'>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
                Priority Support
              </li>
              <li className='flex items-center gap-2 text-sm'>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
                Exclusive Market Insights
              </li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='reason'>Why do you want to upgrade?</Label>
              <Textarea
                id='reason'
                placeholder='Tell us a bit about why you need VIP access...'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className='min-h-30'
              />
            </div>
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='bg-muted/50 text-muted-foreground flex justify-center p-4 text-xs'>
          Your request will be reviewed by our team within 24 hours.
        </CardFooter>
      </Card>
    </div>
  );
}

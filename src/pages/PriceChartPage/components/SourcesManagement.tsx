import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSources, getUserSources, subscribeSource, unsubscribeSource, type Source } from '@/services/subscribe';
import { Plus, Trash2, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SourcesManagementProps {
  userId: string;
}

export const SourcesManagement = ({ userId }: SourcesManagementProps) => {
  const [allSources, setAllSources] = useState<Source[]>([]);
  const [userSources, setUserSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [unsubscribing, setUnsubscribing] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesData, userSourcesData] = await Promise.all([
        getSources({ page: 1, page_size: 100 }),
        getUserSources(userId)
      ]);
      setAllSources(sourcesData.data);
      setUserSources(userSourcesData);
    } catch (error) {
      toast.error('Failed to fetch sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubscribe = async (url: string, sourceId?: string) => {
    try {
      setSubscribing(sourceId || url);
      await subscribeSource({ url, user_id: userId });
      toast.success('Subscribed to source successfully');
      await fetchData();
    } catch (error) {
      toast.error('Failed to subscribe to source');
    } finally {
      setSubscribing(null);
    }
  };

  const handleUnsubscribe = async (sourceId: string) => {
    try {
      setUnsubscribing(sourceId);
      await unsubscribeSource({ source_id: sourceId, user_id: userId });
      toast.success('Unsubscribed from source successfully');
      await fetchData();
    } catch (error) {
      toast.error('Failed to unsubscribe from source');
    } finally {
      setUnsubscribing(null);
    }
  };

  const handleAddCustomSource = async () => {
    if (!customUrl.trim()) return;

    try {
      setAddingCustom(true);
      await handleSubscribe(customUrl);
      setCustomUrl('');
      setDialogOpen(false);
    } finally {
      setAddingCustom(false);
    }
  };

  const isSubscribed = (sourceId: string) => {
    return userSources.some((s) => s._id === sourceId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='flex h-40 items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* My Sources */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>My News Sources</CardTitle>
            <Button size='sm' variant='outline' onClick={fetchData}>
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userSources.length === 0 ? (
            <p className='text-muted-foreground text-center text-sm'>No sources subscribed yet</p>
          ) : (
            <ScrollArea className='max-h-60'>
              <div className='space-y-2'>
                {userSources.map((source) => (
                  <div
                    key={source._id}
                    className='border-border hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
                  >
                    <div className='flex-1'>
                      <h4 className='text-sm font-semibold'>{source.name}</h4>
                      <a
                        href={source.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors'
                      >
                        {source.url}
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    </div>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleUnsubscribe(source._id)}
                      disabled={unsubscribing === source._id}
                      className='text-red-500 hover:text-red-600'
                    >
                      {unsubscribing === source._id ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Available Sources */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>Available Sources</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size='sm'>
                  <Plus className='h-4 w-4' />
                  Add Custom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Source</DialogTitle>
                  <DialogDescription>Enter the URL of the news source you want to subscribe to.</DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <Input
                    placeholder='https://example.com'
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSource()}
                  />
                  <div className='flex justify-end gap-2'>
                    <Button variant='outline' onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCustomSource} disabled={addingCustom || !customUrl.trim()}>
                      {addingCustom ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Add Source'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className='max-h-80'>
            <div className='space-y-2'>
              {allSources.map((source) => {
                const subscribed = isSubscribed(source._id);
                return (
                  <div
                    key={source._id}
                    className='border-border hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
                  >
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <h4 className='text-sm font-semibold'>{source.name}</h4>
                        {subscribed && <Badge variant='secondary'>Subscribed</Badge>}
                      </div>
                      <a
                        href={source.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors'
                      >
                        {source.url}
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    </div>
                    {!subscribed && (
                      <Button
                        size='sm'
                        onClick={() => handleSubscribe(source.url, source._id)}
                        disabled={subscribing === source._id}
                      >
                        {subscribing === source._id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Plus className='h-4 w-4' />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

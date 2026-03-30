import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { useTerminology } from '@/contexts/TerminologyContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Users, UserPlus, Merge, Eye, Calendar, Hash, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import ClaimVisitorModal from '@/components/dashboard/ClaimVisitorModal';
import PageHeader from '@/components/dashboard/PageHeader';

interface ClusterMember {
  id: string;
  temp_user_id?: string;
  temp_email?: string;
  face_roi_url?: string | null;
  face_roi?: string | null;
  appearances?: number;
  detection_count?: number;
  face_detections?: number;
  dates_seen?: string[];
  first_seen?: string;
  last_seen?: string;
  created_at?: string;
}

interface Cluster {
  cluster_id: string;
  member_count: number;
  total_appearances: number;
  total_attendance_days: number;
  last_seen: string;
  gender?: string;
  age_range?: string;
  members: ClusterMember[];
}

interface DashboardContext { user: any; profile: any; session: any; }

const getMemberImage = (m: ClusterMember) => m.face_roi_url || m.face_roi || '';
const getMemberAppearances = (m: ClusterMember) => m.appearances ?? m.face_detections ?? m.detection_count ?? 0;

const VisitorReview = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const { getTerm } = useTerminology();
  const { toast } = useToast();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Merge modal state
  const [mergeCluster, setMergeCluster] = useState<Cluster | null>(null);
  const [selectedPrimary, setSelectedPrimary] = useState<string>('');
  const [merging, setMerging] = useState(false);

  // Claim modal state
  const [claimVisitor, setClaimVisitor] = useState<any>(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchClusters = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const result = await djangoApi.getTempAttendanceClusters();
      if (result.error) {
        if (result.status !== 404) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
        setClusters([]);
      } else {
        const data = result.data as any;
        setClusters(data?.clusters || data || []);
      }
    } catch {
      setClusters([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { fetchClusters(); }, [fetchClusters]);

  const handleOpenMerge = (cluster: Cluster) => {
    setMergeCluster(cluster);
    // Default to the member with most appearances
    const sorted = [...cluster.members].sort((a, b) => getMemberAppearances(b) - getMemberAppearances(a));
    setSelectedPrimary(sorted[0]?.id || '');
  };

  const handleMerge = async () => {
    if (!mergeCluster || !selectedPrimary) return;
    setMerging(true);
    try {
      const mergeIds = mergeCluster.members
        .filter(m => m.id !== selectedPrimary)
        .map(m => m.id);
      const result = await djangoApi.mergeTempAttendanceClusters({
        primary_id: selectedPrimary,
        merge_ids: mergeIds,
      });
      if (result.error) throw new Error(result.error);
      toast({ title: 'Merged', description: `${mergeIds.length} duplicate(s) merged successfully.` });
      setMergeCluster(null);
      fetchClusters(true);
    } catch (err: any) {
      toast({ title: 'Merge Failed', description: err.message || 'Could not merge clusters.', variant: 'destructive' });
    } finally {
      setMerging(false);
    }
  };

  const handleClaim = (cluster: Cluster) => {
    const primary = cluster.members[0];
    if (!primary) return;
    setClaimVisitor({
      id: primary.id,
      temp_face_id: primary.temp_user_id || primary.id,
      temp_user_id: primary.temp_user_id || primary.id,
      face_roi_url: getMemberImage(primary),
      face_detections: cluster.total_appearances,
      detection_count: cluster.total_appearances,
      date: cluster.last_seen ? format(new Date(cluster.last_seen), 'dd/MM/yyyy') : undefined,
      created_at: cluster.last_seen,
    });
    setIsClaimOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Review"
        subtitle="Review and manage visitor clusters detected by the system"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Visitor Review' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchClusters(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchClusters(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {clusters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Visitor Clusters</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Visitor clusters will appear here once the system groups detected faces.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clusters.map((cluster) => (
            <Card key={cluster.cluster_id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                {/* Thumbnails row */}
                <div className="flex items-center gap-2">
                  {cluster.members.slice(0, 4).map((member) => {
                    const img = getMemberImage(member);
                    return (
                      <Avatar
                        key={member.id}
                        className="h-12 w-12 cursor-pointer ring-2 ring-border hover:ring-primary transition-all"
                        onClick={() => img && setLightboxImage(img)}
                      >
                        <AvatarImage src={img} alt="Visitor" className="object-cover" />
                        <AvatarFallback className="bg-muted text-xs">V</AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {cluster.member_count > 4 && (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                      +{cluster.member_count - 4}
                    </div>
                  )}
                </div>

                {/* Badge */}
                <div>
                  {cluster.member_count > 1 ? (
                    <Badge variant="destructive" className="text-xs">
                      {cluster.member_count} duplicates
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Unique visitor</Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" />
                    <span>{cluster.total_appearances} appearances · {cluster.total_attendance_days} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Last seen: {cluster.last_seen ? format(new Date(cluster.last_seen), 'MMM dd, yyyy') : '—'}</span>
                  </div>
                  {(cluster.gender || cluster.age_range) && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      <span>
                        {[cluster.gender, cluster.age_range].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {cluster.member_count > 1 && (
                    <Button size="sm" variant="outline" onClick={() => handleOpenMerge(cluster)}>
                      <Merge className="h-4 w-4 mr-1.5" />
                      Review & Merge
                    </Button>
                  )}
                  <Button size="sm" variant="default" onClick={() => handleClaim(cluster)}>
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Merge Modal ─── */}
      <Dialog open={!!mergeCluster} onOpenChange={() => setMergeCluster(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Merge className="h-5 w-5" />
              Review & Merge Duplicates
            </DialogTitle>
            <DialogDescription>
              Select the canonical visitor record. All others will be merged into it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {mergeCluster?.members.map((member) => {
              const img = getMemberImage(member);
              const isSelected = selectedPrimary === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedPrimary(member.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <Avatar className="h-14 w-14 flex-shrink-0">
                    <AvatarImage src={img} className="object-cover" />
                    <AvatarFallback className="bg-muted">V</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {member.temp_email || (member.temp_user_id || member.id).slice(0, 16) + '...'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getMemberAppearances(member)} appearances
                    </p>
                    {member.last_seen && (
                      <p className="text-xs text-muted-foreground">
                        Last seen: {format(new Date(member.last_seen), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="flex-shrink-0 text-xs">Primary</Badge>
                  )}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeCluster(null)}>Cancel</Button>
            <Button onClick={handleMerge} disabled={merging || !selectedPrimary}>
              {merging ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Merging...</>
              ) : (
                'Merge into this one'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Lightbox ─── */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-sm p-2 bg-black/90 border-none">
          <img src={lightboxImage || ''} alt="Visitor face" className="w-full h-auto rounded-lg" />
        </DialogContent>
      </Dialog>

      {/* ─── Claim Modal (reuse existing) ─── */}
      <ClaimVisitorModal
        isOpen={isClaimOpen}
        onClose={() => { setIsClaimOpen(false); setClaimVisitor(null); }}
        visitor={claimVisitor}
        onSuccess={() => {
          setIsClaimOpen(false);
          setClaimVisitor(null);
          fetchClusters(true);
        }}
      />
    </div>
  );
};

export default VisitorReview;

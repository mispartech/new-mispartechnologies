import { useState, useEffect } from 'react';
import { djangoApi } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2 } from 'lucide-react';
import { useTerminology } from '@/contexts/TerminologyContext';
import ClaimVisitorModal from '@/components/dashboard/ClaimVisitorModal';
import { format } from 'date-fns';

interface TempMember {
  id: string;
  temp_face_id?: string;
  temp_user_id?: string;
  face_roi_url?: string | null;
  face_roi?: string | null;
  date?: string;
  time?: string;
  created_at?: string;
  face_detections?: number;
  detection_count?: number;
  status?: string;
  gender?: string;
  age_range?: string;
}

/** Safely extract display fields from varying backend shapes */
const getTempId = (m: TempMember) => {
  // Prefer temp_email as a human-readable identifier, truncated
  if ((m as any).temp_email) {
    const email = (m as any).temp_email as string;
    // Show first part of email, e.g. "visitor_abc12..."
    return email.length > 20 ? email.slice(0, 18) + '...' : email;
  }
  const raw = m.temp_face_id || m.temp_user_id || m.id || 'unknown';
  return raw.slice(0, 12) + '...';
};
const getTempDate = (m: TempMember) => {
  if (m.date) return m.date;
  if (m.created_at) {
    try { return new Date(m.created_at).toLocaleDateString(); } catch { return '—'; }
  }
  return '—';
};
const getTempTime = (m: TempMember) => {
  if (m.time) return m.time;
  if (m.created_at) {
    try { return new Date(m.created_at).toLocaleTimeString(); } catch { return '—'; }
  }
  return '—';
};
const getTempAppearances = (m: TempMember) => m.face_detections ?? m.detection_count ?? 0;
const getTempImage = (m: TempMember) => m.face_roi_url || m.face_roi || '';

const TempMembersList = () => {
  const { getTerm } = useTerminology();
  const [tempMembers, setTempMembers] = useState<TempMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<TempMember | null>(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTempMembers();
  }, []);

  const fetchTempMembers = async () => {
    setLoading(true);
    try {
      const result = await djangoApi.getTempAttendance();
      if (result.error) {
        // If not implemented yet, show empty state gracefully
        if (result.status === 404) {
          setTempMembers([]);
          return;
        }
        throw new Error(result.error);
      }
      setTempMembers(result.data || []);
    } catch (error: any) {
      console.warn('Failed to fetch temp members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = (visitor: TempMember) => {
    setSelectedVisitor(visitor);
    setIsClaimOpen(true);
  };

  const handleClaimSuccess = () => {
    setIsClaimOpen(false);
    setSelectedVisitor(null);
    fetchTempMembers();
    toast({ title: 'Success', description: `Visitor has been registered as a ${getTerm('singular')}.` });
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Temporary {getTerm('plural', true)}</h1>
        <p className="text-muted-foreground">Unregistered visitors detected by the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Detected Visitors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {tempMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Visitors Detected</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Unrecognized faces will appear here when detected by the attendance system.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Appearances</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tempMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={getTempImage(member)} />
                              <AvatarFallback className="bg-muted">V</AvatarFallback>
                            </Avatar>
                            <span className="font-mono text-xs">{getTempId(member).slice(0, 12)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTempDate(member)}</TableCell>
                        <TableCell>{getTempTime(member)}</TableCell>
                        <TableCell>{getTempAppearances(member)}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'claimed' ? 'default' : 'secondary'}>
                            {member.status || 'unclaimed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.status !== 'claimed' && (
                            <Button size="sm" variant="outline" onClick={() => handleClaim(member)}>
                              Claim
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {tempMembers.map((member) => (
                  <div key={member.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={getTempImage(member)} />
                          <AvatarFallback className="bg-muted">V</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-mono text-xs">{getTempId(member).slice(0, 12)}...</p>
                          <p className="text-sm text-muted-foreground">{getTempDate(member)} at {getTempTime(member)}</p>
                        </div>
                      </div>
                      <Badge variant={member.status === 'claimed' ? 'default' : 'secondary'}>
                        {member.status || 'unclaimed'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Appearances: {getTempAppearances(member)}</span>
                      {member.status !== 'claimed' && (
                        <Button size="sm" variant="outline" onClick={() => handleClaim(member)}>
                          Claim
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ClaimVisitorModal
        isOpen={isClaimOpen}
        onClose={() => { setIsClaimOpen(false); setSelectedVisitor(null); }}
        visitor={selectedVisitor}
        onSuccess={handleClaimSuccess}
      />
    </div>
  );
};

export default TempMembersList;

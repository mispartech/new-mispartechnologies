import { Card, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useTerminology } from '@/contexts/TerminologyContext';

const TempMembersList = () => {
  const { getTerm } = useTerminology();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Temporary {getTerm('plural', true)}</h1>
        <p className="text-muted-foreground">Unregistered visitors detected by the system</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Visitor tracking is not yet available. Once the backend supports temporary attendance, unrecognized faces will appear here for registration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TempMembersList;

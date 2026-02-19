import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { djangoApi } from "@/lib/api/client";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportMembersModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
interface ParsedMember { email: string; firstName: string; lastName: string; phoneNumber: string; gender: string; department: string; isValid: boolean; error?: string; }
interface Department { id: string; name: string; }

export function ImportMembersModal({ isOpen, onClose, onSuccess }: ImportMembersModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedMembers, setParsedMembers] = useState<ParsedMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    const result = await djangoApi.getDepartments();
    if (!result.error && result.data) setDepartments(result.data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const validTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      toast({ title: "Invalid file type", description: "Please upload a CSV or Excel file", variant: "destructive" });
      return;
    }
    setFile(selectedFile);
    await fetchDepartments();
    await parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      if (lines.length < 2) { toast({ title: "Invalid file", description: "File must contain headers and at least one data row", variant: "destructive" }); setIsLoading(false); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const emailIndex = headers.findIndex(h => h.includes("email"));
      const firstNameIndex = headers.findIndex(h => (h.includes("first") && h.includes("name")) || h === "firstname");
      const lastNameIndex = headers.findIndex(h => (h.includes("last") && h.includes("name")) || h === "lastname");
      const phoneIndex = headers.findIndex(h => h.includes("phone"));
      const genderIndex = headers.findIndex(h => h.includes("gender") || h.includes("sex"));
      const deptIndex = headers.findIndex(h => h.includes("department") || h.includes("dept"));
      if (emailIndex === -1) { toast({ title: "Missing email column", description: "CSV must have an 'email' column", variant: "destructive" }); setIsLoading(false); return; }

      const members: ParsedMember[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const email = values[emailIndex]?.trim() || "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        members.push({
          email, firstName: firstNameIndex >= 0 ? values[firstNameIndex]?.trim() || "" : "",
          lastName: lastNameIndex >= 0 ? values[lastNameIndex]?.trim() || "" : "",
          phoneNumber: phoneIndex >= 0 ? values[phoneIndex]?.trim() || "" : "",
          gender: genderIndex >= 0 ? values[genderIndex]?.trim() || "" : "",
          department: deptIndex >= 0 ? values[deptIndex]?.trim() || "" : "",
          isValid, error: !isValid ? "Invalid email format" : undefined,
        });
      }
      setParsedMembers(members);
    } catch (error) {
      toast({ title: "Error parsing file", description: "Could not parse the uploaded file", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []; let current = ""; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === "," && !inQuotes) { result.push(current.replace(/^["']|["']$/g, '')); current = ""; }
      else current += char;
    }
    result.push(current.replace(/^["']|["']$/g, ''));
    return result;
  };

  const handleSendInvites = async () => {
    const validMembers = parsedMembers.filter(m => m.isValid);
    if (validMembers.length === 0) { toast({ title: "No valid members", description: "Please fix the errors before sending invites", variant: "destructive" }); return; }

    setIsSending(true);
    setSendProgress({ sent: 0, total: validMembers.length });

    try {
      // Use Django bulk invite endpoint
      const membersPayload = validMembers.map(member => {
        let departmentId = selectedDepartment || undefined;
        if (member.department && !departmentId) {
          const dept = departments.find(d => d.name.toLowerCase() === member.department.toLowerCase());
          departmentId = dept?.id;
        }
        return {
          email: member.email, first_name: member.firstName || undefined, last_name: member.lastName || undefined,
          phone_number: member.phoneNumber || undefined, gender: member.gender || undefined, department_id: departmentId,
        };
      });

      const result = await djangoApi.bulkInviteMembers({ members: membersPayload, organization_id: '' });

      if (result.error) throw new Error(result.error);

      const successCount = result.data?.success || 0;
      const failCount = result.data?.failed || 0;

      toast({ title: "Import complete", description: `${successCount} invites sent successfully${failCount > 0 ? `, ${failCount} failed` : ""}` });

      if (successCount > 0) { onSuccess(); handleReset(); }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send invitations", variant: "destructive" });
    }
    setIsSending(false);
  };

  const handleReset = () => { setFile(null); setParsedMembers([]); setSelectedDepartment(""); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleClose = () => { handleReset(); onClose(); };

  const validCount = parsedMembers.filter(m => m.isValid).length;
  const invalidCount = parsedMembers.filter(m => !m.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Import Members from CSV/Excel</DialogTitle></DialogHeader>
        <div className="space-y-6">
          {!file ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your file here or click to browse</p>
                <p className="text-sm text-muted-foreground">Supports CSV and Excel files</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
              <Alert><FileSpreadsheet className="h-4 w-4" /><AlertDescription><strong>Expected columns:</strong> email (required), first_name, last_name, phone_number, gender, department</AlertDescription></Alert>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3"><FileSpreadsheet className="h-8 w-8 text-primary" /><div><p className="font-medium">{file.name}</p><p className="text-sm text-muted-foreground">{parsedMembers.length} members found</p></div></div>
                <Button variant="ghost" size="icon" onClick={handleReset}><X className="h-4 w-4" /></Button>
              </div>
              {(validCount > 0 || invalidCount > 0) && <div className="flex gap-4">{validCount > 0 && <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /><span>{validCount} valid</span></div>}{invalidCount > 0 && <div className="flex items-center gap-2 text-destructive"><AlertCircle className="h-4 w-4" /><span>{invalidCount} invalid</span></div>}</div>}
              {departments.length > 0 && (
                <div className="space-y-2"><Label>Default Department (optional)</Label><Select value={selectedDepartment} onValueChange={setSelectedDepartment}><SelectTrigger className="w-[300px]"><SelectValue placeholder="Select default department" /></SelectTrigger><SelectContent><SelectItem value="">No default</SelectItem>{departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}</SelectContent></Select></div>
              )}
              {isLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                <div className="border rounded-lg overflow-hidden">
                  <Table><TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Email</TableHead><TableHead>First Name</TableHead><TableHead>Last Name</TableHead><TableHead>Phone</TableHead><TableHead>Gender</TableHead><TableHead>Department</TableHead></TableRow></TableHeader>
                    <TableBody>{parsedMembers.slice(0, 10).map((member, idx) => (<TableRow key={idx} className={!member.isValid ? "bg-destructive/10" : ""}><TableCell>{member.isValid ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span title={member.error}><AlertCircle className="h-4 w-4 text-destructive" /></span>}</TableCell><TableCell className="font-mono text-sm">{member.email}</TableCell><TableCell>{member.firstName || "-"}</TableCell><TableCell>{member.lastName || "-"}</TableCell><TableCell>{member.phoneNumber || "-"}</TableCell><TableCell>{member.gender || "-"}</TableCell><TableCell>{member.department || "-"}</TableCell></TableRow>))}</TableBody>
                  </Table>
                  {parsedMembers.length > 10 && <div className="p-3 text-center text-sm text-muted-foreground bg-muted">Showing first 10 of {parsedMembers.length} members</div>}
                </div>
              )}
            </>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            {file && <Button onClick={handleSendInvites} disabled={isSending || validCount === 0}>{isSending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending {sendProgress.sent}/{sendProgress.total}...</>) : `Send ${validCount} Invitation${validCount !== 1 ? 's' : ''}`}</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

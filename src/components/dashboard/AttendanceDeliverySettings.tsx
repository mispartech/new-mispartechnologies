import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, MessageCircle, Send, AlertCircle, Info } from 'lucide-react';

type DeliveryChannel = 'email' | 'whatsapp' | 'both';

interface AttendanceDeliverySettingsProps {
  enabled: boolean;
  channel: DeliveryChannel;
  memberCount: number;
  currentPlan?: 'starter' | 'pro' | 'business';
  onToggle: (enabled: boolean) => void;
  onChannelChange: (channel: DeliveryChannel) => void;
}

const WHATSAPP_COST_PER_MEMBER = 20; // ₦20/member/month

const AttendanceDeliverySettings = ({
  enabled,
  channel,
  memberCount,
  currentPlan = 'starter',
  onToggle,
  onChannelChange,
}: AttendanceDeliverySettingsProps) => {
  const whatsappAvailable = currentPlan === 'pro' || currentPlan === 'business';
  const whatsappCost = memberCount * WHATSAPP_COST_PER_MEMBER;
  const includedWhatsappMembers = currentPlan === 'business' ? 500 : 0;
  const billableMembers = Math.max(0, memberCount - includedWhatsappMembers);
  const effectiveCost = currentPlan === 'business' ? billableMembers * WHATSAPP_COST_PER_MEMBER : whatsappCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Attendance Record Delivery
        </CardTitle>
        <CardDescription>
          Configure how members receive their monthly attendance records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="delivery-toggle" className="font-medium">
              Send Monthly Attendance Records
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically send attendance summaries to all members at the end of each month
            </p>
          </div>
          <Switch
            id="delivery-toggle"
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>

        {enabled && (
          <>
            {/* Channel selection */}
            <div className="space-y-3">
              <Label className="font-medium">Delivery Channel</Label>
              <RadioGroup
                value={channel}
                onValueChange={(val) => onChannelChange(val as DeliveryChannel)}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <RadioGroupItem value="email" id="channel-email" />
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="channel-email" className="font-medium cursor-pointer">
                      Email Only
                    </Label>
                    <p className="text-xs text-muted-foreground">Free — included in all plans</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">Free</Badge>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${!whatsappAvailable ? 'opacity-50' : 'bg-muted/30'}`}>
                  <RadioGroupItem value="whatsapp" id="channel-whatsapp" disabled={!whatsappAvailable} />
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <Label htmlFor="channel-whatsapp" className={`font-medium ${!whatsappAvailable ? '' : 'cursor-pointer'}`}>
                      WhatsApp Only
                    </Label>
                    <p className="text-xs text-muted-foreground">₦20/member/month add-on</p>
                  </div>
                  {!whatsappAvailable && (
                    <Badge variant="outline" className="text-xs">Pro+ Only</Badge>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${!whatsappAvailable ? 'opacity-50' : 'bg-muted/30'}`}>
                  <RadioGroupItem value="both" id="channel-both" disabled={!whatsappAvailable} />
                  <div className="flex gap-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <MessageCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="channel-both" className={`font-medium ${!whatsappAvailable ? '' : 'cursor-pointer'}`}>
                      Both Email & WhatsApp
                    </Label>
                    <p className="text-xs text-muted-foreground">Members receive records via both channels</p>
                  </div>
                  {!whatsappAvailable && (
                    <Badge variant="outline" className="text-xs">Pro+ Only</Badge>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* WhatsApp cost info */}
            {(channel === 'whatsapp' || channel === 'both') && whatsappAvailable && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">WhatsApp Messaging Cost</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Rate: ₦{WHATSAPP_COST_PER_MEMBER}/member/month</p>
                  <p>Your members: {memberCount}</p>
                  {currentPlan === 'business' && includedWhatsappMembers > 0 && (
                    <p>Included free: {includedWhatsappMembers} members</p>
                  )}
                  <p className="font-semibold text-foreground">
                    Estimated cost: ₦{effectiveCost.toLocaleString()}/month
                  </p>
                </div>
              </div>
            )}

            {/* Plan upgrade nudge */}
            {!whatsappAvailable && (channel === 'email') && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Want WhatsApp delivery?</p>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to Pro or Business plan to send attendance records via WhatsApp.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceDeliverySettings;

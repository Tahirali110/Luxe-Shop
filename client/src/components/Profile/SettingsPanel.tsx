import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  MessageSquare,
  Shield,
  Lock,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { fadeUp } from '@/utils/animations';

// Mock login history
const mockLoginHistory = [
  {
    id: 1,
    device: 'Chrome on MacOS',
    location: 'New York, USA',
    time: '2 hours ago',
    status: 'success',
    icon: Monitor,
  },
  {
    id: 2,
    device: 'Safari on iPhone',
    location: 'New York, USA',
    time: '1 day ago',
    status: 'success',
    icon: Smartphone,
  },
  {
    id: 3,
    device: 'Firefox on Windows',
    location: 'Los Angeles, USA',
    time: '3 days ago',
    status: 'success',
    icon: Monitor,
  },
  {
    id: 4,
    device: 'Unknown Browser',
    location: 'Unknown Location',
    time: '5 days ago',
    status: 'failed',
    icon: Monitor,
  },
];

export const SettingsPanel = () => {
  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(
      twoFactorEnabled ? 'Two-Factor Authentication disabled' : 'Two-Factor Authentication enabled',
      { description: twoFactorEnabled ? 'Your account is now less secure' : 'Your account is now more secure' }
    );
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Mock password change
    toast.success('Password changed successfully');
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      {/* Notification Settings */}
      <div className="p-6 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-muted-foreground" />
              <div>
                <span className="font-medium">Email Notifications</span>
                <p className="text-xs text-muted-foreground">Receive order updates via email</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-muted-foreground" />
              <div>
                <span className="font-medium">SMS Notifications</span>
                <p className="text-xs text-muted-foreground">Get text messages for shipping updates</p>
              </div>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-muted-foreground" />
              <div>
                <span className="font-medium">Newsletter</span>
                <p className="text-xs text-muted-foreground">Weekly deals and new arrivals</p>
              </div>
            </div>
            <Switch
              checked={newsletterSubscribed}
              onCheckedChange={setNewsletterSubscribed}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="p-6 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Protect your account</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-muted-foreground" />
              <div>
                <span className="font-medium">Two-Factor Authentication</span>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleToggle2FA}
            />
          </div>

          {/* Change Password */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-muted-foreground" />
                <div>
                  <span className="font-medium">Change Password</span>
                  <p className="text-xs text-muted-foreground">Update your password regularly</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? 'Cancel' : 'Change'}
              </Button>
            </div>

            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-secondary/50 rounded-xl space-y-4"
              >
                {/* Hidden dummy fields to prevent browser autofill */}
                <input type="text" autoComplete="username" style={{ display: 'none' }} />
                <input type="password" autoComplete="new-password" style={{ display: 'none' }} />
                <div className="grid gap-2">
                  <Label htmlFor="currentPwd">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPwd"
                      type={showCurrentPwd ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPwd">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPwd"
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPwd">Confirm New Password</Label>
                  <Input
                    id="confirmPwd"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={handleChangePassword} className="w-full">
                  Update Password
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="p-6 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Login History</h3>
            <p className="text-sm text-muted-foreground">Recent account activity</p>
          </div>
        </div>

        <div className="space-y-3">
          {mockLoginHistory.map((login) => (
            <div
              key={login.id}
              className={`flex items-center gap-4 p-4 rounded-xl ${login.status === 'failed' ? 'bg-destructive/10' : 'bg-secondary/50'
                }`}
            >
              <login.icon size={20} className="text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{login.device}</span>
                  {login.status === 'success' ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <XCircle size={14} className="text-destructive" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  <span>{login.location}</span>
                  <span>•</span>
                  <span>{login.time}</span>
                </div>
              </div>
              {login.status === 'failed' && (
                <span className="text-xs text-destructive font-medium">Failed</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

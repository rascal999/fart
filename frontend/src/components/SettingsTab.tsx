import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import settingsService from '../services/settingsService';
import { Settings } from '../services/types';

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    proxy_port: 8080,
    ui_port: 3000,
    debug_level: 'INFO',
    enable_filtering: false,
    filter_rules: [],
    upstream_proxy_enabled: false,
    upstream_proxy_host: null,
    upstream_proxy_port: null,
    upstream_proxy_auth: false,
    upstream_proxy_username: null,
    upstream_proxy_password: null
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      setSettings(response.data);
    } catch (err) {
      setError('Failed to fetch settings');
    }
  };

  const handleChange = (field: keyof Settings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : field === 'proxy_port' || field === 'ui_port' || field === 'upstream_proxy_port'
        ? parseInt(event.target.value, 10) || null
        : event.target.value;
    
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterRulesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rules = event.target.value.split('\n').filter(rule => rule.trim());
    setSettings(prev => ({
      ...prev,
      filter_rules: rules
    }));
  };

  const handleSave = async () => {
    try {
      await settingsService.updateSettings(settings);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Proxy Settings
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Proxy Port"
              type="number"
              value={settings.proxy_port}
              onChange={handleChange('proxy_port')}
              fullWidth
              inputProps={{ min: 1024, max: 65535 }}
              helperText="Port number between 1024 and 65535"
            />
            
            <TextField
              label="UI Port"
              type="number"
              value={settings.ui_port}
              onChange={handleChange('ui_port')}
              fullWidth
              inputProps={{ min: 1024, max: 65535 }}
              helperText="Port number between 1024 and 65535"
            />
            
            <TextField
              label="Debug Level"
              select
              value={settings.debug_level}
              onChange={handleChange('debug_level')}
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enable_filtering}
                  onChange={handleChange('enable_filtering')}
                />
              }
              label="Enable Request Filtering"
            />
            
            {settings.enable_filtering && (
              <TextField
                label="Filter Rules"
                multiline
                rows={4}
                value={settings.filter_rules.join('\n')}
                onChange={handleFilterRulesChange}
                fullWidth
                placeholder="Enter filter rules (one per line)"
                helperText="Example: *.google.com, *.facebook.com"
              />
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Upstream Proxy Settings
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.upstream_proxy_enabled}
                  onChange={handleChange('upstream_proxy_enabled')}
                />
              }
              label="Enable Upstream Proxy"
            />

            {settings.upstream_proxy_enabled && (
              <>
                <TextField
                  label="Upstream Proxy Host"
                  value={settings.upstream_proxy_host || ''}
                  onChange={handleChange('upstream_proxy_host')}
                  fullWidth
                  placeholder="e.g., localhost"
                  helperText="The proxy server to forward requests to"
                />

                <TextField
                  label="Upstream Proxy Port"
                  type="number"
                  value={settings.upstream_proxy_port || ''}
                  onChange={handleChange('upstream_proxy_port')}
                  fullWidth
                  inputProps={{ min: 1, max: 65535 }}
                  helperText="Port of the upstream proxy server"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.upstream_proxy_auth}
                      onChange={handleChange('upstream_proxy_auth')}
                    />
                  }
                  label="Enable Proxy Authentication"
                />

                {settings.upstream_proxy_auth && (
                  <>
                    <TextField
                      label="Username"
                      value={settings.upstream_proxy_username || ''}
                      onChange={handleChange('upstream_proxy_username')}
                      fullWidth
                    />

                    <TextField
                      label="Password"
                      type="password"
                      value={settings.upstream_proxy_password || ''}
                      onChange={handleChange('upstream_proxy_password')}
                      fullWidth
                    />
                  </>
                )}
              </>
            )}
            
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Settings
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsTab;

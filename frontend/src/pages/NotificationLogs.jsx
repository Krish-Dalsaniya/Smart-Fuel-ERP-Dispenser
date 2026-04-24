import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { format } from 'date-fns';

export default function NotificationLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['notification-logs'],
    queryFn: () => api.get('/notifications/logs').then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Notification Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor delivery status of all system alerts</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Timestamp</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Recipient</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Channel</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Type</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800">Message</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-800 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 animate-pulse">Fetching logs...</td></tr>
              ) : logs?.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">No notification history found.</td></tr>
              ) : (
                logs?.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-300">{format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-white font-medium">{log.user?.name || 'System'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{log.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${log.channel === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs text-slate-400 capitalize">{log.type.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-500 line-clamp-2" title={log.message}>{log.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

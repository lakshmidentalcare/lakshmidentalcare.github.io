import { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
}

// PatientSelect removed in favor of generic SearchableSelect

export default function AppointmentModal({ isOpen, onClose, appointment }: AppointmentModalProps) {
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/patients');
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/doctors');
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    startTime: '',
    duration: 30,
    type: 'REGULAR',
    status: 'SCHEDULED'
  });

  useEffect(() => {
    if (appointment) {
      // For datetime-local input, format needs to be YYYY-MM-DDThh:mm
      const start = new Date(appointment.startTime);
      // Adjust for timezone offset for local viewing
      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(start.getTime() - tzOffset)).toISOString().slice(0, 16);
      
      setFormData({
        patientId: appointment.patientId || '',
        doctorId: appointment.doctorId || '',
        startTime: localISOTime,
        duration: appointment.duration || 30,
        type: appointment.type || 'REGULAR',
        status: appointment.status || 'SCHEDULED'
      });
    } else {
      setFormData({
        patientId: '',
        doctorId: '',
        startTime: '',
        duration: 30,
        type: 'REGULAR',
        status: 'SCHEDULED'
      });
    }
  }, [appointment, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert local time back to UTC for saving
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(new Date(data.startTime).getTime() + data.duration * 60000).toISOString(),
      };
      
      if (appointment) {
        return apiClient.put(`/appointments/${appointment.id}`, payload);
      } else {
        return apiClient.post('/appointments', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }); // Update live queue
      onClose();
    }
  });

  if (!isOpen) return null;

  const patientList = Array.isArray(patients) ? patients : (patients as any)?.patients || [];
  const doctorList = Array.isArray(doctors) ? doctors : (doctors as any)?.doctors || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0726]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="elite-card bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[#73308A]/20">
        <div className="flex items-center justify-between p-5 border-b border-[#73308A]/10 bg-[#FAF6FB]/70">
          <h2 className="text-base font-extrabold text-slate-900">
            {appointment ? 'Edit Appointment' : 'Book Appointment'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Patient</label>
            <SearchableSelect 
              value={formData.patientId}
              onChange={(val) => setFormData({...formData, patientId: val})}
              disabled={!!appointment}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold text-slate-800"
              options={patientList.map((p: any) => ({ value: String(p.id), label: `${p.name} (${p.patientCode || p.phone})` }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Assigned Doctor</label>
            <SearchableSelect 
              value={formData.doctorId}
              onChange={(val) => setFormData({...formData, doctorId: val})}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold text-slate-800"
              options={doctorList.map((d: any) => ({ value: String(d.id), label: `${d.name} (${d.specialization || 'Dentist'})` }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Start Time</label>
            <input 
              type="datetime-local" 
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Duration (mins)</label>
              <input 
                type="number" 
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                step="15"
                min="15"
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Appointment Type</label>
              <SearchableSelect 
                value={formData.type}
                onChange={(val) => setFormData({...formData, type: val})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
                options={[
                  { value: "REGULAR", label: "Regular Consultation" },
                  { value: "ROOT_CANAL", label: "Root Canal Treatment" },
                  { value: "EXTRACTION", label: "Tooth Extraction" },
                  { value: "CLEANING", label: "Scaling & Polishing" },
                  { value: "BRACES", label: "Orthodontic Adjustment" },
                  { value: "EMERGENCY", label: "Emergency Care" }
                ]}
              />
            </div>
          </div>

          {appointment && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
              <SearchableSelect 
                value={formData.status}
                onChange={(val) => setFormData({...formData, status: val})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
                options={[
                  { value: "SCHEDULED", label: "Scheduled" },
                  { value: "WAITING", label: "Waiting Room" },
                  { value: "IN_PROGRESS", label: "In Progress (Chair)" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "CANCELLED", label: "Cancelled" }
                ]}
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#73308A]/10 bg-[#FAF6FB]/70 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending || !formData.patientId || !formData.startTime}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] disabled:opacity-50 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 active:scale-95"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}

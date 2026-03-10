import { useState } from 'react';
import { PlusCircle, Trash2, Edit3, HardHat, MapPin, Calendar, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BuildPhase } from '../types';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { SelectField } from '../components/ui/SelectField';

const PHASES: { value: BuildPhase; label: string }[] = [
  { value: 'pre-construction', label: 'Pre-Construction' },
  { value: 'site-prep',        label: 'Site Prep & Excavation' },
  { value: 'foundation',       label: 'Foundation' },
  { value: 'framing',          label: 'Rough Framing' },
  { value: 'rough-mep',        label: 'Rough MEP' },
  { value: 'insulation',       label: 'Insulation & Air Barrier' },
  { value: 'drywall',          label: 'Drywall & Finishes' },
  { value: 'finish-work',      label: 'Finish Work' },
  { value: 'final-inspection', label: 'Final Inspection' },
  { value: 'complete',         label: 'Complete' },
];

const PHASE_COLORS: Record<BuildPhase, string> = {
  'pre-construction': 'bg-blue-100 text-blue-700',
  'site-prep':        'bg-yellow-100 text-yellow-700',
  'foundation':       'bg-slate-200 text-slate-700',
  'framing':          'bg-orange-100 text-orange-700',
  'rough-mep':        'bg-purple-100 text-purple-700',
  'insulation':       'bg-green-100 text-green-700',
  'drywall':          'bg-teal-100 text-teal-700',
  'finish-work':      'bg-pink-100 text-pink-700',
  'final-inspection': 'bg-amber-100 text-amber-700',
  'complete':         'bg-emerald-100 text-emerald-700',
};

const emptyForm = {
  name: '', address: '', client: '', startDate: '', estimatedEnd: '',
  phase: 'pre-construction' as BuildPhase, sqft: 0, stories: 1, notes: '',
};

interface ProjectFormProps {
  initial?: typeof emptyForm;
  onSave: (data: typeof emptyForm) => void;
  onCancel: () => void;
  title: string;
}

function ProjectForm({ initial = emptyForm, onSave, onCancel, title }: ProjectFormProps) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof emptyForm) => (v: string) =>
    setForm(f => ({ ...f, [k]: k === 'sqft' || k === 'stories' ? Number(v) : v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-semibold text-lg text-slate-800">{title}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputField label="Project Name" type="text" value={form.name}
                onChange={set('name')} placeholder="123 Main St Residential Build" required />
            </div>
            <div className="sm:col-span-2">
              <InputField label="Address / Job Site" type="text" value={form.address}
                onChange={set('address')} placeholder="123 Main Street, City, State" />
            </div>
            <InputField label="Client / Owner" type="text" value={form.client}
              onChange={set('client')} placeholder="John Smith" />
            <SelectField label="Current Phase" value={form.phase}
              onChange={v => setForm(f => ({ ...f, phase: v as BuildPhase }))} options={PHASES} />
            <InputField label="Start Date" type="text" value={form.startDate}
              onChange={set('startDate')} placeholder="2026-03-01" />
            <InputField label="Est. Completion" type="text" value={form.estimatedEnd}
              onChange={set('estimatedEnd')} placeholder="2026-09-01" />
            <InputField label="Square Footage" value={form.sqft || ''}
              onChange={set('sqft')} unit="SF" min={0} step={1} />
            <SelectField label="Stories" value={form.stories} onChange={set('stories')}
              options={[
                { value: 1, label: '1 Story' },
                { value: 2, label: '2 Stories' },
                { value: 3, label: '3 Stories' },
              ]} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Contract details, special requirements, contacts, etc."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-200">
          <Button variant="outline" onClick={onCancel} fullWidth>Cancel</Button>
          <Button onClick={() => { if (form.name) onSave(form); }} fullWidth
            disabled={!form.name}>
            <Check size={16} /> Save Project
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const { projects, addProject, updateProject, deleteProject, activeProjectId, setActiveProjectId } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editProject = projects.find(p => p.id === editingId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total ·{' '}
            {projects.filter(p => p.phase !== 'complete').length} active
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<PlusCircle size={16} />}>
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <HardHat size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-600 font-medium mb-2">No projects yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Create your first project to track progress through every build phase.
          </p>
          <Button onClick={() => setShowForm(true)} icon={<PlusCircle size={16} />}>
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <div
              key={p.id}
              className={`bg-white rounded-xl border-2 transition-all cursor-pointer
                ${activeProjectId === p.id
                  ? 'border-amber-400 shadow-md'
                  : 'border-slate-200 hover:border-amber-200 hover:shadow-sm'
                }`}
              onClick={() => setActiveProjectId(p.id === activeProjectId ? null : p.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <HardHat size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm leading-tight">{p.name}</h3>
                      {p.sqft > 0 && (
                        <span className="text-xs text-slate-400">{p.sqft.toLocaleString()} SF</span>
                      )}
                    </div>
                  </div>
                  {activeProjectId === p.id && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Active</span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  {p.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="flex-shrink-0" /> {p.address}
                    </div>
                  )}
                  {p.client && (
                    <div className="flex items-center gap-1.5">
                      <span>👤</span> {p.client}
                    </div>
                  )}
                  {p.startDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="flex-shrink-0" />
                      {p.startDate}{p.estimatedEnd ? ` → ${p.estimatedEnd}` : ''}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                    ${PHASE_COLORS[p.phase]}`}>
                    {p.phase.replace(/-/g, ' ')}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); setEditingId(p.id); }}
                      className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit project"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeletingId(p.id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {p.notes && (
                  <p className="mt-2 text-xs text-slate-400 italic line-clamp-2">{p.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New project form */}
      {showForm && (
        <ProjectForm
          title="New Project"
          onSave={data => { addProject(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit form */}
      {editingId && editProject && (
        <ProjectForm
          title="Edit Project"
          initial={{
            name: editProject.name,
            address: editProject.address,
            client: editProject.client,
            startDate: editProject.startDate,
            estimatedEnd: editProject.estimatedEnd,
            phase: editProject.phase,
            sqft: editProject.sqft,
            stories: editProject.stories,
            notes: editProject.notes,
          }}
          onSave={data => {
            updateProject(editingId, data);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Delete Project?</h3>
                <p className="text-sm text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="danger" fullWidth onClick={() => {
                deleteProject(deletingId);
                setDeletingId(null);
              }}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

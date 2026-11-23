import React, { useState } from 'react';
import { Layers, Plus, Play } from 'lucide-react';

export default function StorySidebar({ stories, currentStory, onSelectStory, onAddStory }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAddStory({ title, description, acceptanceCriteria });
    setTitle('');
    setDescription('');
    setAcceptanceCriteria('');
    setShowForm(false);
  };

  return (
    <div className="col-span-3 bg-slate-900/60 border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>User Stories ({stories.length})</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
          title="Thêm User Story"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-3 bg-slate-800/80 border-b border-slate-700 space-y-2">
          <input
            type="text"
            placeholder="Tiêu đề User Story..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg"
            required
          />
          <textarea
            placeholder="Mô tả kỹ thuật..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg"
          />
          <textarea
            placeholder="Acceptance Criteria..."
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            rows={2}
            className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg"
          />
          <button
            type="submit"
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-sm font-medium rounded-lg cursor-pointer"
          >
            Lưu Story
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {stories.map((st) => {
          const active = currentStory?.id === st.id;
          return (
            <div
              key={st.id}
              onClick={() => onSelectStory(st.id)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                active
                  ? 'bg-indigo-600/20 border-indigo-500'
                  : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium leading-snug">{st.title}</h3>
                {st.finalPoints != null && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full shrink-0">
                    {st.finalPoints} SP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{st.description}</p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-400">
                <Play className="w-3 h-3" /> Bấm để đưa lên bàn vote
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
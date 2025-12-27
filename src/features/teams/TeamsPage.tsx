import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { Users, Plus, Edit, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Modal } from '../../components/ui/Modal';
import type { Team } from '../../types';

export const TeamsPage = () => {
    const { teams, users, addTeam, updateTeam, deleteTeam } = useStore();
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Edit Form State
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editMembers, setEditMembers] = useState<string[]>([]);

    const handleCreateTeam = () => {
        const name = window.prompt("Enter Team Name:");
        if (name) {
            const desc = window.prompt("Enter Description (optional):") || "";
            addTeam({
                id: `t-${Date.now()}`,
                name,
                description: desc,
                memberIds: []
            });
        }
    };

    const handleEditClick = (team: Team) => {
        setSelectedTeam(team);
        setEditName(team.name);
        setEditDesc(team.description || '');
        setEditMembers(team.memberIds || []);
        setIsEditMode(true);
    };

    const handleSaveEdit = () => {
        if (selectedTeam) {
            updateTeam(selectedTeam.id, {
                name: editName,
                description: editDesc,
                memberIds: editMembers
            });
            setIsEditMode(false);
            setSelectedTeam(null);
        }
    };

    const toggleMember = (userId: string) => {
        if (editMembers.includes(userId)) {
            setEditMembers(editMembers.filter(id => id !== userId));
        } else {
            setEditMembers([...editMembers, userId]);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Teams & Technicians
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-11">Manage maintenance teams and assignments</p>
                </div>
                <button
                    onClick={handleCreateTeam}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Team
                </button>
            </div>

            {/* Detailed Grid View */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <motion.div
                            layout
                            key={team.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(team)}
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1">{team.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{team.description || "No description provided."}</p>

                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {team.memberIds.map(mid => {
                                                const user = users.find(u => u.id === mid);
                                                return (
                                                    <div key={mid} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden" title={user?.name}>
                                                        {user?.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-600">{mid.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {team.memberIds.length === 0 && <span className="text-xs text-slate-400 italic">No members</span>}
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">{team.memberIds.length} Members</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Edit Team Modal */}
            <Modal isOpen={isEditMode} onClose={() => setIsEditMode(false)} title="Edit Team">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Team Members</label>
                        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                            {users.map(user => {
                                const isSelected = editMembers.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleMember(user.id)}
                                        className={clsx(
                                            "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                                            isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                            isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                                        )}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>
                                        <img src={user.avatar} className="w-8 h-8 rounded-full bg-slate-200" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => {
                                if (confirm('Delete this team?')) {
                                    if (selectedTeam) deleteTeam(selectedTeam.id);
                                    setIsEditMode(false);
                                }
                            }}
                            className="flex-1 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                        >
                            Delete Team
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            className="flex-[2] px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

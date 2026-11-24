/**
 * PeopleSection - Assign people to tasks
 * Uses localStorage to persist added people for quick selection
 */

import React, { useState, useEffect } from "react";
import { XIcon } from "../icons";

interface PeopleSectionProps {
  assignedPeople: string[];
  onPeopleChange: (people: string[]) => void;
}

const STORAGE_KEY = "rotti_saved_people";

// Get saved people from localStorage
const getSavedPeople = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save people to localStorage
const savePeopleToStorage = (people: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  } catch {
    console.error("Failed to save people to storage");
  }
};

export const PeopleSection: React.FC<PeopleSectionProps> = ({
  assignedPeople,
  onPeopleChange,
}) => {
  const [savedPeople, setSavedPeople] = useState<string[]>(getSavedPeople);
  const [newPerson, setNewPerson] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);

  // Sync savedPeople to localStorage
  useEffect(() => {
    savePeopleToStorage(savedPeople);
  }, [savedPeople]);

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPerson.trim();
    if (!name) return;

    // Add to saved people if not exists
    if (!savedPeople.includes(name)) {
      setSavedPeople([...savedPeople, name]);
    }

    // Add to assigned people if not already assigned
    if (!assignedPeople.includes(name)) {
      onPeopleChange([...assignedPeople, name]);
    }

    setNewPerson("");
    setShowAddNew(false);
  };

  const handleTogglePerson = (name: string) => {
    if (assignedPeople.includes(name)) {
      onPeopleChange(assignedPeople.filter((p) => p !== name));
    } else {
      onPeopleChange([...assignedPeople, name]);
    }
  };

  const handleRemoveSavedPerson = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPeople(savedPeople.filter((p) => p !== name));
    onPeopleChange(assignedPeople.filter((p) => p !== name));
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <span className="text-base">👥</span>
          <span>People</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAddNew(!showAddNew)}
          className="text-xs text-brand-light hover:text-indigo-300 transition-colors"
        >
          + Add Person
        </button>
      </div>

      {/* Add new person form */}
      {showAddNew && (
        <form onSubmit={handleAddPerson} className="flex gap-2 animate-fade-in">
          <input
            type="text"
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            placeholder="Enter name..."
            autoFocus
            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="submit"
            disabled={!newPerson.trim()}
            className="px-4 py-2 bg-brand hover:bg-brand-dark disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Add
          </button>
        </form>
      )}

      {/* Saved people chips */}
      {savedPeople.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {savedPeople.map((person) => {
            const isAssigned = assignedPeople.includes(person);
            return (
              <button
                key={person}
                type="button"
                onClick={() => handleTogglePerson(person)}
                className={`
                                    group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                                    transition-all duration-200 border
                                    ${
                                      isAssigned
                                        ? "bg-brand/20 border-brand/50 text-indigo-300"
                                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                                    }
                                `}
              >
                <span className="text-xs">👤</span>
                {person}
                {isAssigned && <span className="text-brand-light">✓</span>}
                <button
                  type="button"
                  onClick={(e) => handleRemoveSavedPerson(person, e)}
                  className="ml-1 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-slate-600 rounded-full transition-all"
                  title="Remove from saved"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-600">
          No people added yet. Click "+ Add Person" to create contacts.
        </p>
      )}

      {/* Currently assigned summary */}
      {assignedPeople.length > 0 && (
        <div className="text-xs text-slate-500">
          Assigned: {assignedPeople.join(", ")}
        </div>
      )}

      <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
};

export default PeopleSection;

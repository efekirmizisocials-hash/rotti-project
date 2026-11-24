/**
 * CategorySection - Category, Project, and Tags selectors
 * Theme-aware: works in both light and dark mode
 */

import React, { useState, useRef, useEffect } from "react";
import { FolderIcon, TagIcon, XIcon } from "../icons";
import { Category, Project, Tag, TagType } from "../../types";
import { categoryColors } from "./animations";
import { parseTagFromString } from "../../utils/helpers";

interface CategorySectionProps {
  category: Category;
  projectId: string | null;
  tags: Tag[];
  projects: Project[];
  onCategoryChange: (category: Category) => void;
  onProjectChange: (projectId: string | null) => void;
  onTagsChange: (tags: Tag[]) => void;
}

const categoryOptions = Object.values(Category);

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  projectId,
  tags,
  projects,
  onCategoryChange,
  onProjectChange,
  onTagsChange,
}) => {
  const [tagInput, setTagInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        projectRef.current &&
        !projectRef.current.contains(e.target as Node)
      ) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;

    const newTag = parseTagFromString(tagInput.trim());
    if (
      !tags.some((t) => t.label.toLowerCase() === newTag.label.toLowerCase())
    ) {
      onTagsChange([...tags, newTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (label: string) => {
    onTagsChange(tags.filter((t) => t.label !== label));
  };

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
        <FolderIcon className="h-4 w-4" />
        <span>Organize</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category dropdown */}
        <div ref={categoryRef} className="relative">
          <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1.5">
            Category
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categoryColors[category] }}
            />
            <span className="flex-1 text-left">{category}</span>
            <svg
              className="w-4 h-4 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 animate-panel-fade-in">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onCategoryChange(cat);
                    setShowCategoryDropdown(false);
                  }}
                  className={`
                                        w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                        ${
                                          category === cat
                                            ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-indigo-300"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        }
                                    `}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[cat] }}
                  />
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project dropdown */}
        <div ref={projectRef} className="relative">
          <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1.5">
            Project
          </label>
          <button
            type="button"
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            {selectedProject ? (
              <>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <span className="flex-1 text-left truncate">
                  {selectedProject.name}
                </span>
              </>
            ) : (
              <>
                <FolderIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="flex-1 text-left text-slate-400 dark:text-slate-500">
                  No project
                </span>
              </>
            )}
            <svg
              className="w-4 h-4 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showProjectDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 max-h-48 overflow-y-auto animate-panel-fade-in">
              <button
                type="button"
                onClick={() => {
                  onProjectChange(null);
                  setShowProjectDropdown(false);
                }}
                className={`
                                    w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                    ${!projectId ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-indigo-300" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}
                                `}
              >
                <FolderIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                No project
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onProjectChange(project.id);
                    setShowProjectDropdown(false);
                  }}
                  className={`
                                        w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                        ${
                                          projectId === project.id
                                            ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-indigo-300"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        }
                                    `}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tags input */}
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1.5">
          <TagIcon className="w-3 h-3 inline mr-1" />
          Tags
        </label>

        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl min-h-[44px]">
          {/* Existing tags */}
          {tags.map((tag) => (
            <span
              key={tag.label}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-200/70 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-600/50"
            >
              {tag.type === "person" ? "@" : "#"}
              {tag.label}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.label)}
                className="ml-0.5 p-0.5 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full transition-colors"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Tag input */}
          <form onSubmit={handleAddTag} className="flex-1 min-w-[100px]">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag..."
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
          Use @ for people, # for tags
        </p>
      </div>
    </div>
  );
};

export default CategorySection;

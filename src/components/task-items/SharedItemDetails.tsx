import React from "react";
import {
  PlannerItem,
  Project,
  Tag,
  TagType,
  Category,
  ItemHandlers,
} from "../../types";
import { useLocalization } from "../../contexts/LocalizationContext";
import { tagClasses } from "./constants";
import { XIcon } from "../icons";

// Import additional icons and types
import { UserIcon, MapPinIcon, BoltIcon } from "../icons";
import { EnergyLevel } from "../../types";

interface SharedItemDetailsProps {
  item: PlannerItem;
  project: Project | null;
  projects: Project[];
  itemHandlers: ItemHandlers;
  newTag: string;
  setNewTag: (tag: string) => void;
  editingField: keyof PlannerItem | null;
  setEditingField: (field: keyof PlannerItem | null) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLSelectElement | null>;
}

const SharedItemDetails: React.FC<SharedItemDetailsProps> = ({
  item,
  project,
  projects,
  itemHandlers,
  newTag,
  setNewTag,
  editingField,
  setEditingField,
  inputRef,
}) => {
  const { t } = useLocalization();

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    if (trimmedTag && !(item.tags ?? []).some((t) => t.label === trimmedTag)) {
      itemHandlers.handleAddItemTag(item.id, trimmedTag);
    }
    setNewTag("");
  };

  // Simple handler to update assigned people (just adding string names for now)
  const handleAddPerson = () => {
    const name = prompt("Enter person's name:");
    if (name && !(item.assignedPeople ?? []).includes(name)) {
      const newPeople = [...(item.assignedPeople ?? []), name];
      itemHandlers.handleUpdateItem(item.id, { assignedPeople: newPeople });
    }
  };

  const handleRemovePerson = (name: string) => {
    const newPeople = (item.assignedPeople ?? []).filter((p) => p !== name);
    itemHandlers.handleUpdateItem(item.id, { assignedPeople: newPeople });
  };

  // Location editing
  const handleLocationChange = (val: string) => {
    itemHandlers.handleUpdateItem(item.id, { location: val });
    setEditingField(null);
  };

  const renderTag = (tag: Tag) => {
    const { bg, text, icon: Icon } = tagClasses[tag.type];
    const displayLabel = tag.label.replace(/-/g, " ");
    return (
      <span
        key={tag.label}
        className={`flex items-center gap-1.5 ${bg} ${text} text-xs font-medium px-2.5 py-1 rounded-full border border-white/20 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}
      >
        {tag.type !== TagType.STANDARD && <Icon className="h-3.5 w-3.5" />}
        <span className="capitalize">{displayLabel}</span>
        <button
          onClick={() => itemHandlers.handleRemoveItemTag(item.id, tag.label)}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <XIcon className="h-3 w-3" />
        </button>
      </span>
    );
  };

  return (
    <>
      <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 flex-wrap">
        <div className="relative">
          <select
            value={item.projectId || ""}
            onChange={(e) =>
              itemHandlers.handleSetItemProject(item.id, e.target.value || null)
            }
            className="appearance-none bg-transparent text-xs font-bold px-3 py-1 rounded-full border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-md backdrop-blur-sm"
            style={
              project
                ? {
                    backgroundColor: `${project.color}25`,
                    color: `${project.color}`,
                    borderColor: `${project.color}40`,
                  }
                : {
                    backgroundColor: "rgba(241, 245, 249, 0.8)",
                    color: "#475569",
                  }
            }
          >
            <option value="">{t("taskItem.noProject")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {editingField === "category" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={item.category}
            onChange={(e) => {
              itemHandlers.handleUpdateItem(item.id, {
                category: e.target.value as Category,
              });
              setEditingField(null);
            }}
            onBlur={() => setEditingField(null)}
            className="text-xs font-medium bg-slate-100 border-slate-200 rounded-md p-1 capitalize"
          >
            {Object.values(Category).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setEditingField("category");
            }}
            className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium cursor-pointer transition hover:ring-2 hover:ring-indigo-300 capitalize"
          >
            {item.category}
          </div>
        )}

        {/* Energy Level */}
        {editingField === "energyLevel" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={item.energyLevel || ""}
            onChange={(e) => {
              itemHandlers.handleUpdateItem(item.id, {
                energyLevel: (e.target.value as EnergyLevel) || undefined,
              });
              setEditingField(null);
            }}
            onBlur={() => setEditingField(null)}
            className="text-xs font-medium bg-slate-100 border-slate-200 rounded-md p-1 capitalize"
          >
            <option value="">No Energy</option>
            {Object.values(EnergyLevel).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setEditingField("energyLevel");
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 cursor-pointer hover:ring-2 hover:ring-yellow-300"
          >
            <BoltIcon className="w-3.5 h-3.5" />
            {item.energyLevel || "Energy?"}
          </div>
        )}

        {/* Location */}
        {editingField === "location" ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            defaultValue={item.location}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                handleLocationChange((e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => handleLocationChange(e.target.value)}
            className="text-xs font-medium bg-slate-100 border-slate-200 rounded-md p-1 w-32"
            placeholder="Add location"
          />
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setEditingField("location");
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:ring-2 hover:ring-blue-300 truncate max-w-[150px]"
          >
            <MapPinIcon className="w-3.5 h-3.5" />
            {item.location || "Location?"}
          </div>
        )}
      </div>

      {/* Tags & People */}
      <div className="flex items-center gap-2 flex-wrap mt-3">
        {(item.tags ?? []).map(renderTag)}

        {/* Assigned People Chips */}
        {(item.assignedPeople ?? []).map((person) => (
          <span
            key={person}
            className="flex items-center gap-1.5 bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-1 rounded-full border border-pink-200"
          >
            <UserIcon className="h-3 w-3" />
            {person}
            <button
              onClick={() => handleRemovePerson(person)}
              className="hover:text-pink-950"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}

        <button
          onClick={handleAddPerson}
          className="p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          title="Add person"
        >
          <UserIcon className="h-4 w-4" />+
        </button>

        <form onSubmit={handleTagSubmit}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder={t("taskItem.addTagPlaceholder")}
            className="text-xs bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-brand w-28 transition"
          />
        </form>
      </div>
    </>
  );
};

export default SharedItemDetails;
